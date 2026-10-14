import { WordProgress, UserStats, RatingOption } from '../types/vocabulary';
import { calculateNextReview } from './spacedRepetition';

const STORAGE_KEYS = {
  PROGRESS: 'sarbon_vocab_progress_v1',
  STATS: 'sarbon_user_stats_v1',
  CURRENT_POSITION: 'sarbon_current_pos_v1',
};

const DEFAULT_STATS: UserStats = {
  dailyStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  wordsStudiedToday: 0,
  dailyGoal: 20,
  totalReviewsCompleted: 0,
  totalQuizzesCompleted: 0,
  audioSpeed: 1.0,
  audioVoiceLang: 'en-GB',
  theme: 'dark',
};

export class StorageService {
  /**
   * Load all progress records (keyed by wordId)
   */
  static getProgressMap(): Record<string, WordProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Save a single word's rating and update user daily activity
   */
  static recordWordStudy(wordId: string, rating: RatingOption): WordProgress {
    const map = this.getProgressMap();
    const existing = map[wordId] || {
      wordId,
      status: 'new',
      reps: 0,
      interval: 0,
      easeFactor: 2.5,
      consecutiveSuccess: 0,
      failureCount: 0,
      history: [],
    };

    const updated = calculateNextReview(existing, rating);
    updated.wordId = wordId;
    map[wordId] = updated;

    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }

    // Update daily study counters
    this.incrementWordsStudiedToday();
    return updated;
  }

  /**
   * Load user stats and handle streak logic
   */
  static getUserStats(): UserStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STATS);
      let stats: UserStats = raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS };

      const today = new Date().toISOString().split('T')[0];
      if (stats.lastActiveDate !== today) {
        // Calculate difference in days
        const lastDate = new Date(stats.lastActiveDate);
        const currDate = new Date(today);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          // Continuous streak
          stats.dailyStreak += 1;
        } else if (diffDays > 1) {
          // Missed days - reset to 1
          stats.dailyStreak = 1;
        }
        stats.wordsStudiedToday = 0;
        stats.lastActiveDate = today;
        this.saveUserStats(stats);
      }
      return stats;
    } catch {
      return { ...DEFAULT_STATS };
    }
  }

  static saveUserStats(stats: UserStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  }

  static incrementWordsStudiedToday(): void {
    const stats = this.getUserStats();
    stats.wordsStudiedToday += 1;
    this.saveUserStats(stats);
  }

  static incrementQuizCompleted(): void {
    const stats = this.getUserStats();
    stats.totalQuizzesCompleted += 1;
    this.saveUserStats(stats);
  }

  static saveLastPosition(courseId: string, unit: number, cardIndex: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_POSITION, JSON.stringify({ courseId, unit, cardIndex }));
    } catch {
      // Ignore
    }
  }

  static getLastPosition(): { courseId: 'book1' | 'book2'; unit: number; cardIndex: number } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_POSITION);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return { courseId: 'book1', unit: 1, cardIndex: 0 };
  }

  /**
   * Reset all progress (with confirmation)
   */
  static resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_POSITION);
  }

  /**
   * Export progress as JSON file
   */
  static exportData(): string {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      stats: this.getUserStats(),
      progress: this.getProgressMap(),
    }, null, 2);
  }

  /**
   * Import data from JSON
   */
  static importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.progress) {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(parsed.progress));
        if (parsed.stats) {
          localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(parsed.stats));
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }
}
