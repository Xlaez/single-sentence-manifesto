import { NextResponse } from 'next/server';
import { getArchivedChapters } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const chapters = await getArchivedChapters();
    return NextResponse.json({ chapters });
  } catch (err) {
    console.error('Error fetching archived chapters:', err);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}
