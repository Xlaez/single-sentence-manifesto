import fs from 'fs';
import path from 'path';
import { Chapter, Word, ManifestoState, PlaceWordPayload, ModifierType } from './types';
import { broadcaster } from './events';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'manifesto.json');

interface StoredData {
  chapters: Chapter[];
  words: Word[];
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
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read data file, returning initial state:', err);
    return {
      chapters: [INITIAL_CHAPTER],
      words: SEED_WORDS,
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

export function getManifestoState(): ManifestoState {
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

export function placeWord(payload: PlaceWordPayload): { word: Word; newChapterStarted?: boolean } {
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

  // If modifier is 'period', we end this chapter!
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

    // Immediately spawn next Chapter
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

    // Broadcast both events
    broadcaster.broadcast('word_placed', { word: periodWord });
    broadcaster.broadcast('chapter_closed', { closedChapter: activeChapter, nextChapter });

    return { word: periodWord, newChapterStarted: true };
  }

  // Handle 'veto' (strikethrough & replace)
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

  // Handle 'redacted'
  if (payload.modifierType === 'redacted' && payload.targetWordId) {
    const targetIdx = data.words.findIndex((w) => w.id === payload.targetWordId);
    if (targetIdx !== -1) {
      const target = data.words[targetIdx];
      const redactedWord: Word = {
        ...target,
        modifierType: 'redacted',
        createdAt: new Date().toISOString(),
      };
      data.words[targetIdx] = redactedWord;
      writeData(data);
      broadcaster.broadcast('word_redacted', { word: redactedWord });
      return { word: redactedWord };
    }
  }

  // Standard or Scream word append
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

export function reactToWord(wordId: string, reactionType: 'fire' | 'skull'): Word | null {
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

export function getArchivedChapters(): { chapter: Chapter; words: Word[] }[] {
  const data = readData();
  const closed = data.chapters.filter((c) => c.isClosed);
  return closed.map((chap) => ({
    chapter: chap,
    words: data.words.filter((w) => w.chapterId === chap.id),
  }));
}

export function getLeaderboard() {
  const data = readData();

  // 1. Top contributors by word count
  const authorWordCounts: Record<string, number> = {};
  data.words.forEach((w) => {
    authorWordCounts[w.authorHandle] = (authorWordCounts[w.authorHandle] || 0) + 1;
  });
  const topAuthors = Object.entries(authorWordCounts)
    .map(([handle, count]) => ({ handle, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 2. Most reacted words
  const mostReactedWords = [...data.words]
    .sort((a, b) => (b.reactions.fire + b.reactions.skull) - (a.reactions.fire + a.reactions.skull))
    .slice(0, 10);

  // 3. Hall of Closers
  const closers = data.chapters
    .filter((c) => c.isClosed && c.closedByHandle)
    .map((c) => ({
      chapterNumber: c.chapterNumber,
      closedByHandle: c.closedByHandle!,
      closedAt: c.closedAt || c.createdAt,
      totalWords: c.totalWords,
    }));

  return {
    topAuthors,
    mostReactedWords,
    closers,
  };
}
