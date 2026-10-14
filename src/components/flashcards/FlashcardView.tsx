import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Volume2, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabularyItem, RatingOption, WordProgress } from '../../types/vocabulary';
import { speechService } from '../../services/speechService';
import { StorageService } from '../../services/storageService';

interface FlashcardViewProps {
  deckTitle: string;
  words: VocabularyItem[];
  progressMap: Record<string, WordProgress>;
  initialIndex?: number;
  onExit: () => void;
  onWordRated?: (wordId: string, rating: RatingOption) => void;
  onCompleteSession?: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  deckTitle,
  words,
  progressMap: _progressMap,
  initialIndex = 0,
  onExit,
  onWordRated,
  onCompleteSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionRatings, setSessionRatings] = useState<Record<string, RatingOption>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const currentWord: VocabularyItem | undefined = words[currentIndex];

  // Reset flip when navigating between cards
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Audio pronunciation trigger
  const handleSpeak = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentWord) return;

    setIsSpeaking(true);
    speechService.speak(currentWord.word, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [currentWord]);

  // Handle rating a word
  const handleRate = useCallback((rating: RatingOption) => {
    if (!currentWord) return;

    // Persist rating in storage and update SM-2 progress
    StorageService.recordWordStudy(currentWord.id, rating);
    setSessionRatings(prev => ({ ...prev, [currentWord.id]: rating }));

    if (onWordRated) {
      onWordRated(currentWord.id, rating);
    }

    // Save position
    StorageService.saveLastPosition(currentWord.courseId, currentWord.unit, currentIndex);

    // Proceed to next card or finish session
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed deck!
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C9A44C', '#F0D593', '#3FBFAD', '#FFFFFF'],
        });
      } catch {
        // Confetti fallback
      }
      if (onCompleteSession) {
        onCompleteSession();
      }
    }
  }, [currentWord, currentIndex, words.length, onWordRated, onCompleteSession]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, words.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture inside inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'KeyA') {
        e.preventDefault();
        handleSpeak();
      } else if (isFlipped) {
        // Rating numbers 1-4 when card is revealed
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('difficult');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFlip, handleNext, handlePrev, handleSpeak, isFlipped, handleRate]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStartX(e.changedTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX === null) return;
    const diff = e.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(diff) > 55) {
      if (diff < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setSwipeStartX(null);
  };

  // If words array is empty
  if (!words || words.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '520px', margin: '40px auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '12px' }}>
          Kartalar topilmadi
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Ushbu to'plamda hali so'zlar mavjud emas yoki filter bo'yicha natija chiqmadi.
        </p>
        <button className="btn-primary" onClick={onExit}>
          Orqaga qaytish
        </button>
      </div>
    );
  }

  // Session Completed Modal / Screen
  if (isCompleted) {
    const total = words.length;
    const againCount = Object.values(sessionRatings).filter(r => r === 'again').length;
    const diffCount = Object.values(sessionRatings).filter(r => r === 'difficult').length;
    const goodCount = Object.values(sessionRatings).filter(r => r === 'good').length;
    const easyCount = Object.values(sessionRatings).filter(r => r === 'easy').length;

    return (
      <div className="glass-card" style={{ maxWidth: '580px', margin: '20px auto', padding: '36px 28px', textAlign: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(201,164,76,0.25), rgba(63,191,173,0.25))',
            border: '2px solid var(--gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--gold-light)',
          }}
        >
          <Sparkles size={36} />
        </div>

        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Dars muvaffaqiyatli tugatildi!
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, margin: '8px 0 12px' }}>
          {deckTitle}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '28px' }}>
          Barcha {total} ta so'z faol o'rganildi va takrorlash jadvaliga kiritildi.
        </p>

        {/* Rating Breakdown Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '32px' }}>
          <div style={{ padding: '12px 6px', borderRadius: 'var(--radius-md)', background: 'rgba(224,109,136,0.12)', border: '1px solid rgba(224,109,136,0.3)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--rose)' }}>{againCount}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Qayta</div>
          </div>
          <div style={{ padding: '12px 6px', borderRadius: 'var(--radius-md)', background: 'rgba(234,168,71,0.12)', border: '1px solid rgba(234,168,71,0.3)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--amber)' }}>{diffCount}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Qiyin</div>
          </div>
          <div style={{ padding: '12px 6px', borderRadius: 'var(--radius-md)', background: 'rgba(63,191,173,0.12)', border: '1px solid rgba(63,191,173,0.3)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--teal)' }}>{goodCount}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Yaxshi</div>
          </div>
          <div style={{ padding: '12px 6px', borderRadius: 'var(--radius-md)', background: 'rgba(201,164,76,0.12)', border: '1px solid rgba(201,164,76,0.3)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-light)' }}>{easyCount}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Oson</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              setCurrentIndex(0);
              setIsCompleted(false);
              setSessionRatings({});
            }}
          >
            <RotateCw size={15} />
            <span>Qaytadan o'tish</span>
          </button>

          <button className="btn-primary" onClick={onExit}>
            <span>Bosh sahifaga qaytish</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / words.length) * 100);

  // Highlight word in example sentence
  const renderHighlightedExample = (example: string, word: string) => {
    if (!example || !word) return example;
    const regex = new RegExp(`(${word}[a-z]*)`, 'gi');
    const parts = example.split(regex);
    return parts.map((part, idx) => {
      if (part.toLowerCase().startsWith(word.toLowerCase().slice(0, 3))) {
        return (
          <strong key={idx} style={{ color: 'var(--gold-light)', textDecoration: 'underline text-underline-offset-4' }}>
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '680px', margin: '0 auto' }}>
      {/* Top Header & Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="icon-button"
            onClick={onExit}
            aria-label="Darsdan chiqish"
            title="Darsdan chiqish (Esc)"
          >
            <X size={18} />
          </button>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--gold-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {deckTitle}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              So'z <strong>{currentIndex + 1}</strong> / {words.length} ({progressPercent}%)
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="icon-button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
            title="Oldingi so'z (←)"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="icon-button"
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            style={{ opacity: currentIndex === words.length - 1 ? 0.4 : 1 }}
            title="Keyingi so'z (→)"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="progress-bar-track" style={{ height: '6px' }}>
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* 3D Focal Flashcard */}
      <div
        className="card-perspective-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={cardRef}
          className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}
          onClick={toggleFlip}
          role="button"
          tabIndex={0}
          aria-label="Flashcard. O'zbekcha tarjimani ko'rish uchun bosing."
        >
          {/* Card Front Face (English Word) */}
          <div className="card-face card-face-front">
            <div className="card-top-meta">
              <span>Card {currentIndex + 1} of {words.length} · Unit {currentWord.unit}</span>
              <span className={`pos-tag ${currentWord.pos.replace('.', '')}`}>
                {currentWord.pos}
              </span>
            </div>

            <div className="card-word-center">
              <div className="target-word-title">
                {currentWord.word.charAt(0).toUpperCase() + currentWord.word.slice(1)}
              </div>

              {/* Audio Pronunciation Button */}
              <button
                className={`audio-play-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleSpeak}
                title="Talaffuzni tinglash (A)"
                aria-label="Talaffuzni eshitish"
              >
                <Volume2 size={24} />
              </button>
            </div>

            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'rgba(201,164,76,0.08)', padding: '6px 16px', borderRadius: '99px', border: '1px solid var(--border)' }}>
                Tarjimani ko'rish uchun kartani bosing yoki [Space]
              </span>
            </div>
          </div>

          {/* Card Back Face (Uzbek Translation & Example) */}
          <div className="card-face card-face-back">
            <div className="card-top-meta">
              <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>
                {currentWord.word.toUpperCase()} ({currentWord.pos})
              </span>
              <button
                className="icon-button"
                style={{ width: '34px', height: '34px' }}
                onClick={handleSpeak}
                title="Talaffuz"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '18px', zIndex: 2, padding: '10px 0' }}>
              <div>
                <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold)', fontWeight: 700, marginBottom: '6px' }}>
                  O'zbekcha Ma'nosi
                </div>
                <div style={{ fontSize: 'clamp(20px, 4.5vw, 28px)', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                  {currentWord.definition}
                </div>
              </div>

              {currentWord.example && (
                <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: '14px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                    Misol
                  </div>
                  <div style={{ fontSize: '15px', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{renderHighlightedExample(currentWord.example, currentWord.word)}"
                  </div>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Qaytarish uchun kartani bosing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '6px' }}>
        <button
          className="btn-primary"
          onClick={toggleFlip}
          style={{ minWidth: '180px' }}
        >
          <RotateCw size={16} />
          <span>{isFlipped ? 'Inglizcha so\'z' : 'Tarjimani ko\'rish (Space)'}</span>
        </button>
      </div>

      {/* Answer Rating Buttons (Appears prominently when flipped, or available to rate) */}
      <div style={{ opacity: isFlipped ? 1 : 0.6, transition: 'opacity 0.2s ease' }}>
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {isFlipped ? "O'zlashtirish darajangizni baholang:" : "Tarjima ochilgach xotirangizni baholang:"}
        </div>
        <div className="rating-buttons-grid">
          <button
            className="rating-btn again"
            onClick={() => handleRate('again')}
            title="Eslay olmadim (1)"
          >
            <span className="rating-label" style={{ color: 'var(--rose)' }}>Again [1]</span>
            <span className="rating-desc">Eslay olmadim</span>
          </button>

          <button
            className="rating-btn difficult"
            onClick={() => handleRate('difficult')}
            title="Qiyinchilik bilan esladim (2)"
          >
            <span className="rating-label" style={{ color: 'var(--amber)' }}>Hard [2]</span>
            <span className="rating-desc">Qiyin esladim</span>
          </button>

          <button
            className="rating-btn good"
            onClick={() => handleRate('good')}
            title="Yaxshi esladim (3)"
          >
            <span className="rating-label" style={{ color: 'var(--teal)' }}>Good [3]</span>
            <span className="rating-desc">To'g'ri esladim</span>
          </button>

          <button
            className="rating-btn easy"
            onClick={() => handleRate('easy')}
            title="Juda oson va ishonchli (4)"
          >
            <span className="rating-label" style={{ color: 'var(--gold-light)' }}>Easy [4]</span>
            <span className="rating-desc">Oson va aniq</span>
          </button>
        </div>
      </div>

      {/* Desktop Keyboard Hints */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
        <span><kbd style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>Space</kbd> Flip</span>
        <span><kbd style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>← →</kbd> Oldingi / Keyingi</span>
        <span><kbd style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>A</kbd> Ovoz</span>
        <span><kbd style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>1-4</kbd> Baholash</span>
      </div>
    </div>
  );
};
