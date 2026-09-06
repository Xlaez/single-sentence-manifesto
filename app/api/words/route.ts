import { NextResponse } from 'next/server';
import { getManifestoState, placeWord } from '@/lib/db';
import { validateWordInput, sanitizeHandle } from '@/lib/moderation';
import { PlaceWordPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = getManifestoState();
    return NextResponse.json(state);
  } catch (err) {
    console.error('Error fetching manifesto state:', err);
    return NextResponse.json({ error: 'Failed to fetch manifesto state' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wordText, authorHandle, authorUrl, modifierType, targetWordId } = body;

    const modType = modifierType || 'standard';

    // Validate word input
    const validation = validateWordInput(wordText, modType);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanHandle = sanitizeHandle(authorHandle);

    let cleanUrl = authorUrl ? String(authorUrl).trim() : undefined;
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const payload: PlaceWordPayload = {
      wordText: validation.cleanedWord || wordText,
      authorHandle: cleanHandle,
      authorUrl: cleanUrl,
      modifierType: modType,
      targetWordId,
    };

    const result = placeWord(payload);

    return NextResponse.json({
      success: true,
      word: result.word,
      newChapterStarted: result.newChapterStarted,
    });
  } catch (err) {
    console.error('Error in POST /api/words:', err);
    return NextResponse.json({ error: 'Failed to submit word' }, { status: 500 });
  }
}
