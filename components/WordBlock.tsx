'use client';

import React, { useState } from 'react';
import { Word } from '@/lib/types';
import { Flame, Skull, ExternalLink, Scissors, ShieldAlert } from 'lucide-react';
import { typewriterAudio } from '@/lib/audio';

interface WordBlockProps {
  word: Word;
  onReact: (wordId: string, type: 'fire' | 'skull') => void;
  onVetoTarget?: (word: Word) => void;
}

export function WordBlock({ word, onReact, onVetoTarget }: WordBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleFire = (e: React.MouseEvent) => {
    e.stopPropagation();
    typewriterAudio.playClack();
    onReact(word.id, 'fire');
  };

  const handleSkull = (e: React.MouseEvent) => {
    e.stopPropagation();
    typewriterAudio.playClack();
    onReact(word.id, 'skull');
  };

  const handleVeto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onVetoTarget) {
      onVetoTarget(word);
    }
  };

  const renderWordContent = () => {
    if (word.modifierType === 'period') {
      return (
        <span className="font-bold text-stamp-red font-serif text-2xl select-none inline-block align-baseline">
          .
        </span>
      );
    }

    if (word.modifierType === 'redacted') {
      return (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsRevealed(!isRevealed);
          }}
          className={`redacted-bar rounded-none cursor-help font-mono mx-0.5 inline-block ${
            isRevealed ? '!bg-transparent !text-ink underline decoration-wavy decoration-stamp-red' : ''
          }`}
          title="Classified Word — Click to declassify"
        >
          {isRevealed ? word.wordText : '██████'}
        </span>
      );
    }

    if (word.modifierType === 'veto') {
      return (
        <span className="inline-flex items-center gap-1 mx-0.5">
          {word.originalWordText && (
            <span className="line-through decoration-stamp-red decoration-2 text-ink-faint text-sm select-none opacity-60">
              {word.originalWordText}
            </span>
          )}
          <span className="font-bold text-stamp-red underline decoration-stamp-red/40 underline-offset-4">
            {word.wordText}
          </span>
        </span>
      );
    }

    if (word.modifierType === 'scream') {
      return (
        <span className="font-black text-ink tracking-wider uppercase bg-amber-100 border border-ink/40 px-1.5 py-0.5 rounded-none shadow-xs mx-0.5">
          {word.wordText}
        </span>
      );
    }

    // Standard word
    return (
      <span className="text-ink hover:text-stamp-red hover:underline decoration-1 underline-offset-4 transition-colors">
        {word.wordText}
      </span>
    );
  };

  return (
    <span className="relative inline-block group">
      {/* Clickable Word Token */}
      <button
        onClick={() => {
          typewriterAudio.playClack();
          setIsOpen(!isOpen);
        }}
        className="inline cursor-pointer focus:outline-none focus:ring-1 focus:ring-stamp-red py-0.5 px-0.5 text-left font-typewriter text-xl sm:text-2xl leading-relaxed"
      >
        {renderWordContent()}
      </button>

      {/* Popover Badge for Word Details & Interactions */}
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 z-50 paper-card p-3 font-mono text-xs text-ink animate-in fade-in zoom-in-95 duration-100">
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 w-3 h-3 bg-paper-50 border-r-2 border-b-2 border-ink rotate-45" />

            <div className="flex justify-between items-start border-b border-ink/20 pb-2 mb-2">
              <div>
                <span className="bg-ink text-paper-50 px-1.5 py-0.5 text-[10px] font-bold">
                  WORD #{word.wordIndex}
                </span>
                <span className="ml-2 uppercase text-[10px] tracking-wider text-ink-muted">
                  {word.modifierType}
                </span>
              </div>
              <span className="text-[10px] text-ink-faint">
                {new Date(word.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Author details */}
            <div className="mb-3">
              <div className="text-ink-muted text-[10px] uppercase">Purchased by</div>
              <a
                href={word.authorUrl || `https://x.com/${word.authorHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sm text-ink hover:text-stamp-red flex items-center gap-1 group/link"
              >
                <span>@{word.authorHandle}</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100" />
              </a>
            </div>

            {/* Veto Info if applicable */}
            {word.originalWordText && (
              <div className="mb-2 p-1.5 bg-paper-200 border border-ink/30 text-[11px]">
                <span className="text-stamp-red font-bold">Overwrote:</span> &ldquo;{word.originalWordText}&rdquo;
              </div>
            )}

            {/* Actions: React & Veto */}
            <div className="flex items-center justify-between pt-2 border-t border-ink/20 gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleFire}
                  className="flex items-center gap-1 px-2 py-1 bg-paper-200 border border-ink hover:bg-amber-200 btn-brutal text-xs"
                  title="Fire Reaction"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{word.reactions?.fire || 0}</span>
                </button>
                <button
                  onClick={handleSkull}
                  className="flex items-center gap-1 px-2 py-1 bg-paper-200 border border-ink hover:bg-red-200 btn-brutal text-xs"
                  title="Skull Reaction"
                >
                  <Skull className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{word.reactions?.skull || 0}</span>
                </button>
              </div>

              {word.modifierType !== 'period' && (
                <button
                  onClick={handleVeto}
                  className="flex items-center gap-1 px-2 py-1 bg-stamp-red text-paper-50 border border-ink hover:bg-stamp-redHover btn-brutal text-[11px] font-bold"
                  title="Veto / Replace this word for $2"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Veto ($2)</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </span>
  );
}
