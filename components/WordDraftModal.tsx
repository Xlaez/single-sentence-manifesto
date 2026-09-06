'use client';

import React, { useState, useEffect } from 'react';
import { Word, ModifierType } from '@/lib/types';
import { X, Flame, ShieldAlert, Scissors, Megaphone, CheckCircle2, Lock, Sparkles, CreditCard } from 'lucide-react';
import { typewriterAudio } from '@/lib/audio';

interface WordDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWord?: Word | null;
  currentWordCount: number;
  onSubmit: (payload: {
    wordText: string;
    authorHandle: string;
    authorUrl?: string;
    modifierType: ModifierType;
    targetWordId?: string;
  }) => Promise<void>;
}

interface PowerUpOption {
  type: ModifierType;
  title: string;
  price: string;
  desc: string;
  badge: string;
}

const POWER_UPS: PowerUpOption[] = [
  {
    type: 'standard',
    title: 'Standard Word',
    price: '$1.00',
    desc: 'Append exactly one word to the active sentence.',
    badge: 'Standard',
  },
  {
    type: 'veto',
    title: 'The Veto (Strikethrough)',
    price: '$2.00',
    desc: 'Cross out the previous word in blood-red ink and replace it.',
    badge: 'Sabotage',
  },
  {
    type: 'scream',
    title: 'ALL-CAPS SCREAM',
    price: '$2.00',
    desc: 'Enlarged bold typography encased in an ink stamp.',
    badge: 'Loud',
  },
  {
    type: 'redacted',
    title: 'CIA Redaction',
    price: '$1.00',
    desc: 'Blacked-out classified bar. Clickable to reveal original text.',
    badge: 'Classified',
  },
  {
    type: 'period',
    title: 'The Period (Closer)',
    price: '$5.00',
    desc: 'End this chapter forever, crown yourself Closer, and spawn Chapter N+1.',
    badge: 'Finale',
  },
];

export function WordDraftModal({
  isOpen,
  onClose,
  targetWord,
  currentWordCount,
  onSubmit,
}: WordDraftModalProps) {
  const [modifierType, setModifierType] = useState<ModifierType>('standard');
  const [wordText, setWordText] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (targetWord) {
      setModifierType('veto');
    } else {
      setModifierType('standard');
    }
  }, [targetWord]);

  if (!isOpen) return null;

  const currentPrice = POWER_UPS.find((p) => p.type === modifierType)?.price || '$1.00';

  const handleWordChange = (val: string) => {
    // Only mechanical sound on input
    typewriterAudio.playClack();
    setValidationError(null);

    // Prevent spacebar or multiple words
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
      setIsSubmitting(true);
      typewriterAudio.playCarriageReturn();

      await onSubmit({
        wordText: modifierType === 'period' ? '.' : wordText.trim(),
        authorHandle: authorHandle.trim(),
        authorUrl: authorUrl.trim() || undefined,
        modifierType,
        targetWordId: targetWord?.id,
      });

      // Clear state
      setWordText('');
      setAuthorHandle('');
      setAuthorUrl('');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed. Please try again.';
      setValidationError(message);
    } finally {
      setIsSubmitting(false);
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
          <div className="text-[10px] font-mono tracking-widest uppercase text-stamp-red font-bold">
            IMMUTABLE PUBLIC ARCHIVE • WORD #{currentWordCount + 1}
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
                      {power.price}
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
                placeholder="e.g. relentlessly"
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

          {/* Author info */}
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
                4. Link (Optional URL)
              </label>
              <input
                type="url"
                value={authorUrl}
                onChange={(e) => setAuthorUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-1.5 border-2 border-ink bg-paper-50 font-mono text-xs text-ink focus:outline-none"
              />
            </div>
          </div>

          {/* Error notice */}
          {validationError && (
            <div className="p-2 bg-red-100 border border-stamp-red text-stamp-red text-xs font-mono font-bold">
              {validationError}
            </div>
          )}

          {/* One-Tap Checkout Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-stamp-red text-paper-50 font-mono text-sm font-bold uppercase tracking-wider hover:bg-stamp-redHover btn-brutal flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Inscribing Into Stone...'
                  : `Pay ${currentPrice} & Inscribe Word`}
              </span>
            </button>
            <p className="text-[10px] text-center text-ink-faint font-mono mt-2">
              🔒 Instant 1-Tap Checkout • Microtransaction simulated for frictionless testing
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
