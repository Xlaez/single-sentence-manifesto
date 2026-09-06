import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { placeWord, updateTransactionStatus } from '@/lib/db';
import { PlaceWordPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

    if (!secretKey || !signature) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Paystack HMAC SHA512 signature
    const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      const metadata = event.data?.metadata || {};

      if (reference) {
        await updateTransactionStatus(reference, 'success', event.data?.paid_at);
      }

      if (metadata.wordText && metadata.authorHandle) {
        const payload: PlaceWordPayload = {
          wordText: metadata.wordText,
          authorHandle: metadata.authorHandle,
          authorUrl: metadata.authorUrl,
          modifierType: metadata.modifierType || 'standard',
          targetWordId: metadata.targetWordId,
        };
        await placeWord(payload);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing Paystack webhook:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
