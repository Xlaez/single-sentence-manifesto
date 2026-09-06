import { NextResponse } from 'next/server';
import { getAllTransactions, getTransaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('reference');

    if (ref) {
      const tx = await getTransaction(ref);
      if (!tx) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
      return NextResponse.json({ transaction: tx });
    }

    const transactions = await getAllTransactions();
    return NextResponse.json({
      total: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error('Error in GET /api/transactions:', err);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
