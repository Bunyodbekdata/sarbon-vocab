export type PartOfSpeech = 'n.' | 'v.' | 'adj.' | 'adv.' | 'prep.' | 'pron.' | 'conj.' | 'other';

export type LearningStatus = 'new' | 'learning' | 'review' | 'mastered';

export type RatingOption = 'again' | 'difficult' | 'good' | 'easy';

export interface RawVocabularyItem {
  word: string;
  definition: string; // Uzbek translation
  example: string;
  pos: string;
  unit: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  definition: string; // O'zbekcha tarjima
  example: string;
  pos: PartOfSpeech;
  courseId: 'book1' | 'book2';
  unit: number;
  phonetic?: string;
  notes?: string;
}

export interface WordProgress {
  wordId: string;
  status: LearningStatus;
  reps: number;
  interval: number; // in days
  easeFactor: number; // SM-2 standard, begins at 2.5
  lastReviewed?: number; // timestamp
  nextReview?: number; // timestamp
  consecutiveSuccess: number;
  failureCount: number;
  lastRating?: RatingOption;
  history: Array<{
    date: number;
    rating: RatingOption;
  }>;
}

export interface UnitMeta {
  unitNumber: number;
  courseId: 'book1' | 'book2';
  title: string;
  wordCount: number;
  description: string;
}

export interface CourseMeta {
  id: 'book1' | 'book2';
  title: string;
  subtitle: string;
  level: string;
  description: string;
  totalUnits: number;
  totalWords: number;
}

export interface UserStats {
  dailyStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  wordsStudiedToday: number;
  dailyGoal: number; // default 20
  totalReviewsCompleted: number;
  totalQuizzesCompleted: number;
  audioSpeed: number; // 0.8, 1.0, 1.2
  audioVoiceLang: string; // 'en-GB' or 'en-US'
  theme: 'dark' | 'light';
}
