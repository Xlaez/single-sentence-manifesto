import { NextResponse } from 'next/server';
import { reactToWord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wordId, reactionType } = body;

    if (!wordId || (reactionType !== 'fire' && reactionType !== 'skull')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updatedWord = reactToWord(wordId, reactionType);
    if (!updatedWord) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reactions: updatedWord.reactions });
  } catch (err) {
    console.error('Error in POST /api/react:', err);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}
