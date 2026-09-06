import { NextResponse } from 'next/server';
import { placeWord, updateTransactionStatus } from '@/lib/db';
import { PlaceWordPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, simulatedPayload } = body;

    if (!reference) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
    }

    // 1. Handle Simulated Mode (for testing without live keys)
    if (reference.startsWith('sim_') && simulatedPayload) {
      await updateTransactionStatus(reference, 'success');

      const result = await placeWord({
        wordText: simulatedPayload.wordText,
        authorHandle: simulatedPayload.authorHandle,
        authorUrl: simulatedPayload.authorUrl,
        modifierType: simulatedPayload.modifierType,
        targetWordId: simulatedPayload.targetWordId,
      });

      return NextResponse.json({
        success: true,
        word: result.word,
        newChapterStarted: result.newChapterStarted,
      });
    }

    // 2. Handle Real Paystack Verification
    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack secret key is not configured' }, { status: 500 });
    }

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await paystackRes.json();
    if (!paystackRes.ok || !data.status || data.data?.status !== 'success') {
      await updateTransactionStatus(reference, 'failed');
      return NextResponse.json(
        { error: 'Payment verification failed or transaction not completed' },
        { status: 400 }
      );
    }

    await updateTransactionStatus(reference, 'success', data.data.paid_at);

    const metadata = data.data.metadata || {};
    const payload: PlaceWordPayload = {
      wordText: metadata.wordText,
      authorHandle: metadata.authorHandle,
      authorUrl: metadata.authorUrl,
      modifierType: metadata.modifierType || 'standard',
      targetWordId: metadata.targetWordId,
    };

    const result = await placeWord(payload);

    return NextResponse.json({
      success: true,
      word: result.word,
      newChapterStarted: result.newChapterStarted,
    });
  } catch (err) {
    console.error('Error in POST /api/paystack/verify:', err);
    return NextResponse.json({ error: 'Internal verification failure' }, { status: 500 });
  }
}
