'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Trophy, Flame, Skull, Award, ArrowLeft, Loader2, Crown } from 'lucide-react';
import Link from 'next/link';
import { Word } from '@/lib/types';

interface LeaderboardData {
  topAuthors: { handle: string; count: number }[];
  mostReactedWords: Word[];
  closers: {
    chapterNumber: number;
    closedByHandle: string;
    closedAt: string;
    totalWords: number;
  }[];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
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
          <div className="text-[10px] font-mono tracking-widest uppercase text-stamp-gold font-bold">
            VANITY & CLOUT METRICS
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-ink uppercase">
            The Hall of Clout
          </h1>
          <p className="text-sm text-ink-muted font-serif italic mt-1">
            Recognizing the biggest spenders, trolls, and literary closers on the internet.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center font-mono text-sm text-ink-muted">
            <Loader2 className="w-6 h-6 animate-spin text-stamp-gold mb-2" />
            <p>Tabulating internet clout...</p>
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Wordsmiths */}
            <div className="paper-card p-6">
              <div className="flex items-center gap-2 border-b-2 border-ink pb-3 mb-4">
                <Crown className="w-5 h-5 text-stamp-gold" />
                <h2 className="font-editorial font-bold text-lg text-ink uppercase">
                  Top Scribes (By Words)
                </h2>
              </div>

              {data.topAuthors.length === 0 ? (
                <p className="text-xs font-mono text-ink-muted">No scribes registered yet.</p>
              ) : (
                <ol className="divide-y divide-ink/10 font-mono text-xs">
                  {data.topAuthors.map((author, idx) => (
                    <li key={author.handle} className="py-2.5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 font-bold ${idx === 0 ? 'text-stamp-gold' : 'text-ink-muted'}`}>
                          #{idx + 1}
                        </span>
                        <a
                          href={`https://x.com/${author.handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-ink hover:text-stamp-red"
                        >
                          @{author.handle}
                        </a>
                      </div>
                      <span className="bg-paper-200 px-2 py-0.5 border border-ink text-ink font-bold">
                        {author.count} {author.count === 1 ? 'word' : 'words'}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Most Reacted Words */}
            <div className="paper-card p-6">
              <div className="flex items-center gap-2 border-b-2 border-ink pb-3 mb-4">
                <Flame className="w-5 h-5 text-stamp-red" />
                <h2 className="font-editorial font-bold text-lg text-ink uppercase">
                  Most Controversial Words
                </h2>
              </div>

              {data.mostReactedWords.length === 0 ? (
                <p className="text-xs font-mono text-ink-muted">No reactions recorded yet.</p>
              ) : (
                <ul className="divide-y divide-ink/10 font-mono text-xs">
                  {data.mostReactedWords.map((word) => (
                    <li key={word.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold font-typewriter text-sm text-ink mr-2">
                          &ldquo;{word.wordText}&rdquo;
                        </span>
                        <span className="text-[10px] text-ink-faint">
                          by @{word.authorHandle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          {word.reactions?.fire || 0}
                        </span>
                        <span className="flex items-center gap-0.5 text-ink-muted font-bold">
                          <Skull className="w-3.5 h-3.5" />
                          {word.reactions?.skull || 0}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Order of Closers */}
            <div className="paper-card p-6 md:col-span-2">
              <div className="flex items-center gap-2 border-b-2 border-ink pb-3 mb-4">
                <Award className="w-5 h-5 text-stamp-red" />
                <h2 className="font-editorial font-bold text-lg text-ink uppercase">
                  The Order of Closers (\$5 Period Finishers)
                </h2>
              </div>

              {data.closers.length === 0 ? (
                <p className="text-xs font-mono text-ink-muted">
                  No chapters have been closed yet. The throne of the First Closer remains unclaimed!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.closers.map((c) => (
                    <div key={c.chapterNumber} className="p-3 bg-paper-200 border-2 border-ink font-mono text-xs">
                      <div className="text-[10px] text-stamp-red font-bold uppercase">
                        VOLUME #{c.chapterNumber} CLOSER
                      </div>
                      <a
                        href={`https://x.com/${c.closedByHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-sm text-ink hover:text-stamp-red block my-1"
                      >
                        @{c.closedByHandle}
                      </a>
                      <div className="text-[10px] text-ink-muted">
                        Ended after {c.totalWords} words on {new Date(c.closedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
