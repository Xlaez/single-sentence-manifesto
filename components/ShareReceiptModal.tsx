'use client';

import React, { useRef, useState } from 'react';
import { Word, Chapter } from '@/lib/types';
import { toPng } from 'html-to-image';
import { Share2, Download, Check, X, Sparkles } from 'lucide-react';
import { typewriterAudio } from '@/lib/audio';

interface ShareReceiptModalProps {
  word: Word;
  activeChapter: Chapter;
  surroundingSentence: string;
  onClose: () => void;
}

export function ShareReceiptModal({
  word,
  activeChapter,
  surroundingSentence,
  onClose,
}: ShareReceiptModalProps) {
  const receiptCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const tweetText = encodeURIComponent(
    `I just etched word #${word.wordIndex} ("${word.wordText}") into The Single-Sentence Manifesto.\n\n` +
    `Try to ruin or veto my word:\n`
  );
  const tweetUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const xShareLink = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;

  const handleDownload = async () => {
    if (!receiptCardRef.current) return;
    try {
      setIsDownloading(true);
      typewriterAudio.playClack();
      const dataUrl = await toPng(receiptCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `manifesto-word-${word.wordIndex}-${word.wordText}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to generate receipt image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="paper-card w-full max-w-xl p-6 relative animate-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-ink-muted hover:text-ink hover:bg-paper-200 border border-ink cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-700 text-emerald-800 text-xs font-mono font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transaction Confirmed • Word Inscribed</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-ink">
            Your Mark is Permanent
          </h2>
          <p className="text-xs text-ink-muted font-mono">
            Share your official receipt to X or save it to your camera roll.
          </p>
        </div>

        {/* The Archival Share Card (16:9 Aesthetic Preview) */}
        <div
          ref={receiptCardRef}
          className="bg-paper-50 border-4 border-ink p-6 shadow-brutal my-4 text-ink font-typewriter relative overflow-hidden"
        >
          {/* Subtle background vintage watermarks */}
          <div className="absolute top-2 right-2 border-2 border-stamp-red/30 text-stamp-red/40 px-2 py-0.5 text-[10px] font-mono uppercase rotate-12 select-none">
            ARCHIVE ENTRY #{word.wordIndex}
          </div>

          <div className="border-b-2 border-ink pb-3 mb-4">
            <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono">
              OFFICIAL DISPATCH FROM
            </div>
            <div className="font-editorial font-black text-lg sm:text-xl uppercase tracking-tight text-ink">
              The Single-Sentence Manifesto
            </div>
            <div className="text-[11px] text-ink-muted font-mono">
              {activeChapter.title}
            </div>
          </div>

          {/* Sentence snippet with highlighted word */}
          <div className="my-5 p-3 bg-paper-100 border border-ink/40">
            <p className="text-xs text-ink-muted font-mono mb-1 uppercase">Living Text Snippet:</p>
            <p className="text-base sm:text-lg italic font-serif leading-relaxed text-ink">
              &ldquo;...
              <span className="font-bold font-typewriter text-stamp-red not-italic px-1 underline decoration-2 decoration-stamp-red">
                {word.wordText}
              </span>
              ...&rdquo;
            </p>
          </div>

          {/* Card footer / seal */}
          <div className="flex justify-between items-end pt-3 border-t border-ink/20 text-xs font-mono">
            <div>
              <div className="text-[10px] text-ink-muted uppercase">Etched by</div>
              <div className="font-bold text-sm text-ink">@{word.authorHandle}</div>
              <div className="text-[10px] text-ink-faint">
                {new Date(word.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block border-2 border-ink px-2 py-1 bg-amber-100 text-ink font-bold text-[11px] uppercase tracking-wider">
                \$1.00 USD • IMMUTABLE
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={xShareLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => typewriterAudio.playClack()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-ink text-paper-50 font-mono text-xs sm:text-sm font-bold uppercase hover:bg-ink-muted btn-brutal"
          >
            <Share2 className="w-4 h-4" />
            <span>Post Word to X (Twitter)</span>
          </a>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-paper-100 border-2 border-ink text-ink font-mono text-xs sm:text-sm font-bold uppercase hover:bg-paper-200 btn-brutal"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Generating...' : 'Save Card'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
