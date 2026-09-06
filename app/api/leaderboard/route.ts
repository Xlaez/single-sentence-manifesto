import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = getLeaderboard();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
