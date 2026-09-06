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

export interface Transaction {
  id: string;
  reference: string;
  amount: number; // in subunits (kobo for NGN, cents for USD)
  currency: 'USD' | 'NGN';
  status: 'initialized' | 'success' | 'failed';
  payerEmail: string;
  authorHandle: string;
  wordText: string;
  modifierType: ModifierType;
  targetWordId?: string;
  placedWordId?: string; // Idempotency link: guarantees 1 payment = exactly 1 word
  createdAt: string;
  paidAt?: string;
  gatewayResponse?: string;
}

export interface ManifestoState {
  activeChapter: Chapter;
  words: Word[];
  totalVolumesArchived: number;
  totalWordsAllTime: number;
  totalRevenueNgn?: number;
  totalRevenueUsd?: number;
}

export interface PlaceWordPayload {
  wordText: string;
  authorHandle: string;
  authorUrl?: string;
  modifierType: ModifierType;
  // targetWordId is required for 'veto' or 'redacted' if targeting an existing word
  targetWordId?: string;
  paymentReference?: string;
}

export interface ReactionPayload {
  wordId: string;
  reactionType: 'fire' | 'skull';
}
