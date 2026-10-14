import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle2, Volume2, HelpCircle, Eye, ArrowLeft } from 'lucide-react';
import { COURSES, UNITS } from '../../data/coursesMeta';
import { VocabularyItem, WordProgress } from '../../types/vocabulary';
import { speechService } from '../../services/speechService';

interface CoursesViewProps {
  allWords: VocabularyItem[];
  progressMap: Record<string, WordProgress>;
  onSelectUnit: (courseId: 'book1' | 'book2', unit: number) => void;
  onStartPractice: (courseId: 'book1' | 'book2', unit: number) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  allWords,
  progressMap,
  onSelectUnit,
  onStartPractice,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<'book1' | 'book2'>('book1');
  const [previewUnit, setPreviewUnit] = useState<number | null>(null);

  const selectedCourse = COURSES.find(c => c.id === selectedCourseId) || COURSES[0];
  const courseUnits = UNITS.filter(u => u.courseId === selectedCourseId);

  // If a unit is selected for preview
  const previewWords = previewUnit !== null 
    ? allWords.filter(w => w.courseId === selectedCourseId && w.unit === previewUnit)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Course Switcher Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
            Kurslar va Darslar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
            Boburbek Ravshanov tavsiya etgan leksik tizim asosida bosqichma-bosqich o'rganing.
          </p>
        </div>

        {/* Tab Pills */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: '5px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          {COURSES.map(course => (
            <button
              key={course.id}
              className={`nav-item ${selectedCourseId === course.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCourseId(course.id);
                setPreviewUnit(null);
              }}
              style={{ padding: '8px 16px' }}
            >
              <span>{course.id === 'book1' ? 'Book 1 (A2-B1)' : 'Book 2 (B1-B2)'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Course Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Daraja: {selectedCourse.level} · 30 Units
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>
            {selectedCourse.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', maxWidth: '650px' }}>
            {selectedCourse.description}
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => onSelectUnit(selectedCourseId, 1)}
        >
          <Play size={16} fill="currentColor" />
          <span>1-Unitdan boshlash</span>
        </button>
      </div>

      {/* 30 Units Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {courseUnits.map(unit => {
          const unitWords = allWords.filter(w => w.courseId === selectedCourseId && w.unit === unit.unitNumber);
          const learnedCount = unitWords.filter(w => progressMap[w.id] !== undefined).length;
          const pct = Math.round((learnedCount / (unitWords.length || 1)) * 100);
          const isComplete = learnedCount === unitWords.length && learnedCount > 0;

          return (
            <div
              key={unit.unitNumber}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '18px',
                border: isComplete ? '1px solid rgba(63, 191, 173, 0.45)' : undefined,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-light)', letterSpacing: '0.5px' }}>
                  UNIT {unit.unitNumber}
                </span>
                {isComplete ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--teal)', fontSize: '12px', fontWeight: 700 }}>
                    <CheckCircle2 size={14} />
                    <span>Tugallangan</span>
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {learnedCount} / {unitWords.length} so'z
                  </span>
                )}
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {unit.title}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px', minHeight: '36px' }}>
                  {unit.description}
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="progress-bar-track" style={{ height: '5px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: isComplete ? 'var(--teal)' : undefined,
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', marginTop: 'auto' }}>
                <button
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 12px', minHeight: '38px' }}
                  onClick={() => onSelectUnit(selectedCourseId, unit.unitNumber)}
                  title="O'rganishni boshlash"
                >
                  <Play size={14} fill="currentColor" />
                  <span>{learnedCount > 0 ? 'Davom etish' : 'O\'rganish'}</span>
                </button>

                <button
                  className="icon-button"
                  style={{ width: '38px', height: '38px' }}
                  onClick={() => setPreviewUnit(unit.unitNumber)}
                  title="Lug'atni ko'rish"
                >
                  <Eye size={16} />
                </button>

                <button
                  className="icon-button"
                  style={{ width: '38px', height: '38px' }}
                  onClick={() => onStartPractice(selectedCourseId, unit.unitNumber)}
                  title="Test / mashq"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vocabulary List Preview Modal */}
      {previewUnit !== null && (
        <div className="modal-backdrop" onClick={() => setPreviewUnit(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gold-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedCourse.title}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>
                  Unit {previewUnit} So'zlari ({previewWords.length} ta)
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setPreviewUnit(null)}
                style={{ fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
              {previewWords.map((word, i) => (
                <div
                  key={word.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '18px' }}>
                      {i + 1}.
                    </span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '15.5px', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                        {word.word}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--gold-light)', marginLeft: '6px', fontWeight: 600 }}>
                        ({word.pos})
                      </span>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {word.definition}
                      </div>
                    </div>
                  </div>

                  <button
                    className="icon-button"
                    style={{ width: '34px', height: '34px', flexShrink: 0 }}
                    onClick={() => speechService.speak(word.word)}
                    title="Talaffuzni tinglash"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => setPreviewUnit(null)}
              >
                Yopish
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const u = previewUnit;
                  setPreviewUnit(null);
                  onSelectUnit(selectedCourseId, u);
                }}
              >
                <Play size={15} fill="currentColor" />
                <span>Kartalarni boshlash</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
