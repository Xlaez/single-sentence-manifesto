import { NextResponse } from 'next/server';
import { validateWordInput, sanitizeHandle } from '@/lib/moderation';
import { getAmountInSubunits, SupportedCurrency } from '@/lib/paystack';
import { ModifierType } from '@/lib/types';
import { recordTransaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      wordText,
      authorHandle,
      authorUrl,
      modifierType,
      targetWordId,
      currency = 'USD',
    } = body;

    const modType: ModifierType = modifierType || 'standard';
    const selectedCurrency: SupportedCurrency = currency === 'NGN' ? 'NGN' : 'USD';

    // Validate word
    const validation = validateWordInput(wordText, modType);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanHandle = sanitizeHandle(authorHandle);
    if (!cleanHandle) {
      return NextResponse.json({ error: 'Valid X handle required.' }, { status: 400 });
    }

    const payerEmail = email && String(email).includes('@')
      ? String(email).trim()
      : `${cleanHandle.toLowerCase()}@manifesto.lol`;

    const amountInSubunits = getAmountInSubunits(modType, selectedCurrency);
    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

    // Check if real Paystack secret key is configured
    if (secretKey && secretKey.startsWith('sk_')) {
      let finalCurrency: SupportedCurrency = selectedCurrency;
      let finalAmount = amountInSubunits;

      let paystackPayload: Record<string, unknown> = {
        email: payerEmail,
        amount: finalAmount,
        currency: finalCurrency,
        metadata: {
          wordText: validation.cleanedWord || wordText,
          authorHandle: cleanHandle,
          authorUrl: authorUrl ? String(authorUrl).trim() : undefined,
          modifierType: modType,
          targetWordId,
          custom_fields: [
            { display_name: 'Word Inscribed', variable_name: 'word_inscribed', value: validation.cleanedWord || wordText },
            { display_name: 'Author X Handle', variable_name: 'x_handle', value: `@${cleanHandle}` },
          ],
        },
      };

      let paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paystackPayload),
      });

      let data = await paystackRes.json();

      // If USD initialization failed because Paystack merchant has not activated USD settlement:
      if ((!paystackRes.ok || !data.status) && selectedCurrency === 'USD') {
        const errMsg = (data.message || '').toLowerCase();
        if (
          errMsg.includes('usd') ||
          errMsg.includes('currency') ||
          errMsg.includes('not supported') ||
          errMsg.includes('merchant') ||
          errMsg.includes('channel')
        ) {
          console.warn('Paystack USD settlement not active on merchant account. Falling back seamlessly to NGN Card checkout.');
          finalCurrency = 'NGN';
          finalAmount = getAmountInSubunits(modType, 'NGN');

          paystackPayload = {
            ...paystackPayload,
            currency: finalCurrency,
            amount: finalAmount,
          };

          paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paystackPayload),
          });

          data = await paystackRes.json();
        }
      }

      if (!paystackRes.ok || !data.status) {
        console.error('Paystack initialization error:', data);
        return NextResponse.json(
          { error: data.message || 'Failed to initialize Paystack transaction' },
          { status: 400 }
        );
      }

      // Record transaction in ledger as initialized
      await recordTransaction({
        reference: data.data.reference,
        amount: finalAmount,
        currency: finalCurrency,
        status: 'initialized',
        payerEmail,
        authorHandle: cleanHandle,
        wordText: validation.cleanedWord || wordText,
        modifierType: modType,
        targetWordId,
      });

      return NextResponse.json({
        success: true,
        reference: data.data.reference,
        accessCode: data.data.access_code,
        authorizationUrl: data.data.authorization_url,
        isSimulated: false,
      });
    }

    // Fallback Simulated Transaction (When Paystack keys are not configured yet)
    const simulatedRef = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await recordTransaction({
      reference: simulatedRef,
      amount: amountInSubunits,
      currency: selectedCurrency,
      status: 'initialized',
      payerEmail,
      authorHandle: cleanHandle,
      wordText: validation.cleanedWord || wordText,
      modifierType: modType,
      targetWordId,
    });

    return NextResponse.json({
      success: true,
      reference: simulatedRef,
      accessCode: simulatedRef,
      isSimulated: true,
      metadata: {
        wordText: validation.cleanedWord || wordText,
        authorHandle: cleanHandle,
        authorUrl: authorUrl ? String(authorUrl).trim() : undefined,
        modifierType: modType,
        targetWordId,
      },
    });
  } catch (err) {
    console.error('Error in POST /api/paystack/initialize:', err);
    return NextResponse.json(
      { error: 'Failed to initialize payment session' },
      { status: 500 }
    );
  }
}
