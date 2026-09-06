'use client';

import React from 'react';
import { Word, Chapter } from '@/lib/types';
import { WordBlock } from './WordBlock';
import { Plus, PenTool, Sparkles, BookCheck } from 'lucide-react';
import { typewriterAudio } from '@/lib/audio';

interface TypewriterHeroProps {
  chapter: Chapter;
  words: Word[];
  onOpenDraft: (targetWord?: Word) => void;
  onReact: (wordId: string, type: 'fire' | 'skull') => void;
}

export function TypewriterHero({
  chapter,
  words,
  onOpenDraft,
  onReact,
}: TypewriterHeroProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Chapter Index Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-ink pb-2 mb-6 font-mono text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stamp-red uppercase">
            {chapter.title}
          </span>
          {chapter.isClosed && (
            <span className="bg-ink text-paper-50 px-1.5 py-0.5 text-[10px] font-bold uppercase">
              SEALED & ARCHIVED
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <span>{words.length} Words Etched</span>
          <span className="text-ink-faint">•</span>
          <span>Chapter #{chapter.chapterNumber}</span>
        </div>
      </div>

      {/* The Physical Parchment Sheet */}
      <div className="paper-card p-6 sm:p-12 relative min-h-[380px] bg-paper-50">
        {/* Archival Corner Watermark */}
        <div className="absolute top-3 right-3 text-[10px] font-mono text-ink-faint select-none uppercase tracking-widest hidden sm:block">
          LIVE MANIFESTO FEED
        </div>

        {/* The Continuous Flowing Sentence */}
        <div className="font-typewriter text-xl sm:text-2xl leading-loose tracking-wide text-ink break-words">
          {words.map((word, index) => (
            <React.Fragment key={word.id}>
              <WordBlock
                word={word}
                onReact={onReact}
                onVetoTarget={(target) => onOpenDraft(target)}
              />
              {/* Add spacing between words unless the next item is a period */}
              {index < words.length - 1 && ' '}
            </React.Fragment>
          ))}

          {/* Typewriter Carriage Head & Blinking Cursor */}
          {!chapter.isClosed && (
            <span className="inline-flex items-center ml-1 align-baseline select-none">
              <span className="animate-blink-cursor font-bold text-stamp-red text-2xl">
                ▌
              </span>
              <button
                onClick={() => {
                  typewriterAudio.playClack();
                  onOpenDraft();
                }}
                className="ml-3 inline-flex items-center gap-1.5 px-3 py-1 bg-ink text-paper-50 text-xs font-mono font-bold uppercase hover:bg-stamp-red btn-brutal transition-colors cursor-pointer align-middle"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Word (\$1 / ₦100)</span>
              </button>
            </span>
          )}
        </div>

        {/* If Chapter Closed */}
        {chapter.isClosed && (
          <div className="mt-8 p-4 bg-paper-200 border-2 border-stamp-red text-center font-mono text-xs">
            <BookCheck className="w-6 h-6 text-stamp-red mx-auto mb-1" />
            <p className="font-bold text-ink text-sm uppercase">This Chapter Has Been Closed</p>
            <p className="text-ink-muted mt-0.5">
              Permanently sealed by @{chapter.closedByHandle || 'anonymous'}.
            </p>
          </div>
        )}
      </div>

      {/* Quick Action Banner */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-paper-200 border-2 border-ink">
        <div className="text-xs font-mono text-ink">
          <span className="font-bold uppercase text-stamp-red">RULES OF ENGAGEMENT:</span>{' '}
          Strictly one word at a time. Words cannot be undone, only vetoed or redacted.
        </div>
        <button
          onClick={() => {
            typewriterAudio.playClack();
            onOpenDraft();
          }}
          className="w-full sm:w-auto px-6 py-3 bg-stamp-red text-paper-50 font-mono text-xs font-bold uppercase tracking-widest hover:bg-stamp-redHover btn-brutal flex items-center justify-center gap-2 cursor-pointer"
        >
          <PenTool className="w-4 h-4" />
          <span>Inscribe Word (\$1 / ₦100)</span>
        </button>
      </div>
    </div>
  );
}
