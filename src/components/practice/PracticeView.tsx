import React, { useState, useMemo } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabularyItem, WordProgress } from '../../types/vocabulary';
import { speechService } from '../../services/speechService';
import { StorageService } from '../../services/storageService';

interface PracticeViewProps {
  allWords: VocabularyItem[];
  progressMap: Record<string, WordProgress>;
  selectedCourseId?: 'book1' | 'book2';
  selectedUnit?: number;
}

type QuizType = 'en_to_uz' | 'uz_to_en' | 'fill_blank' | 'listening';

interface Question {
  targetWord: VocabularyItem;
  type: QuizType;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  allWords,
  progressMap: _progressMap,
  selectedCourseId = 'book1',
  selectedUnit = 1,
}) => {
  const [courseFilter, setCourseFilter] = useState<'book1' | 'book2'>(selectedCourseId);
  const [unitFilter, setUnitFilter] = useState<number>(selectedUnit);
  const [quizType, setQuizType] = useState<QuizType>('en_to_uz');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Filter pool of words for current unit
  const unitWords = useMemo(() => {
    return allWords.filter(w => w.courseId === courseFilter && w.unit === unitFilter);
  }, [allWords, courseFilter, unitFilter]);

  // Generate 10 randomized quiz questions
  const questions: Question[] = useMemo(() => {
    if (unitWords.length === 0) return [];

    const shuffled = [...unitWords].sort(() => 0.5 - Math.random()).slice(0, 10);

    return shuffled.map(item => {
      // Pick 3 distractors from unit or course
      const pool = allWords.filter(w => w.id !== item.id && w.courseId === courseFilter);
      const distractors = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

      if (quizType === 'en_to_uz') {
        const options = [item.definition, ...distractors.map(d => d.definition)].sort(() => 0.5 - Math.random());
        return {
          targetWord: item,
          type: 'en_to_uz',
          prompt: `"${item.word.toUpperCase()}" so'zining to'g'ri o'zbekcha tarjimasini tanlang:`,
          options,
          correctAnswer: item.definition,
        };
      } else if (quizType === 'uz_to_en') {
        const options = [item.word, ...distractors.map(d => d.word)].sort(() => 0.5 - Math.random());
        return {
          targetWord: item,
          type: 'uz_to_en',
          prompt: `"${item.definition}" ma'nosini anglatuvchi inglizcha so'z:`,
          options,
          correctAnswer: item.word,
        };
      } else if (quizType === 'listening') {
        const options = [item.word, ...distractors.map(d => d.word)].sort(() => 0.5 - Math.random());
        return {
          targetWord: item,
          type: 'listening',
          prompt: 'Talaffuzni tinglang va to\'g\'ri so\'zni toping:',
          options,
          correctAnswer: item.word,
        };
      } else {
        // fill_blank
        const sentence = item.example.replace(new RegExp(`(${item.word}[a-z]*)`, 'gi'), '_____');
        const options = [item.word, ...distractors.map(d => d.word)].sort(() => 0.5 - Math.random());
        return {
          targetWord: item,
          type: 'fill_blank',
          prompt: `Gapdagi bo'sh o'rinni to'ldiring:\n"${sentence}"`,
          options,
          correctAnswer: item.word,
        };
      }
    });
  }, [unitWords, allWords, courseFilter, quizType]);

  const currentQ = questions[currentQIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      // Record a mistake to reinforce in Spaced Repetition
      StorageService.recordWordStudy(currentQ.targetWord.id, 'again');
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      StorageService.incrementQuizCompleted();
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#C9A44C', '#3FBFAD', '#FFFFFF'],
        });
      } catch {
        // Fallback
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '680px', margin: '0 auto' }}>
      {/* Title & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
            Interaktiv Mashqlar va Test
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            O'rgangan so'zlaringizni sinovdan o'tkazing va xotirani mustahkamlang.
          </p>
        </div>

        {/* Course & Unit Selectors */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="btn-secondary"
            value={courseFilter}
            onChange={e => {
              setCourseFilter(e.target.value as any);
              restartQuiz();
            }}
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            <option value="book1">Book 1</option>
            <option value="book2">Book 2</option>
          </select>

          <select
            className="btn-secondary"
            value={unitFilter}
            onChange={e => {
              setUnitFilter(Number(e.target.value));
              restartQuiz();
            }}
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map(u => (
              <option key={u} value={u}>Unit {u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz Type Tabs */}
      <div style={{ display: 'flex', gap: '6px', background: 'var(--surface)', padding: '5px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <button
          className={`nav-item ${quizType === 'en_to_uz' ? 'active' : ''}`}
          onClick={() => { setQuizType('en_to_uz'); restartQuiz(); }}
          style={{ padding: '7px 12px', fontSize: '13px' }}
        >
          English → O'zbekcha
        </button>
        <button
          className={`nav-item ${quizType === 'uz_to_en' ? 'active' : ''}`}
          onClick={() => { setQuizType('uz_to_en'); restartQuiz(); }}
          style={{ padding: '7px 12px', fontSize: '13px' }}
        >
          O'zbekcha → English
        </button>
        <button
          className={`nav-item ${quizType === 'listening' ? 'active' : ''}`}
          onClick={() => { setQuizType('listening'); restartQuiz(); }}
          style={{ padding: '7px 12px', fontSize: '13px' }}
        >
          Tinglab topish (Audio)
        </button>
        <button
          className={`nav-item ${quizType === 'fill_blank' ? 'active' : ''}`}
          onClick={() => { setQuizType('fill_blank'); restartQuiz(); }}
          style={{ padding: '7px 12px', fontSize: '13px' }}
        >
          Gapni to'ldirish
        </button>
      </div>

      {/* Quiz Screen or Finished Screen */}
      {isFinished ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(63, 191, 173, 0.2)',
              border: '2px solid var(--teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--teal)',
            }}
          >
            <Sparkles size={32} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>
            Test Yakunlandi!
          </h2>
          <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--gold-light)', margin: '12px 0' }}>
            {score} / {questions.length}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '28px' }}>
            {score >= 8
              ? 'Ajoyib natija! So\'zlarni juda yaxshi o\'zlashtiribsiz.'
              : 'Yaxshi harakat! Xato qilingan so\'zlar avtomatik takrorlash markaziga kiritildi.'}
          </p>

          <button className="btn-primary" onClick={restartQuiz}>
            <RotateCw size={16} />
            <span>Qaytadan ishlash</span>
          </button>
        </div>
      ) : currentQ ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px' }}>
          {/* Question Header & Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>Savol <strong>{currentQIndex + 1}</strong> / {questions.length}</span>
              <span>Ball: <strong style={{ color: 'var(--gold-light)' }}>{score}</strong></span>
            </div>
            <div className="progress-bar-track" style={{ height: '5px' }}>
              <div className="progress-bar-fill" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          {/* Question Prompt */}
          <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {currentQ.prompt}
            </div>

            {/* If audio quiz, show large listen button */}
            {currentQ.type === 'listening' && (
              <div style={{ marginTop: '16px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => speechService.speak(currentQ.targetWord.word)}
                  style={{ gap: '10px' }}
                >
                  <Volume2 size={20} color="var(--gold-light)" />
                  <span>Talaffuzni qayta eshitish</span>
                </button>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correctAnswer;

              let btnBorder = 'var(--border)';
              let btnBg = 'var(--surface-2)';
              let icon = null;

              if (isAnswered) {
                if (isCorrect) {
                  btnBorder = 'var(--teal)';
                  btnBg = 'rgba(63, 191, 173, 0.15)';
                  icon = <CheckCircle2 size={18} color="var(--teal)" />;
                } else if (isSelected) {
                  btnBorder = 'var(--rose)';
                  btnBg = 'rgba(224, 109, 136, 0.15)';
                  icon = <XCircle size={18} color="var(--rose)" />;
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${btnBorder}`,
                    background: btnBg,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isAnswered ? 'default' : 'pointer',
                    fontSize: '15.5px',
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '16px' }}>
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span>{opt}</span>
                  </div>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Bottom Next Button */}
          {isAnswered && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn-primary" onClick={handleNextQuestion}>
                <span>{currentQIndex === questions.length - 1 ? 'Natijani ko\'rish' : 'Keyingi savol'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
