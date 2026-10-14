import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CoursesView } from './components/courses/CoursesView';
import { FlashcardView } from './components/flashcards/FlashcardView';
import { ReviewCenterView } from './components/review/ReviewCenterView';
import { PracticeView } from './components/practice/PracticeView';
import { LibraryView } from './components/library/LibraryView';
import { ProgressView } from './components/progress/ProgressView';
import { SettingsView } from './components/settings/SettingsView';
import { ALL_VOCABULARY } from './data/coursesMeta';
import { StorageService } from './services/storageService';
import { VocabularyItem, WordProgress, UserStats, RatingOption } from './types/vocabulary';
import { isWordDue } from './services/spacedRepetition';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stats, setStats] = useState<UserStats>(StorageService.getUserStats());
  const [progressMap, setProgressMap] = useState<Record<string, WordProgress>>(StorageService.getProgressMap());
  const [lastPosition, setLastPosition] = useState(StorageService.getLastPosition());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active flashcard deck state
  const [activeDeckTitle, setActiveDeckTitle] = useState<string>('Unit 1');
  const [activeDeckWords, setActiveDeckWords] = useState<VocabularyItem[]>([]);
  const [activeDeckStartIndex, setActiveDeckStartIndex] = useState<number>(0);

  // Selected unit for practice
  const [practiceCourseId, setPracticeCourseId] = useState<'book1' | 'book2'>('book1');
  const [practiceUnit, setPracticeUnit] = useState<number>(1);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', stats.theme);
  }, [stats.theme]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = stats.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...stats, theme: newTheme as 'dark' | 'light' };
    setStats(updated);
    StorageService.saveUserStats(updated);
  };

  // Launch flashcard study for a specific course & unit
  const handleStartLearning = (courseId: 'book1' | 'book2', unit: number) => {
    const words = ALL_VOCABULARY.filter(w => w.courseId === courseId && w.unit === unit);
    const courseTitle = courseId === 'book1' ? 'Book 1' : 'Book 2';
    setActiveDeckTitle(`${courseTitle} · Unit ${unit}`);
    setActiveDeckWords(words);
    setActiveDeckStartIndex(0);
    setLastPosition({ courseId, unit, cardIndex: 0 });
    StorageService.saveLastPosition(courseId, unit, 0);
    setActiveTab('flashcards');
  };

  // Launch custom review deck (e.g. Due words or Difficult words)
  const handleStartReviewDeck = (deckWords: VocabularyItem[], title: string) => {
    if (deckWords.length === 0) {
      showToast("Takrorlash uchun so'zlar mavjud emas.");
      return;
    }
    setActiveDeckTitle(title);
    setActiveDeckWords(deckWords);
    setActiveDeckStartIndex(0);
    setActiveTab('flashcards');
  };

  // Study single word from Library
  const handleStudySingleWord = (word: VocabularyItem) => {
    setActiveDeckTitle(`${word.word.toUpperCase()} · O'rganish`);
    setActiveDeckWords([word]);
    setActiveDeckStartIndex(0);
    setActiveTab('flashcards');
  };

  // Launch practice for unit
  const handleStartPractice = (courseId: 'book1' | 'book2', unit: number) => {
    setPracticeCourseId(courseId);
    setPracticeUnit(unit);
    setActiveTab('practice');
  };

  // When a word is rated in flashcards
  const handleWordRated = (_wordId: string, _rating: RatingOption) => {
    setProgressMap(StorageService.getProgressMap());
    setStats(StorageService.getUserStats());
  };

  // Refresh data on reset or import
  const handleDataRefresh = () => {
    setProgressMap(StorageService.getProgressMap());
    setStats(StorageService.getUserStats());
    setLastPosition(StorageService.getLastPosition());
  };

  // Calculate due count for review badge
  const dueCount = Object.values(progressMap).filter(p => isWordDue(p)).length;

  return (
    <div className="sarbon-app">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={tab => {
          if (tab === 'flashcards' && activeDeckWords.length === 0) {
            // Default to current unit if none selected
            handleStartLearning(lastPosition.courseId, lastPosition.unit);
            return;
          }
          setActiveTab(tab);
        }}
        streak={stats.dailyStreak}
        dueCount={dueCount}
        theme={stats.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            progressMap={progressMap}
            allWords={ALL_VOCABULARY}
            lastPosition={lastPosition}
            onStartLearning={handleStartLearning}
            onStartReview={() => {
              const due = ALL_VOCABULARY.filter(w => isWordDue(progressMap[w.id]));
              handleStartReviewDeck(due, 'Bugun takrorlanadigan so\'zlar');
            }}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            allWords={ALL_VOCABULARY}
            progressMap={progressMap}
            onSelectUnit={handleStartLearning}
            onStartPractice={handleStartPractice}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardView
            deckTitle={activeDeckTitle}
            words={activeDeckWords.length > 0 ? activeDeckWords : ALL_VOCABULARY.slice(0, 20)}
            progressMap={progressMap}
            initialIndex={activeDeckStartIndex}
            onExit={() => setActiveTab('dashboard')}
            onWordRated={handleWordRated}
          />
        )}

        {activeTab === 'review' && (
          <ReviewCenterView
            allWords={ALL_VOCABULARY}
            progressMap={progressMap}
            onStartReviewDeck={handleStartReviewDeck}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView
            allWords={ALL_VOCABULARY}
            progressMap={progressMap}
            selectedCourseId={practiceCourseId}
            selectedUnit={practiceUnit}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            allWords={ALL_VOCABULARY}
            progressMap={progressMap}
            onStudySingleWord={handleStudySingleWord}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            stats={stats}
            progressMap={progressMap}
            allWords={ALL_VOCABULARY}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            stats={stats}
            onUpdateStats={setStats}
            onDataReset={handleDataRefresh}
            showToast={showToast}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
