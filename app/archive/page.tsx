'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Chapter, Word } from '@/lib/types';
import { BookOpen, Calendar, User, ArrowLeft, Loader2, Award } from 'lucide-react';
import Link from 'next/link';

interface ArchivedItem {
  chapter: Chapter;
  words: Word[];
}

export default function ArchivePage() {
  const [archives, setArchives] = useState<ArchivedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/chapters');
        if (res.ok) {
          const data = await res.json();
          setArchives(data.chapters || []);
        }
      } catch (err) {
        console.error('Failed to load archive:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-ink-muted hover:text-stamp-red"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Live Sentence</span>
          </Link>
        </div>

        {/* Section Header */}
        <div className="border-b-2 border-ink pb-4 mb-8">
          <div className="text-[10px] font-mono tracking-widest uppercase text-stamp-red font-bold">
            THE TOMES OF THE PAST
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-ink uppercase">
            The Hall of Sacred Texts
          </h1>
          <p className="text-sm text-ink-muted font-serif italic mt-1">
            Every chapter sealed by a \$5 period is preserved in this immutable registry.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center font-mono text-sm text-ink-muted">
            <Loader2 className="w-6 h-6 animate-spin text-stamp-red mb-2" />
            <p>Consulting the archives...</p>
          </div>
        ) : archives.length === 0 ? (
          <div className="paper-card p-12 text-center my-8">
            <BookOpen className="w-12 h-12 text-ink-faint mx-auto mb-3" />
            <h2 className="font-editorial text-xl font-bold text-ink">
              Chapter I is Still Being Written
            </h2>
            <p className="text-xs text-ink-muted font-mono max-w-md mx-auto mt-2">
              No volumes have been closed yet. Be the historic first person to drop the final period (`.`) for \$5.00 and earn your spot on this wall forever.
            </p>
            <Link
              href="/"
              className="inline-block mt-5 px-4 py-2 bg-stamp-red text-paper-50 font-mono text-xs font-bold uppercase btn-brutal"
            >
              Go to Live Sentence
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {archives.map(({ chapter, words }) => (
              <article
                key={chapter.id}
                className="paper-card p-6 sm:p-8 bg-paper-50 relative overflow-hidden"
              >
                {/* Chapter stamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-ink/20 pb-3 mb-4 text-xs font-mono">
                  <div>
                    <span className="bg-ink text-paper-50 px-2 py-0.5 text-[10px] font-bold uppercase mr-2">
                      VOLUME #{chapter.chapterNumber}
                    </span>
                    <span className="font-bold text-ink">{chapter.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-ink-muted mt-2 sm:mt-0 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {chapter.closedAt ? new Date(chapter.closedAt).toLocaleDateString() : 'Historical'}
                    </span>
                    <span>{chapter.totalWords} Words</span>
                  </div>
                </div>

                {/* The Full Text */}
                <p className="font-typewriter text-lg sm:text-xl leading-relaxed text-ink my-4">
                  {words.map((w) => w.wordText).join(' ')}
                </p>

                {/* Closer Credits */}
                {chapter.closedByHandle && (
                  <div className="mt-6 pt-3 border-t border-ink/20 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-stamp-red">
                      <Award className="w-4 h-4" />
                      <span className="font-bold">Sealed by Closer:</span>
                      <a
                        href={`https://x.com/${chapter.closedByHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold text-ink hover:text-stamp-red"
                      >
                        @{chapter.closedByHandle}
                      </a>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
