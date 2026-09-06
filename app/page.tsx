'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ManifestoState, Word, ModifierType } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { TypewriterHero } from '@/components/TypewriterHero';
import { WordDraftModal } from '@/components/WordDraftModal';
import { ShareReceiptModal } from '@/components/ShareReceiptModal';
import { typewriterAudio } from '@/lib/audio';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [manifesto, setManifesto] = useState<ManifestoState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [targetWord, setTargetWord] = useState<Word | null>(null);

  // Viral share receipt modal state
  const [shareWord, setShareWord] = useState<Word | null>(null);

  // Fetch initial manifesto state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/words');
      if (res.ok) {
        const data: ManifestoState = await res.json();
        setManifesto(data);
      }
    } catch (err) {
      console.error('Failed to load manifesto:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Connect to Real-time SSE Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/realtime');

      eventSource.addEventListener('word_placed', (e: MessageEvent) => {
        try {
          const { word } = JSON.parse(e.data);
          typewriterAudio.playClack();
          setManifesto((prev) => {
            if (!prev) return prev;
            // Prevent duplicates
            if (prev.words.some((w) => w.id === word.id)) return prev;
            return {
              ...prev,
              words: [...prev.words, word],
              totalWordsAllTime: prev.totalWordsAllTime + 1,
            };
          });
        } catch (err) {
          console.error('Error handling word_placed event:', err);
        }
      });

      eventSource.addEventListener('word_vetoed', (e: MessageEvent) => {
        try {
          const { word } = JSON.parse(e.data);
          typewriterAudio.playClack();
          setManifesto((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              words: prev.words.map((w) => (w.id === word.id ? word : w)),
            };
          });
        } catch (err) {
          console.error('Error handling word_vetoed event:', err);
        }
      });

      eventSource.addEventListener('word_redacted', (e: MessageEvent) => {
        try {
          const { word } = JSON.parse(e.data);
          setManifesto((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              words: prev.words.map((w) => (w.id === word.id ? word : w)),
            };
          });
        } catch (err) {
          console.error('Error handling word_redacted event:', err);
        }
      });

      eventSource.addEventListener('reaction_added', (e: MessageEvent) => {
        try {
          const { wordId, reactions } = JSON.parse(e.data);
          setManifesto((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              words: prev.words.map((w) => (w.id === wordId ? { ...w, reactions } : w)),
            };
          });
        } catch (err) {
          console.error('Error handling reaction_added event:', err);
        }
      });

      eventSource.addEventListener('chapter_closed', (e: MessageEvent) => {
        try {
          const { closedChapter, nextChapter } = JSON.parse(e.data);
          typewriterAudio.playBell();

          // Confetti celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#BA2D25', '#1A1918', '#C68E17', '#F5F2EC'],
          });

          // Refresh state to roll over to next chapter
          setTimeout(() => {
            fetchState();
          }, 1500);
        } catch (err) {
          console.error('Error handling chapter_closed event:', err);
        }
      });
    } catch (err) {
      console.error('Failed to initialize SSE stream:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchState]);

  // Handle word reaction
  const handleReact = async (wordId: string, reactionType: 'fire' | 'skull') => {
    // Optimistic UI update
    setManifesto((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        words: prev.words.map((w) => {
          if (w.id === wordId) {
            return {
              ...w,
              reactions: {
                ...w.reactions,
                [reactionType]: (w.reactions[reactionType] || 0) + 1,
              },
            };
          }
          return w;
        }),
      };
    });

    try {
      await fetch('/api/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId, reactionType }),
      });
    } catch (err) {
      console.error('Failed to submit reaction:', err);
    }
  };

  // Handle word submission
  const handleSubmitWord = async (payload: {
    wordText: string;
    authorHandle: string;
    authorUrl?: string;
    modifierType: ModifierType;
    targetWordId?: string;
  }) => {
    const res = await fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to submit word.');
    }

    const data = await res.json();

    // Show share card modal immediately
    if (data.word) {
      setShareWord(data.word);
    }

    // Refresh state
    fetchState();
  };

  const handleOpenDraft = (target?: Word) => {
    setTargetWord(target || null);
    setIsDraftOpen(true);
  };

  // Build snippet of surrounding words for the share card
  const getSentenceSnippet = () => {
    if (!manifesto || manifesto.words.length === 0) return 'The Manifesto begins here...';
    return manifesto.words.map((w) => w.wordText).join(' ');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar activeCount={3} />

      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center font-mono text-sm text-ink-muted">
            <Loader2 className="w-8 h-8 animate-spin text-stamp-red mb-3" />
            <p>Retrieving Archival Record...</p>
          </div>
        ) : manifesto ? (
          <TypewriterHero
            chapter={manifesto.activeChapter}
            words={manifesto.words}
            onOpenDraft={handleOpenDraft}
            onReact={handleReact}
          />
        ) : (
          <div className="text-center py-20 font-mono text-ink-muted">
            Failed to connect to the Manifesto archive. Please refresh.
          </div>
        )}
      </main>

      {/* Word Inscription Modal */}
      <WordDraftModal
        isOpen={isDraftOpen}
        onClose={() => {
          setIsDraftOpen(false);
          setTargetWord(null);
        }}
        targetWord={targetWord}
        currentWordCount={manifesto?.words.length || 0}
        onSuccessPlaced={(placedWord) => {
          setShareWord(placedWord);
          fetchState();
        }}
      />

      {/* Viral Share Receipt Modal */}
      {shareWord && manifesto && (
        <ShareReceiptModal
          word={shareWord}
          activeChapter={manifesto.activeChapter}
          surroundingSentence={getSentenceSnippet()}
          onClose={() => setShareWord(null)}
        />
      )}

      {/* Minimal Footer */}
      <footer className="border-t-2 border-ink bg-paper-100 py-6 px-4 text-center font-mono text-xs text-ink-muted">
        <p className="max-w-md mx-auto">
          The Single-Sentence Manifesto is an immutable social experiment.
          Built for the chaotic minds of X and the digital commons.
        </p>
        <p className="text-[10px] text-ink-faint mt-2">
          EST. 2025 • POWERED BY MICROTRANSACTIONS & HUMAN NATURE
        </p>
      </footer>
    </div>
  );
}
