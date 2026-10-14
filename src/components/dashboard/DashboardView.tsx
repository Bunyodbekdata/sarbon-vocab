import React from 'react';
import { 
  Play, 
  RotateCcw, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Flame,
  BookOpen
} from 'lucide-react';
import { UserStats, WordProgress, VocabularyItem } from '../../types/vocabulary';
import { COURSES } from '../../data/coursesMeta';

interface DashboardViewProps {
  stats: UserStats;
  progressMap: Record<string, WordProgress>;
  allWords: VocabularyItem[];
  lastPosition: { courseId: 'book1' | 'book2'; unit: number; cardIndex: number };
  onStartLearning: (courseId: 'book1' | 'book2', unit: number) => void;
  onStartReview: () => void;
  onSelectTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  progressMap,
  allWords,
  lastPosition,
  onStartLearning,
  onStartReview,
  onSelectTab,
}) => {
  // Compute calculated metrics
  const totalWords = allWords.length;
  const progressList = Object.values(progressMap);
  const wordsStudiedTotal = progressList.length;
  const wordsMastered = progressList.filter(p => p.status === 'mastered').length;
  const wordsLearning = progressList.filter(p => p.status === 'learning').length;
  const now = Date.now();
  const wordsDueForReview = progressList.filter(p => p.nextReview && p.nextReview <= now).length;

  const currentCourse = COURSES.find(c => c.id === lastPosition.courseId) || COURSES[0];
  const currentUnitWords = allWords.filter(
    w => w.courseId === lastPosition.courseId && w.unit === lastPosition.unit
  );
  const currentUnitLearned = currentUnitWords.filter(w => progressMap[w.id] !== undefined).length;
  const currentUnitPct = Math.round((currentUnitLearned / (currentUnitWords.length || 1)) * 100);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli oqshom';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner & Primary Action Card */}
      <section className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(201,164,76,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
          <div style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
              <Sparkles size={16} />
              <span>{greeting}, aziz talaba!</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
              Lug'at boyligingizni oshirishga tayyormisiz?
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
              Hozirgi dars: <strong style={{ color: 'var(--text-main)' }}>{currentCourse.title} · Unit {lastPosition.unit}</strong>.
              Ushbu darsda 20 ta so'zdan {currentUnitLearned} tasi o'rganildi ({currentUnitPct}%).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
            <button
              className="btn-primary"
              onClick={() => onStartLearning(lastPosition.courseId, lastPosition.unit)}
            >
              <Play size={18} fill="currentColor" />
              <span>O'rganishni davom ettirish</span>
            </button>

            {wordsDueForReview > 0 && (
              <button
                className="btn-secondary"
                onClick={onStartReview}
                style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }}
              >
                <RotateCcw size={16} />
                <span>Takrorlash ({wordsDueForReview} so'z kutyapti)</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Lesson Mini Progress Track */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Unit {lastPosition.unit} o'zlashtirish</span>
            <span><strong>{currentUnitLearned}</strong> / {currentUnitWords.length} so'z</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${currentUnitPct}%` }} />
          </div>
        </div>
      </section>

      {/* Daily Goal & Metric Cards Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Daily Goal */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Kunlik maqsad</span>
            <Flame size={20} color="var(--amber)" fill="var(--amber)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            {stats.wordsStudiedToday} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats.dailyGoal}</span>
          </div>
          <div className="progress-bar-track" style={{ height: '6px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, Math.round((stats.wordsStudiedToday / stats.dailyGoal) * 100))}%`,
                background: stats.wordsStudiedToday >= stats.dailyGoal ? 'var(--teal)' : undefined,
              }}
            />
          </div>
        </div>

        {/* Waiting for Spaced Review */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Takrorlash kutmoqda</span>
            <RotateCcw size={20} color={wordsDueForReview > 0 ? 'var(--rose)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: wordsDueForReview > 0 ? 'var(--rose)' : 'var(--text-main)', marginBottom: '6px' }}>
            {wordsDueForReview}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {wordsDueForReview === 0 ? "Barcha so'zlar o'z vaqtida takrorlandi!" : "Interval takrorlash bo'yicha"}
          </span>
        </div>

        {/* Mastered Vocabulary */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>O'zlashtirilgan so'zlar</span>
            <CheckCircle2 size={20} color="var(--teal)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--teal)', marginBottom: '6px' }}>
            {wordsMastered}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Mustahkam xotirada ({Math.round((wordsMastered / totalWords) * 100)}% jami fonddan)
          </span>
        </div>

        {/* In Progress */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>O'rganilayotgan</span>
            <TrendingUp size={20} color="var(--blue)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            {wordsLearning}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Faol mashg'ulot bosqichida
          </span>
        </div>
      </section>

      {/* Courses Overview & Quick Launch */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>
            Mavjud Kurslar
          </h2>
          <button
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '6px 14px', minHeight: '36px' }}
            onClick={() => onSelectTab('courses')}
          >
            <span>Barcha darslar</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {COURSES.map(course => {
            const courseWords = allWords.filter(w => w.courseId === course.id);
            const learnedInCourse = courseWords.filter(w => progressMap[w.id] !== undefined).length;
            const pct = Math.round((learnedInCourse / course.totalWords) * 100);

            return (
              <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      {course.level}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
                      {course.title}
                    </h3>
                  </div>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(201,164,76,0.12)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold-light)',
                    }}
                  >
                    <BookOpen size={20} />
                  </div>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {course.description}
                </p>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>{course.totalUnits} ta Unit ({course.totalWords} so'z)</span>
                    <span><strong>{pct}%</strong> bajarildi</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => onStartLearning(course.id, 1)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <Play size={15} fill="currentColor" />
                  <span>Darslarni ko'rish</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
