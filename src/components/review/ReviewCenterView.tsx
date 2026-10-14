import React, { useState } from 'react';
import { 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Play, 
  Volume2
} from 'lucide-react';
import { VocabularyItem, WordProgress } from '../../types/vocabulary';
import { isWordDue, isWordDifficult } from '../../services/spacedRepetition';
import { speechService } from '../../services/speechService';

interface ReviewCenterViewProps {
  allWords: VocabularyItem[];
  progressMap: Record<string, WordProgress>;
  onStartReviewDeck: (deckWords: VocabularyItem[], title: string) => void;
}

export const ReviewCenterView: React.FC<ReviewCenterViewProps> = ({
  allWords,
  progressMap,
  onStartReviewDeck,
}) => {
  const [filterMode, setFilterMode] = useState<'due' | 'difficult' | 'all'>('due');

  const now = Date.now();
  const ONE_DAY_MS = 24 * 3600 * 1000;

  // Words due now
  const dueWords = allWords.filter(w => isWordDue(progressMap[w.id]));

  // Difficult words
  const difficultWords = allWords.filter(w => isWordDifficult(progressMap[w.id]));

  // Forecast for upcoming days
  const dueTomorrow = allWords.filter(w => {
    const p = progressMap[w.id];
    if (!p || !p.nextReview) return false;
    return p.nextReview > now && p.nextReview <= now + ONE_DAY_MS;
  });

  const dueThisWeek = allWords.filter(w => {
    const p = progressMap[w.id];
    if (!p || !p.nextReview) return false;
    return p.nextReview > now + ONE_DAY_MS && p.nextReview <= now + 7 * ONE_DAY_MS;
  });

  const displayedWords = filterMode === 'due' 
    ? dueWords 
    : filterMode === 'difficult' 
    ? difficultWords 
    : allWords.filter(w => progressMap[w.id] !== undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
          Takrorlash Markazi (Spaced Repetition)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
          Ebbinghaus unutish egri chizig'iga asoslangan aqlli takrorlash tizimi.
        </p>
      </div>

      {/* Main Review Decks Launch Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
        {/* Due For Review Deck */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: dueWords.length > 0 ? '1px solid var(--rose)' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              SM-2 Algoritmi bo'yicha
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(224, 109, 136, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--rose)',
              }}
            >
              <RotateCcw size={18} />
            </div>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>
              Bugun takrorlanadigan so'zlar
            </h2>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0' }}>
              {dueWords.length} <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>ta so'z</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Ushbu so'zlarni xotirada mustahkamlash vaqti keldi. Qanchalik tez takrorlasangiz, uzoq muddatli xotiraga shunchalik tez o'tadi.
            </p>
          </div>

          <button
            className="btn-primary"
            style={{ marginTop: 'auto', background: dueWords.length > 0 ? undefined : 'var(--surface-elevated)', color: dueWords.length > 0 ? undefined : 'var(--text-muted)' }}
            disabled={dueWords.length === 0}
            onClick={() => onStartReviewDeck(dueWords, 'Bugun takrorlanadigan so\'zlar')}
          >
            <Play size={16} fill="currentColor" />
            <span>{dueWords.length > 0 ? "Takrorlashni boshlash" : "Barchasi takrorlangan"}</span>
          </button>
        </div>

        {/* Difficult Words Deck */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: difficultWords.length > 0 ? '1px solid var(--amber)' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Xatoliklar tahlili
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(234, 168, 71, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--amber)',
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>
              Qiyin so'zlar to'plami
            </h2>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0' }}>
              {difficultWords.length} <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>ta so'z</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              "Again" yoki "Difficult" deb baholangan yoki testlarda xato qilingan so'zlar maxsus mashq uchun jamlangan.
            </p>
          </div>

          <button
            className="btn-secondary"
            style={{ marginTop: 'auto', borderColor: 'var(--amber)', color: 'var(--amber)' }}
            disabled={difficultWords.length === 0}
            onClick={() => onStartReviewDeck(difficultWords, 'Qiyin so\'zlar to\'plami')}
          >
            <Play size={16} fill="currentColor" />
            <span>Qiyin so'zlarni mustahkamlash</span>
          </button>
        </div>
      </div>

      {/* Spaced Repetition Timeline Forecast */}
      <section className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
          Takrorlash Jadvali Prognozi
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose)', fontSize: '13px', fontWeight: 700 }}>
              <Clock size={16} />
              <span>Bugun</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>
              {dueWords.length} ta
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kutayotgan so'zlar</div>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', fontSize: '13px', fontWeight: 700 }}>
              <Calendar size={16} />
              <span>Ertaga</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>
              {dueTomorrow.length} ta
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rejalashtirilgan</div>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue)', fontSize: '13px', fontWeight: 700 }}>
              <Calendar size={16} />
              <span>Keyingi 7 kun</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>
              {dueThisWeek.length} ta
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bosqichma-bosqich</div>
          </div>
        </div>
      </section>

      {/* Vocabulary List under current filter */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
            {filterMode === 'due' ? 'Kutayotgan so\'zlar ro\'yxati' : filterMode === 'difficult' ? 'Qiyin so\'zlar' : 'Barcha o\'rganilgan so\'zlar'} ({displayedWords.length})
          </h3>

          <div style={{ display: 'flex', gap: '6px', background: 'var(--surface)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <button
              className={`nav-item ${filterMode === 'due' ? 'active' : ''}`}
              onClick={() => setFilterMode('due')}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Kutayotganlar ({dueWords.length})
            </button>
            <button
              className={`nav-item ${filterMode === 'difficult' ? 'active' : ''}`}
              onClick={() => setFilterMode('difficult')}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Qiyinlar ({difficultWords.length})
            </button>
            <button
              className={`nav-item ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Barchasi
            </button>
          </div>
        </div>

        {displayedWords.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="var(--teal)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              Ushbu toifada so'zlar yo'q
            </div>
            <p style={{ fontSize: '13.5px', marginTop: '6px' }}>
              Darslarni o'rgangach, SM-2 algoritmi so'zlarni bu yerga avtomatik rejalashtiradi.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {displayedWords.map(word => {
              const p = progressMap[word.id];
              return (
                <div
                  key={word.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                        {word.word}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--gold-light)' }}>
                        ({word.pos})
                      </span>
                    </div>

                    <button
                      className="icon-button"
                      style={{ width: '30px', height: '30px' }}
                      onClick={() => speechService.speak(word.word)}
                      title="Talaffuz"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>

                  <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    {word.definition}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    <span>{word.courseId === 'book1' ? 'Book 1' : 'Book 2'} · Unit {word.unit}</span>
                    <span>Qaytarishlar: {p?.reps ?? 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
