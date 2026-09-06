'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Sparkles, BookOpen, Trophy, ScrollText } from 'lucide-react';
import { typewriterAudio } from '@/lib/audio';

export function Navbar({ activeCount = 1 }: { activeCount?: number }) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(typewriterAudio.isMuted);
  }, []);

  const toggleSound = () => {
    typewriterAudio.isMuted = !typewriterAudio.isMuted;
    setIsMuted(typewriterAudio.isMuted);
    if (!typewriterAudio.isMuted) {
      typewriterAudio.playClack();
    }
  };

  return (
    <header className="border-b-2 border-ink bg-paper-100">
      {/* Top micro-banner */}
      <div className="bg-ink text-paper-50 px-4 py-1.5 text-xs flex justify-between items-center tracking-widest uppercase font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span className="text-emerald-400 font-bold">LIVE HIVE-TRANSMISSION</span>
          <span className="hidden sm:inline text-ink-faint">|</span>
          <span className="hidden sm:inline text-paper-300">$1 / ₦100 PER WORD</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-paper-300">{activeCount} Scribes Online</span>
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Typewriter Sounds' : 'Mute Typewriter Sounds'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-6xl mx-auto px-4 py-6 text-center relative">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-muted mb-1 font-mono">
          The Longest Democratic Sentence in Human History
        </p>
        <Link href="/" className="inline-block">
          <h1 className="font-editorial text-3xl sm:text-5xl font-black text-ink tracking-tight uppercase hover:text-stamp-red transition-colors">
            The Single-Sentence Manifesto
          </h1>
        </Link>
        <div className="w-24 h-0.5 bg-stamp-red mx-auto my-3" />
        <p className="text-xs sm:text-sm text-ink-muted italic font-serif max-w-lg mx-auto">
          &ldquo;Every word purchased at \$1 / ₦100 is carved into the permanent record of internet absurdity.&rdquo;
        </p>

        {/* Navigation tabs */}
        <nav className="flex justify-center items-center gap-2 sm:gap-4 mt-5 text-xs sm:text-sm font-mono uppercase">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink bg-paper-50 text-ink hover:bg-paper-200 btn-brutal font-bold"
          >
            <ScrollText className="w-4 h-4 text-stamp-red" />
            <span>The Sentence</span>
          </Link>
          <Link
            href="/archive"
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink bg-paper-50 text-ink hover:bg-paper-200 btn-brutal font-bold"
          >
            <BookOpen className="w-4 h-4 text-stamp-red" />
            <span>Hall of Sacred Texts</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink bg-paper-50 text-ink hover:bg-paper-200 btn-brutal font-bold"
          >
            <Trophy className="w-4 h-4 text-stamp-gold" />
            <span>Hall of Clout</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
