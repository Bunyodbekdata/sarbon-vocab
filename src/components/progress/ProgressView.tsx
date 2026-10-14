import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck
} from 'lucide-react';
import { UserStats, WordProgress, VocabularyItem } from '../../types/vocabulary';
import { UNITS } from '../../data/coursesMeta';

interface ProgressViewProps {
  stats: UserStats;
  progressMap: Record<string, WordProgress>;
  allWords: VocabularyItem[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  stats: _stats,
  progressMap,
  allWords,
}) => {
  const totalWords = allWords.length;
  const progressList = Object.values(progressMap);

  const totalStudied = progressList.length;
  const masteredCount = progressList.filter(p => p.status === 'mastered').length;
  const learningCount = progressList.filter(p => p.status === 'learning').length;

  // Calculate completed lessons (units where 100% of words were studied)
  const completedUnits = UNITS.filter(u => {
    const uWords = allWords.filter(w => w.courseId === u.courseId && w.unit === u.unitNumber);
    const learnedInUnit = uWords.filter(w => progressMap[w.id] !== undefined).length;
    return learnedInUnit === uWords.length && uWords.length > 0;
  }).length;

  // Overall retention accuracy: percentage of answers that were 'good' or 'easy'
  let totalReviews = 0;
  let successReviews = 0;
  progressList.forEach(p => {
    if (p.history) {
      p.history.forEach(h => {
        totalReviews += 1;
        if (h.rating === 'good' || h.rating === 'easy') {
          successReviews += 1;
        }
      });
    }
  });

  const accuracyRate = totalReviews > 0 ? Math.round((successReviews / totalReviews) * 100) : 100;

  // Book 1 vs Book 2 breakdown
  const b1Words = allWords.filter(w => w.courseId === 'book1');
  const b2Words = allWords.filter(w => w.courseId === 'book2');
  const b1Learned = b1Words.filter(w => progressMap[w.id] !== undefined).length;
  const b2Learned = b2Words.filter(w => progressMap[w.id] !== undefined).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
          O'quv Statistikasi va O'zlashtirish Tahlili
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
          Haqiqiy o'qish natijalari, SM-2 retention ko'rsatkichlari va faollik tahlili.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>O'rganilgan so'zlar</span>
            <BookOpen size={20} color="var(--gold-light)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalStudied} <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>/ {totalWords}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Jami fondning {Math.round((totalStudied / totalWords) * 100)}% qismi
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>To'liq o'zlashtirilgan</span>
            <CheckCircle2 size={20} color="var(--teal)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--teal)' }}>
            {masteredCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Uzoq muddatli xotirada
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Xotira Aniqligi</span>
            <ShieldCheck size={20} color="var(--blue)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--blue)' }}>
            {accuracyRate}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalReviews} ta qaytarish asosida
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Tugallangan Unitlar</span>
            <Award size={20} color="var(--amber)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--amber)' }}>
            {completedUnits} <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>/ 60</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Har bir unitda 20 tadan so'z
          </div>
        </div>
      </div>

      {/* Course Progression Comparison */}
      <section className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '18px' }}>
          Kurslar Bo'yicha Taraqqiyot
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Book 1 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700 }}>4000 Essential English Words 1 (Book 1)</span>
              <span><strong>{b1Learned}</strong> / {b1Words.length} so'z ({Math.round((b1Learned / b1Words.length) * 100)}%)</span>
            </div>
            <div className="progress-bar-track" style={{ height: '8px' }}>
              <div className="progress-bar-fill" style={{ width: `${(b1Learned / b1Words.length) * 100}%` }} />
            </div>
          </div>

          {/* Book 2 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700 }}>4000 Essential English Words 2 (Book 2)</span>
              <span><strong>{b2Learned}</strong> / {b2Words.length} so'z ({Math.round((b2Learned / b2Words.length) * 100)}%)</span>
            </div>
            <div className="progress-bar-track" style={{ height: '8px' }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${(b2Learned / b2Words.length) * 100}%`, background: 'linear-gradient(90deg, #3FBFAD, #5B8DEF)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Learning Status Distribution Bar */}
      <section className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '18px' }}>
          Lug'at O'zlashtirish Holati Taqvimi
        </h2>

        <div style={{ display: 'flex', height: '24px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div
            title={`O'zlashtirilgan: ${masteredCount}`}
            style={{ width: `${(masteredCount / totalWords) * 100}%`, background: 'var(--teal)', transition: 'width 0.4s' }}
          />
          <div
            title={`O'rganilmoqda: ${learningCount}`}
            style={{ width: `${(learningCount / totalWords) * 100}%`, background: 'var(--blue)', transition: 'width 0.4s' }}
          />
          <div
            title={`Yangi so'zlar: ${totalWords - totalStudied}`}
            style={{ width: `${((totalWords - totalStudied) / totalWords) * 100}%`, background: 'rgba(201, 164, 76, 0.15)', transition: 'width 0.4s' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '16px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--teal)' }} />
            <span>O'zlashtirilgan: <strong>{masteredCount}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--blue)' }} />
            <span>O'rganilmoqda: <strong>{learningCount}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(201, 164, 76, 0.15)', border: '1px solid var(--border)' }} />
            <span>Hali o'rganilmagan: <strong>{totalWords - totalStudied}</strong></span>
          </div>
        </div>
      </section>
    </div>
  );
};
