'use client';

import React, { useState, useEffect } from 'react';
import { Word, ModifierType } from '@/lib/types';
import { X, Scissors, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { typewriterAudio } from '@/lib/audio';
import { SupportedCurrency, getPriceDisplay } from '@/lib/paystack';

interface WordDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWord?: Word | null;
  currentWordCount: number;
  onSuccessPlaced: (word: Word) => void;
}

interface PowerUpOption {
  type: ModifierType;
  title: string;
  desc: string;
}

const POWER_UPS: PowerUpOption[] = [
  {
    type: 'standard',
    title: 'Standard Word',
    desc: 'Append exactly one word to the active sentence.',
  },
  {
    type: 'veto',
    title: 'The Veto (Strikethrough)',
    desc: 'Cross out the previous word in blood-red ink and replace it.',
  },
  {
    type: 'scream',
    title: 'ALL-CAPS SCREAM',
    desc: 'Enlarged bold typography encased in an ink stamp.',
  },
  {
    type: 'redacted',
    title: 'CIA Redaction',
    desc: 'Blacked-out classified bar. Clickable to reveal original text.',
  },
  {
    type: 'period',
    title: 'The Period (Closer)',
    desc: 'End this chapter forever, crown yourself Closer, and spawn Chapter N+1.',
  },
];

export function WordDraftModal({
  isOpen,
  onClose,
  targetWord,
  currentWordCount,
  onSuccessPlaced,
}: WordDraftModalProps) {
  const [modifierType, setModifierType] = useState<ModifierType>('standard');
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [wordText, setWordText] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (targetWord) {
      setModifierType('veto');
    } else {
      setModifierType('standard');
    }
  }, [targetWord]);

  if (!isOpen) return null;

  const currentPriceDisplay = getPriceDisplay(modifierType, currency);

  const handleWordChange = (val: string) => {
    typewriterAudio.playClack();
    setValidationError(null);

    if (val.includes(' ')) {
      setValidationError('Strictly ONE word allowed! Spaces are forbidden.');
      return;
    }
    setWordText(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (modifierType !== 'period' && (!wordText || !wordText.trim())) {
      setValidationError('Please enter a word.');
      return;
    }

    if (modifierType !== 'period' && wordText.trim().length > 28) {
      setValidationError('Maximum 28 characters per word.');
      return;
    }

    if (!authorHandle || !authorHandle.trim()) {
      setValidationError('Please enter your X (Twitter) handle.');
      return;
    }

    try {
      setIsProcessing(true);
      typewriterAudio.playCarriageReturn();

      // 1. Initialize session with backend
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authorEmail.trim() || undefined,
          wordText: modifierType === 'period' ? '.' : wordText.trim(),
          authorHandle: authorHandle.trim(),
          authorUrl: authorUrl.trim() || undefined,
          modifierType,
          targetWordId: targetWord?.id,
          currency,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.success) {
        throw new Error(initData.error || 'Failed to initialize payment.');
      }

      // 2A. Simulated mode (when Paystack live keys are pending)
      if (initData.isSimulated) {
        const verifyRes = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: initData.reference,
            simulatedPayload: initData.metadata,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || 'Failed to place word.');
        }

        typewriterAudio.playClack();
        onSuccessPlaced(verifyData.word);
        onClose();
        return;
      }

      // 2B. Real Paystack Inline Modal
      const { default: PaystackPop } = await import('@paystack/inline-js');
      const popup = new PaystackPop();

      popup.resumeTransaction(initData.accessCode, {
        onSuccess: async (transaction) => {
          try {
            const verifyRes = await fetch('/api/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: transaction.reference }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.word) {
              typewriterAudio.playClack();
              onSuccessPlaced(verifyData.word);
              onClose();
            }
          } catch (vErr) {
            console.error('Failed to verify Paystack transaction:', vErr);
          }
        },
        onCancel: () => {
          setIsProcessing(false);
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed. Please try again.';
      setValidationError(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="paper-card w-full max-w-xl p-5 sm:p-7 relative animate-in zoom-in-95 duration-150 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-ink-muted hover:text-ink hover:bg-paper-200 border border-ink cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b-2 border-ink pb-3 mb-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-stamp-red font-bold">
              PAYSTACK PAYWALL • WORD #{currentWordCount + 1}
            </span>
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-paper-200 border border-ink p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 font-bold cursor-pointer ${
                  currency === 'USD' ? 'bg-ink text-paper-50' : 'text-ink hover:bg-paper-300'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('NGN')}
                className={`px-2 py-0.5 font-bold cursor-pointer ${
                  currency === 'NGN' ? 'bg-ink text-paper-50' : 'text-ink hover:bg-paper-300'
                }`}
              >
                NGN (₦)
              </button>
            </div>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-ink">
            Etch Your Word Into History
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Power-Up Tier Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-ink-muted mb-2 font-bold">
              1. Choose Your Inscription Power
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POWER_UPS.map((power) => (
                <button
                  type="button"
                  key={power.type}
                  onClick={() => {
                    typewriterAudio.playClack();
                    setModifierType(power.type);
                  }}
                  className={`text-left p-2.5 border-2 transition-all cursor-pointer ${
                    modifierType === power.type
                      ? 'border-stamp-red bg-paper-200 shadow-brutal-sm'
                      : 'border-ink/40 bg-paper-50 hover:border-ink hover:bg-paper-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold font-mono text-xs text-ink">{power.title}</span>
                    <span className="font-mono text-xs font-black px-1.5 py-0.5 bg-ink text-paper-50">
                      {getPriceDisplay(power.type, currency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted font-sans leading-tight">
                    {power.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Veto Target Warning if applicable */}
          {modifierType === 'veto' && targetWord && (
            <div className="p-3 bg-red-50 border-2 border-stamp-red text-xs font-mono">
              <span className="font-bold text-stamp-red uppercase">Target Word for Destruction:</span>{' '}
              <span className="font-bold underline decoration-stamp-red">
                &ldquo;{targetWord.wordText}&rdquo;
              </span>{' '}
              by @{targetWord.authorHandle}.
            </div>
          )}

          {/* Word Input (disabled if period) */}
          {modifierType !== 'period' ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono uppercase text-ink-muted font-bold">
                  2. Your Word (One Word Only)
                </label>
                <span className="text-[11px] font-mono text-ink-faint">
                  {wordText.length}/28 characters
                </span>
              </div>
              <input
                type="text"
                value={wordText}
                onChange={(e) => handleWordChange(e.target.value)}
                placeholder="e.g. unhinged"
                maxLength={28}
                autoFocus
                className="w-full px-3 py-2 border-2 border-ink bg-paper-50 font-typewriter text-xl font-bold text-ink focus:outline-none focus:border-stamp-red"
              />
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border-2 border-stamp-gold text-xs font-mono text-ink">
              <span className="font-bold text-stamp-gold uppercase">FINALE TRIGGER:</span> Submitting will place the final period (`.`), lock this chapter permanently, trigger global fanfare, and engrave your name as the Volume Closer!
            </div>
          )}

          {/* Author info & optional email for receipt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-ink-muted mb-1 font-bold">
                3. Your X Handle
              </label>
              <div className="flex items-center border-2 border-ink bg-paper-50">
                <span className="px-2 font-mono font-bold text-ink-muted text-sm select-none border-r border-ink">
                  @
                </span>
                <input
                  type="text"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="elonmusk"
                  maxLength={15}
                  required
                  className="w-full px-2 py-1.5 font-mono text-sm text-ink focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-muted mb-1 font-bold">
                4. Email (For Receipt)
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="Optional receipt email"
                className="w-full px-3 py-1.5 border-2 border-ink bg-paper-50 font-mono text-xs text-ink focus:outline-none"
              />
            </div>
          </div>

          {/* Error notice */}
          {validationError && (
            <div className="p-2 bg-red-100 border border-stamp-red text-stamp-red text-xs font-mono font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Paystack Checkout Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-stamp-red text-paper-50 font-mono text-sm font-bold uppercase tracking-wider hover:bg-stamp-redHover btn-brutal flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Connecting to Paystack...'
                  : `Pay ${currentPriceDisplay} with Paystack`}
              </span>
            </button>
            <p className="text-[10px] text-center text-ink-faint font-mono mt-2 flex items-center justify-center gap-1">
              <span>🔒 Secured by Paystack (Supports Apple Pay, Cards & Bank Transfers)</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
