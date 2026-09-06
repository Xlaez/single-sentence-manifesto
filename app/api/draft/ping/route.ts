import { NextResponse } from 'next/server';
import { broadcaster } from '@/lib/events';
import { sanitizeHandle } from '@/lib/moderation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { authorHandle } = body;
    const cleanHandle = sanitizeHandle(authorHandle || 'someone');

    const expiresAt = Date.now() + 30000; // 30-second drafting window

    broadcaster.broadcast('drafting_active', {
      authorHandle: cleanHandle,
      expiresAt,
    });

    return NextResponse.json({ success: true, expiresAt });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to broadcast draft ping' }, { status: 500 });
  }
}
