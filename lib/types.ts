export type ModifierType = 'standard' | 'veto' | 'scream' | 'redacted' | 'period';

export interface WordReactions {
  fire: number;
  skull: number;
}

export interface Word {
  id: string;
  chapterId: string;
  wordText: string;
  wordIndex: number;
  authorHandle: string;
  authorUrl?: string;
  authorAvatar?: string;
  modifierType: ModifierType;
  originalWordText?: string; // If this word was a veto that replaced a previous word
  reactions: WordReactions;
  createdAt: string;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  isClosed: boolean;
  closedByHandle?: string;
  totalWords: number;
  createdAt: string;
  closedAt?: string;
}

export interface ManifestoState {
  activeChapter: Chapter;
  words: Word[];
  totalVolumesArchived: number;
  totalWordsAllTime: number;
}

export interface PlaceWordPayload {
  wordText: string;
  authorHandle: string;
  authorUrl?: string;
  modifierType: ModifierType;
  // targetWordId is required for 'veto' or 'redacted' if targeting an existing word
  targetWordId?: string;
}

export interface ReactionPayload {
  wordId: string;
  reactionType: 'fire' | 'skull';
}
