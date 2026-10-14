import { RatingOption, WordProgress } from '../types/vocabulary';

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm implementation
 * 
 * Rating Mapping:
 * - 'again'     (Score 1): Complete recall failure. Reset interval.
 * - 'difficult' (Score 2): Recalled with great difficulty. Short interval.
 * - 'good'      (Score 4): Recalled correctly with reasonable effort. Standard progression.
 * - 'easy'      (Score 5): Instant and confident recall. Extended interval.
 */
export function calculateNextReview(
  current: WordProgress | undefined,
  rating: RatingOption
): WordProgress {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Initial defaults if never studied before
  let reps = current?.reps ?? 0;
  let interval = current?.interval ?? 0;
  let easeFactor = current?.easeFactor ?? 2.5;
  let consecutiveSuccess = current?.consecutiveSuccess ?? 0;
  let failureCount = current?.failureCount ?? 0;
  const history = current?.history ? [...current.history] : [];

  history.push({ date: now, rating });

  // Map user rating to SM-2 score (0-5 scale)
  let quality = 3;
  if (rating === 'again') quality = 1;
  else if (rating === 'difficult') quality = 2;
  else if (rating === 'good') quality = 4;
  else if (rating === 'easy') quality = 5;

  if (quality < 3) {
    // Failure / Hard reset
    reps = 0;
    consecutiveSuccess = 0;
    failureCount += 1;
    // Next review in 10 minutes or same session (0.01 day)
    interval = 0.05; 
  } else {
    // Successful recall
    consecutiveSuccess += 1;
    if (reps === 0) {
      interval = 1; // 1 day
    } else if (reps === 1) {
      interval = rating === 'easy' ? 4 : 2; // 2 or 4 days
    } else {
      interval = Math.round(interval * easeFactor);
      if (rating === 'easy') {
        interval = Math.round(interval * 1.3);
      }
    }
    reps += 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 3.0) easeFactor = 3.0;

  // Determine learning status based on repetition depth and interval
  let status: WordProgress['status'] = 'learning';
  if (consecutiveSuccess >= 4 && interval >= 14) {
    status = 'mastered';
  } else if (consecutiveSuccess >= 1) {
    status = 'learning';
  }

  const nextReview = now + Math.round(interval * ONE_DAY_MS);

  return {
    wordId: current?.wordId || '',
    status,
    reps,
    interval,
    easeFactor,
    lastReviewed: now,
    nextReview,
    consecutiveSuccess,
    failureCount,
    lastRating: rating,
    history,
  };
}

/**
 * Checks if a word is due for spaced repetition review
 */
export function isWordDue(progress?: WordProgress): boolean {
  if (!progress || !progress.lastReviewed) return false;
  if (!progress.nextReview) return true;
  return Date.now() >= progress.nextReview;
}

/**
 * Checks if a word is classified as difficult
 */
export function isWordDifficult(progress?: WordProgress): boolean {
  if (!progress) return false;
  return progress.lastRating === 'again' || progress.lastRating === 'difficult' || progress.failureCount >= 2;
}
