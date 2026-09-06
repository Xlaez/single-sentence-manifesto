import fs from 'fs';
import path from 'path';
import { Chapter, Word, ManifestoState, PlaceWordPayload, ModifierType, Transaction } from './types';
import { broadcaster } from './events';
import { getSupabase, isSupabaseConfigured } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'manifesto.json');

interface StoredData {
  chapters: Chapter[];
  words: Word[];
  transactions: Transaction[];
}

const INITIAL_CHAPTER: Chapter = {
  id: 'chap-1',
  chapterNumber: 1,
  title: 'Chapter I: The First Words of the Hivemind',
  isClosed: false,
  totalWords: 7,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};

const SEED_WORDS: Word[] = [
  {
    id: 'w-1',
    chapterId: 'chap-1',
    wordText: 'In',
    wordIndex: 1,
    authorHandle: 'genesis_agent',
    authorUrl: 'https://x.com',
    modifierType: 'standard',
    reactions: { fire: 14, skull: 0 },
    createdAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'w-2',
    chapterId: 'chap-1',
    wordText: 'the',
    wordIndex: 2,
    authorHandle: 'cyber_scribe',
    modifierType: 'standard',
    reactions: { fire: 5, skull: 1 },
    createdAt: new Date(Date.now() - 3400000).toISOString(),
  },
  {
    id: 'w-3',
    chapterId: 'chap-1',
    wordText: 'beginning',
    wordIndex: 3,
    authorHandle: 'philosopher_x',
    modifierType: 'standard',
    reactions: { fire: 9, skull: 0 },
    createdAt: new Date(Date.now() - 3300000).toISOString(),
  },
  {
    id: 'w-4',
    chapterId: 'chap-1',
    wordText: 'the',
    wordIndex: 4,
    authorHandle: 'pixel_tycoon',
    modifierType: 'standard',
    reactions: { fire: 3, skull: 0 },
    createdAt: new Date(Date.now() - 3200000).toISOString(),
  },
  {
    id: 'w-5',
    chapterId: 'chap-1',
    wordText: 'INTERNET',
    wordIndex: 5,
    authorHandle: 'loud_keyboard',
    modifierType: 'scream',
    reactions: { fire: 27, skull: 2 },
    createdAt: new Date(Date.now() - 3100000).toISOString(),
  },
  {
    id: 'w-6',
    chapterId: 'chap-1',
    wordText: 'demanded',
    wordIndex: 6,
    authorHandle: 'shitpost_daily',
    modifierType: 'standard',
    reactions: { fire: 12, skull: 1 },
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'w-7',
    chapterId: 'chap-1',
    wordText: 'chaos',
    wordIndex: 7,
    authorHandle: 'anarchy_dev',
    modifierType: 'standard',
    reactions: { fire: 42, skull: 3 },
    createdAt: new Date(Date.now() - 2900000).toISOString(),
  },
];

function readData(): StoredData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: StoredData = {
        chapters: [INITIAL_CHAPTER],
        words: SEED_WORDS,
        transactions: [],
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.transactions) parsed.transactions = [];
    return parsed;
  } catch (err) {
    console.error('Failed to read data file, returning initial state:', err);
    return {
      chapters: [INITIAL_CHAPTER],
      words: SEED_WORDS,
      transactions: [],
    };
  }
}

function writeData(data: StoredData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write data file:', err);
  }
}

// ---------------------------------------------------------------------------
// 1. MANIFESTO STATE (READ)
// ---------------------------------------------------------------------------
export async function getManifestoState(): Promise<ManifestoState> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      // Fetch active chapter
      const { data: chapters, error: chapErr } = await supabase
        .from('chapters')
        .select('*')
        .order('chapter_number', { ascending: false });

      if (chapErr) throw chapErr;

      let activeChapter = chapters?.find((c) => !c.is_closed);
      if (!activeChapter && chapters && chapters.length > 0) {
        activeChapter = chapters[0];
      }

      if (!activeChapter) {
        activeChapter = {
          id: 'chap-1',
          chapter_number: 1,
          title: 'Chapter I: The First Words of the Hivemind',
          is_closed: false,
          total_words: 0,
          created_at: new Date().toISOString(),
        };
      }

      // Fetch words for active chapter
      const { data: wordsData, error: wordsErr } = await supabase
        .from('words')
        .select('*')
        .eq('chapter_id', activeChapter.id)
        .order('word_index', { ascending: true });

      if (wordsErr) throw wordsErr;

      const words: Word[] = (wordsData || []).map((w) => ({
        id: w.id,
        chapterId: w.chapter_id,
        wordText: w.word_text,
        wordIndex: w.word_index,
        authorHandle: w.author_handle,
        authorUrl: w.author_url,
        modifierType: w.modifier_type as ModifierType,
        originalWordText: w.original_word_text,
        reactions: { fire: w.fire_reactions || 0, skull: w.skull_reactions || 0 },
        createdAt: w.created_at,
      }));

      const totalVolumesArchived = chapters?.filter((c) => c.is_closed).length || 0;

      const formattedActiveChapter: Chapter = {
        id: activeChapter.id,
        chapterNumber: activeChapter.chapter_number,
        title: activeChapter.title,
        isClosed: activeChapter.is_closed,
        closedByHandle: activeChapter.closed_by_handle,
        totalWords: activeChapter.total_words,
        createdAt: activeChapter.created_at,
        closedAt: activeChapter.closed_at,
      };

      return {
        activeChapter: formattedActiveChapter,
        words,
        totalVolumesArchived,
        totalWordsAllTime: words.length,
      };
    } catch (err) {
      console.error('Supabase query failed, falling back to local store:', err);
    }
  }

  // Fallback to local store
  const data = readData();
  const activeChapter = data.chapters.find((c) => !c.isClosed) ?? data.chapters[data.chapters.length - 1];
  const wordsForActive = data.words.filter((w) => w.chapterId === activeChapter.id);

  const totalVolumesArchived = data.chapters.filter((c) => c.isClosed).length;
  const totalWordsAllTime = data.words.length;

  return {
    activeChapter,
    words: wordsForActive,
    totalVolumesArchived,
    totalWordsAllTime,
  };
}

// ---------------------------------------------------------------------------
// 2. PLACE WORD (WRITE)
// ---------------------------------------------------------------------------
export async function placeWord(
  payload: PlaceWordPayload
): Promise<{ word: Word; newChapterStarted?: boolean }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      // Fetch or create active chapter
      let { data: activeChap } = await supabase
        .from('chapters')
        .select('*')
        .eq('is_closed', false)
        .order('chapter_number', { ascending: false })
        .limit(1)
        .single();

      if (!activeChap) {
        const { count } = await supabase.from('chapters').select('*', { count: 'exact', head: true });
        const nextNum = (count || 0) + 1;
        const { data: created } = await supabase
          .from('chapters')
          .insert({
            chapter_number: nextNum,
            title: `Chapter ${nextNum}: The Continued Discourse`,
            is_closed: false,
            total_words: 0,
          })
          .select()
          .single();
        activeChap = created;
      }

      // Count current words
      const { count: wordCount } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('chapter_id', activeChap.id);

      const nextIndex = (wordCount || 0) + 1;

      // Handle Period
      if (payload.modifierType === 'period') {
        const { data: periodWord } = await supabase
          .from('words')
          .insert({
            chapter_id: activeChap.id,
            word_text: '.',
            word_index: nextIndex,
            author_handle: payload.authorHandle,
            author_url: payload.authorUrl,
            modifier_type: 'period',
          })
          .select()
          .single();

        // Close active chapter
        await supabase
          .from('chapters')
          .update({
            is_closed: true,
            closed_by_handle: payload.authorHandle,
            closed_at: new Date().toISOString(),
            total_words: nextIndex,
          })
          .eq('id', activeChap.id);

        // Spawn next chapter
        const nextChapNum = activeChap.chapter_number + 1;
        const { data: nextChapter } = await supabase
          .from('chapters')
          .insert({
            chapter_number: nextChapNum,
            title: `Chapter ${nextChapNum}: The New Reckoning`,
            is_closed: false,
            total_words: 0,
          })
          .select()
          .single();

        const formattedWord: Word = {
          id: periodWord.id,
          chapterId: periodWord.chapter_id,
          wordText: periodWord.word_text,
          wordIndex: periodWord.word_index,
          authorHandle: periodWord.author_handle,
          authorUrl: periodWord.author_url,
          modifierType: 'period',
          reactions: { fire: 0, skull: 0 },
          createdAt: periodWord.created_at,
        };

        broadcaster.broadcast('word_placed', { word: formattedWord });
        broadcaster.broadcast('chapter_closed', { closedChapter: activeChap, nextChapter });

        return { word: formattedWord, newChapterStarted: true };
      }

      // Handle Veto
      if (payload.modifierType === 'veto' && payload.targetWordId) {
        const { data: target } = await supabase
          .from('words')
          .select('*')
          .eq('id', payload.targetWordId)
          .single();

        if (target) {
          const { data: updated } = await supabase
            .from('words')
            .update({
              word_text: payload.wordText,
              modifier_type: 'veto',
              original_word_text: target.word_text,
              author_handle: payload.authorHandle,
              author_url: payload.authorUrl,
            })
            .eq('id', payload.targetWordId)
            .select()
            .single();

          const formattedWord: Word = {
            id: updated.id,
            chapterId: updated.chapter_id,
            wordText: updated.word_text,
            wordIndex: updated.word_index,
            authorHandle: updated.author_handle,
            authorUrl: updated.author_url,
            modifierType: 'veto',
            originalWordText: updated.original_word_text,
            reactions: { fire: updated.fire_reactions || 0, skull: updated.skull_reactions || 0 },
            createdAt: updated.created_at,
          };

          broadcaster.broadcast('word_vetoed', { word: formattedWord, previousText: target.word_text });
          return { word: formattedWord };
        }
      }

      // Standard / Scream / Redacted
      const textToStore =
        payload.modifierType === 'scream'
          ? payload.wordText.toUpperCase()
          : payload.wordText;

      const { data: newWord } = await supabase
        .from('words')
        .insert({
          chapter_id: activeChap.id,
          word_text: textToStore,
          word_index: nextIndex,
          author_handle: payload.authorHandle,
          author_url: payload.authorUrl,
          modifier_type: payload.modifierType,
        })
        .select()
        .single();

      await supabase
        .from('chapters')
        .update({ total_words: nextIndex })
        .eq('id', activeChap.id);

      const formattedWord: Word = {
        id: newWord.id,
        chapterId: newWord.chapter_id,
        wordText: newWord.word_text,
        wordIndex: newWord.word_index,
        authorHandle: newWord.author_handle,
        authorUrl: newWord.author_url,
        modifierType: newWord.modifier_type as ModifierType,
        reactions: { fire: 0, skull: 0 },
        createdAt: newWord.created_at,
      };

      broadcaster.broadcast('word_placed', { word: formattedWord });
      return { word: formattedWord };
    } catch (err) {
      console.error('Supabase placeWord failed, falling back to local store:', err);
    }
  }

  // Fallback to local store
  const data = readData();
  let activeChapter = data.chapters.find((c) => !c.isClosed);

  if (!activeChapter) {
    activeChapter = {
      id: `chap-${data.chapters.length + 1}`,
      chapterNumber: data.chapters.length + 1,
      title: `Chapter ${data.chapters.length + 1}: The Continued Discourse`,
      isClosed: false,
      totalWords: 0,
      createdAt: new Date().toISOString(),
    };
    data.chapters.push(activeChapter);
  }

  const currentWords = data.words.filter((w) => w.chapterId === activeChapter!.id);

  if (payload.modifierType === 'period') {
    const periodWord: Word = {
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      chapterId: activeChapter.id,
      wordText: '.',
      wordIndex: currentWords.length + 1,
      authorHandle: payload.authorHandle,
      authorUrl: payload.authorUrl,
      modifierType: 'period',
      reactions: { fire: 0, skull: 0 },
      createdAt: new Date().toISOString(),
    };

    data.words.push(periodWord);
    activeChapter.isClosed = true;
    activeChapter.closedByHandle = payload.authorHandle;
    activeChapter.closedAt = new Date().toISOString();
    activeChapter.totalWords = currentWords.length + 1;

    const nextChapterNumber = activeChapter.chapterNumber + 1;
    const nextChapter: Chapter = {
      id: `chap-${nextChapterNumber}`,
      chapterNumber: nextChapterNumber,
      title: `Chapter ${nextChapterNumber}: The New Reckoning`,
      isClosed: false,
      totalWords: 0,
      createdAt: new Date().toISOString(),
    };
    data.chapters.push(nextChapter);
    writeData(data);

    broadcaster.broadcast('word_placed', { word: periodWord });
    broadcaster.broadcast('chapter_closed', { closedChapter: activeChapter, nextChapter });

    return { word: periodWord, newChapterStarted: true };
  }

  if (payload.modifierType === 'veto' && payload.targetWordId) {
    const targetIdx = data.words.findIndex((w) => w.id === payload.targetWordId);
    if (targetIdx !== -1) {
      const target = data.words[targetIdx];
      const previousText = target.wordText;

      const vetoWord: Word = {
        ...target,
        wordText: payload.wordText,
        modifierType: 'veto',
        originalWordText: previousText,
        authorHandle: payload.authorHandle,
        authorUrl: payload.authorUrl,
        createdAt: new Date().toISOString(),
      };

      data.words[targetIdx] = vetoWord;
      writeData(data);
      broadcaster.broadcast('word_vetoed', { word: vetoWord, previousText });
      return { word: vetoWord };
    }
  }

  const newWord: Word = {
    id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    chapterId: activeChapter.id,
    wordText: payload.modifierType === 'scream' ? payload.wordText.toUpperCase() : payload.wordText,
    wordIndex: currentWords.length + 1,
    authorHandle: payload.authorHandle,
    authorUrl: payload.authorUrl,
    modifierType: payload.modifierType,
    reactions: { fire: 0, skull: 0 },
    createdAt: new Date().toISOString(),
  };

  data.words.push(newWord);
  activeChapter.totalWords = currentWords.length + 1;
  writeData(data);

  broadcaster.broadcast('word_placed', { word: newWord });
  return { word: newWord };
}

// ---------------------------------------------------------------------------
// 3. REACTIONS
// ---------------------------------------------------------------------------
export async function reactToWord(wordId: string, reactionType: 'fire' | 'skull'): Promise<Word | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.rpc('increment_word_reaction', {
        p_word_id: wordId,
        p_reaction_type: reactionType,
      });

      const { data: updated } = await supabase
        .from('words')
        .select('*')
        .eq('id', wordId)
        .single();

      if (updated) {
        const reactions = { fire: updated.fire_reactions || 0, skull: updated.skull_reactions || 0 };
        broadcaster.broadcast('reaction_added', { wordId, reactions });
        return {
          id: updated.id,
          chapterId: updated.chapter_id,
          wordText: updated.word_text,
          wordIndex: updated.word_index,
          authorHandle: updated.author_handle,
          modifierType: updated.modifier_type as ModifierType,
          reactions,
          createdAt: updated.created_at,
        };
      }
    } catch (err) {
      console.error('Supabase reaction RPC failed, falling back to local store:', err);
    }
  }

  const data = readData();
  const word = data.words.find((w) => w.id === wordId);
  if (!word) return null;

  if (reactionType === 'fire') {
    word.reactions.fire = (word.reactions.fire || 0) + 1;
  } else {
    word.reactions.skull = (word.reactions.skull || 0) + 1;
  }

  writeData(data);
  broadcaster.broadcast('reaction_added', { wordId, reactions: word.reactions });
  return word;
}

// ---------------------------------------------------------------------------
// 4. ARCHIVED CHAPTERS
// ---------------------------------------------------------------------------
export async function getArchivedChapters(): Promise<{ chapter: Chapter; words: Word[] }[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: closedChaps } = await supabase
        .from('chapters')
        .select('*')
        .eq('is_closed', true)
        .order('chapter_number', { ascending: false });

      if (closedChaps && closedChaps.length > 0) {
        const chapIds = closedChaps.map((c) => c.id);
        const { data: wordsData } = await supabase
          .from('words')
          .select('*')
          .in('chapter_id', chapIds)
          .order('word_index', { ascending: true });

        return closedChaps.map((c) => ({
          chapter: {
            id: c.id,
            chapterNumber: c.chapter_number,
            title: c.title,
            isClosed: true,
            closedByHandle: c.closed_by_handle,
            totalWords: c.total_words,
            createdAt: c.created_at,
            closedAt: c.closed_at,
          },
          words: (wordsData || [])
            .filter((w) => w.chapter_id === c.id)
            .map((w) => ({
              id: w.id,
              chapterId: w.chapter_id,
              wordText: w.word_text,
              wordIndex: w.word_index,
              authorHandle: w.author_handle,
              modifierType: w.modifier_type as ModifierType,
              reactions: { fire: w.fire_reactions || 0, skull: w.skull_reactions || 0 },
              createdAt: w.created_at,
            })),
        }));
      }
    } catch (err) {
      console.error('Supabase getArchivedChapters failed, falling back:', err);
    }
  }

  const data = readData();
  const closed = data.chapters.filter((c) => c.isClosed);
  return closed.map((chap) => ({
    chapter: chap,
    words: data.words.filter((w) => w.chapterId === chap.id),
  }));
}

// ---------------------------------------------------------------------------
// 5. TRANSACTIONS AUDIT LEDGER
// ---------------------------------------------------------------------------
export async function recordTransaction(
  tx: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          reference: tx.reference,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          payer_email: tx.payerEmail,
          author_handle: tx.authorHandle,
          word_text: tx.wordText,
          modifier_type: tx.modifierType,
          target_word_id: tx.targetWordId,
        })
        .select()
        .single();

      if (data) {
        return {
          id: data.id,
          reference: data.reference,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          payerEmail: data.payer_email,
          authorHandle: data.author_handle,
          wordText: data.word_text,
          modifierType: data.modifier_type,
          targetWordId: data.target_word_id,
          createdAt: data.created_at,
          paidAt: data.paid_at,
        };
      }
    } catch (err) {
      console.error('Supabase recordTransaction failed, falling back to local store:', err);
    }
  }

  // Local store fallback
  const data = readData();
  const newTx: Transaction = {
    ...tx,
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  data.transactions.unshift(newTx);
  writeData(data);
  return newTx;
}

export async function updateTransactionStatus(
  reference: string,
  status: 'success' | 'failed',
  paidAt?: string
): Promise<Transaction | null> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data } = await supabase
        .from('transactions')
        .update({
          status,
          paid_at: paidAt || new Date().toISOString(),
        })
        .eq('reference', reference)
        .select()
        .single();

      if (data) {
        return {
          id: data.id,
          reference: data.reference,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          payerEmail: data.payer_email,
          authorHandle: data.author_handle,
          wordText: data.word_text,
          modifierType: data.modifier_type,
          targetWordId: data.target_word_id,
          createdAt: data.created_at,
          paidAt: data.paid_at,
        };
      }
    } catch (err) {
      console.error('Supabase updateTransactionStatus failed, falling back:', err);
    }
  }

  const data = readData();
  const tx = data.transactions.find((t) => t.reference === reference);
  if (!tx) return null;

  tx.status = status;
  if (paidAt || status === 'success') {
    tx.paidAt = paidAt || new Date().toISOString();
  }

  writeData(data);
  return tx;
}

export async function getTransaction(reference: string): Promise<Transaction | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference', reference)
        .single();
      if (data) {
        return {
          id: data.id,
          reference: data.reference,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          payerEmail: data.payer_email,
          authorHandle: data.author_handle,
          wordText: data.word_text,
          modifierType: data.modifier_type,
          targetWordId: data.target_word_id,
          createdAt: data.created_at,
          paidAt: data.paid_at,
        };
      }
    } catch (err) {
      console.error('Supabase getTransaction failed, falling back:', err);
    }
  }

  const data = readData();
  return data.transactions.find((t) => t.reference === reference) || null;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        return data.map((t) => ({
          id: t.id,
          reference: t.reference,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          payerEmail: t.payer_email,
          authorHandle: t.author_handle,
          wordText: t.word_text,
          modifierType: t.modifier_type,
          targetWordId: t.target_word_id,
          createdAt: t.created_at,
          paidAt: t.paid_at,
        }));
      }
    } catch (err) {
      console.error('Supabase getAllTransactions failed:', err);
    }
  }

  const data = readData();
  return data.transactions;
}

// ---------------------------------------------------------------------------
// 6. LEADERBOARD
// ---------------------------------------------------------------------------
export async function getLeaderboard() {
  const state = await getManifestoState();
  const words = state.words;

  const authorWordCounts: Record<string, number> = {};
  words.forEach((w) => {
    authorWordCounts[w.authorHandle] = (authorWordCounts[w.authorHandle] || 0) + 1;
  });

  const topAuthors = Object.entries(authorWordCounts)
    .map(([handle, count]) => ({ handle, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const mostReactedWords = [...words]
    .sort((a, b) => b.reactions.fire + b.reactions.skull - (a.reactions.fire + a.reactions.skull))
    .slice(0, 10);

  const archives = await getArchivedChapters();
  const closers = archives
    .filter((a) => a.chapter.closedByHandle)
    .map((a) => ({
      chapterNumber: a.chapter.chapterNumber,
      closedByHandle: a.chapter.closedByHandle!,
      closedAt: a.chapter.closedAt || a.chapter.createdAt,
      totalWords: a.chapter.totalWords,
    }));

  return {
    topAuthors,
    mostReactedWords,
    closers,
  };
}
