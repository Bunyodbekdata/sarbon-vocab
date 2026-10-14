import React, { useState, useMemo } from 'react';
import { Search, Volume2, Filter, Layers, CheckCircle2 } from 'lucide-react';
import { VocabularyItem, WordProgress } from '../../types/vocabulary';
import { speechService } from '../../services/speechService';

interface LibraryViewProps {
  allWords: VocabularyItem[];
  progressMap: Record<string, WordProgress>;
  onStudySingleWord?: (word: VocabularyItem) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  allWords,
  progressMap,
  onStudySingleWord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<'all' | 'book1' | 'book2'>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [posFilter, setPosFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);

  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allWords.filter(item => {
      // Search matching (word or definition)
      if (q) {
        const matchWord = item.word.toLowerCase().includes(q);
        const matchDef = item.definition.toLowerCase().includes(q);
        const matchEx = item.example.toLowerCase().includes(q);
        if (!matchWord && !matchDef && !matchEx) return false;
      }

      // Course filter
      if (courseFilter !== 'all' && item.courseId !== courseFilter) {
        return false;
      }

      // Unit filter
      if (unitFilter !== 'all' && item.unit !== Number(unitFilter)) {
        return false;
      }

      // POS filter
      if (posFilter !== 'all' && item.pos !== posFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const p = progressMap[item.id];
        const status = p ? p.status : 'new';
        if (status !== statusFilter) return false;
      }

      return true;
    });
  }, [allWords, searchQuery, courseFilter, unitFilter, posFilter, statusFilter, progressMap]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
          Lug'at Kutubxonasi
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
          Jami {allWords.length} ta so'zdan iborat to'liq lug'at fondi. Inglizcha yoki o'zbekcha qidiring.
        </p>
      </div>

      {/* Search Input Bar & Quick Filters */}
      <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="So'z yoki tarjimani qidiring (masalan: afraid, qo'rqqan, habit)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '46px', fontSize: '15px' }}
          />
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Filter size={15} />
            <span>Filtrlar:</span>
          </div>

          {/* Course filter */}
          <select
            className="btn-secondary"
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value as any)}
            style={{ padding: '6px 12px', fontSize: '13px', minHeight: '34px' }}
          >
            <option value="all">Barcha Kurslar</option>
            <option value="book1">Book 1 (A2-B1)</option>
            <option value="book2">Book 2 (B1-B2)</option>
          </select>

          {/* Unit filter */}
          <select
            className="btn-secondary"
            value={unitFilter}
            onChange={e => setUnitFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '13px', minHeight: '34px' }}
          >
            <option value="all">Barcha Unitlar (1-30)</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(u => (
              <option key={u} value={u.toString()}>Unit {u}</option>
            ))}
          </select>

          {/* Part of Speech */}
          <select
            className="btn-secondary"
            value={posFilter}
            onChange={e => setPosFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '13px', minHeight: '34px' }}
          >
            <option value="all">Barcha So'z turkumlari</option>
            <option value="n.">Noun (Ot)</option>
            <option value="v.">Verb (Fe'l)</option>
            <option value="adj.">Adjective (Sifat)</option>
            <option value="adv.">Adverb (Ravish)</option>
          </select>

          {/* Status filter */}
          <select
            className="btn-secondary"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '13px', minHeight: '34px' }}
          >
            <option value="all">Barcha Holatlar</option>
            <option value="new">Yangi so'zlar</option>
            <option value="learning">O'rganilayotgan</option>
            <option value="mastered">O'zlashtirilgan</option>
          </select>

          <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
            Natijalar: <strong style={{ color: 'var(--text-main)' }}>{filteredWords.length}</strong> ta
          </span>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {filteredWords.slice(0, 120).map((word: VocabularyItem) => {
          const p = progressMap[word.id];
          const isMastered = p?.status === 'mastered';
          const isLearning = p?.status === 'learning';

          return (
            <div
              key={word.id}
              className="glass-card"
              style={{
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedWord(word)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-main)' }}>
                    {word.word}
                  </span>
                  <span className={`pos-tag ${word.pos.replace('.', '')}`}>
                    {word.pos}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isMastered && <CheckCircle2 size={16} color="var(--teal)" />}
                  <button
                    className="icon-button"
                    style={{ width: '32px', height: '32px' }}
                    onClick={e => {
                      e.stopPropagation();
                      speechService.speak(word.word);
                    }}
                    title="Talaffuz"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {word.definition}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic', borderLeft: '2px solid var(--border)', paddingLeft: '8px', marginTop: '4px' }}>
                "{word.example}"
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)', marginTop: 'auto', paddingTop: '4px' }}>
                <span>{word.courseId === 'book1' ? 'Book 1' : 'Book 2'} · Unit {word.unit}</span>
                <span style={{ color: isMastered ? 'var(--teal)' : isLearning ? 'var(--blue)' : 'var(--text-muted)' }}>
                  {isMastered ? 'Mastered' : isLearning ? 'Learning' : 'New'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWords.length > 120 && (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
          Dastlabki 120 ta so'z ko'rsatilmoqda. Qidiruv orqali aniqroq natija oling.
        </div>
      )}

      {/* Word Detail Modal */}
      {selectedWord && (
        <div className="modal-backdrop" onClick={() => setSelectedWord(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className={`pos-tag ${selectedWord.pos.replace('.', '')}`}>
                  {selectedWord.pos}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
                  {selectedWord.word.toUpperCase()}
                </h2>
              </div>
              <button className="icon-button" onClick={() => setSelectedWord(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button
                className="btn-secondary"
                onClick={() => speechService.speak(selectedWord.word)}
                style={{ gap: '8px' }}
              >
                <Volume2 size={18} color="var(--gold-light)" />
                <span>Talaffuzni tinglash</span>
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {selectedWord.courseId === 'book1' ? 'Book 1' : 'Book 2'} · Unit {selectedWord.unit}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                  O'zbekcha Tarjimasi
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                  {selectedWord.definition}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                  Misol
                </div>
                <div style={{ fontSize: '15.5px', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '3px solid var(--gold)', paddingLeft: '12px' }}>
                  "{selectedWord.example}"
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setSelectedWord(null)}>
                Yopish
              </button>
              {onStudySingleWord && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    const w = selectedWord;
                    setSelectedWord(null);
                    onStudySingleWord(w);
                  }}
                >
                  <Layers size={16} />
                  <span>Flashcardda o'rganish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
