import { CourseMeta, UnitMeta, VocabularyItem, PartOfSpeech } from '../types/vocabulary';
import { BOOK_1_RAW_DATA } from './book1Data';
import { BOOK_2_RAW_DATA } from './book2Data';

export const COURSES: CourseMeta[] = [
  {
    id: 'book1',
    title: '4000 Essential English Words 1',
    subtitle: 'Foundation & Elementary Vocabulary (A2 - B1)',
    level: 'A2 - B1',
    description: 'Boshlang\'ich va o\'rta darajadagi eng muhim 600 ta so\'z va iboralar. Har bir dars o\'zbekcha tarjimasi va misollari bilan.',
    totalUnits: 30,
    totalWords: 600,
  },
  {
    id: 'book2',
    title: '4000 Essential English Words 2',
    subtitle: 'Pre-Intermediate & Intermediate Vocabulary (B1 - B2)',
    level: 'B1 - B2',
    description: 'O\'rta va yuqori o\'rta darajadagi 600 ta akademik va kundalik leksika. Sarbon O\'quv Markazi o\'quvchilari uchun maxsus saralangan.',
    totalUnits: 30,
    totalWords: 600,
  },
];

// Helper to normalize Part of Speech
function normalizePos(posStr: string): PartOfSpeech {
  const p = posStr.trim().toLowerCase();
  if (p === 'n.') return 'n.';
  if (p === 'v.') return 'v.';
  if (p === 'adj.') return 'adj.';
  if (p === 'adv.') return 'adv.';
  if (p === 'prep.') return 'prep.';
  if (p === 'pron.') return 'pron.';
  if (p === 'conj.') return 'conj.';
  return 'other';
}

// Transform raw arrays into unified VocabularyItem collection
export const ALL_VOCABULARY: VocabularyItem[] = [
  ...BOOK_1_RAW_DATA.map((item, idx) => ({
    id: `b1_u${item.unit}_w${idx + 1}`,
    word: item.word,
    definition: item.definition,
    example: item.example,
    pos: normalizePos(item.pos),
    courseId: 'book1' as const,
    unit: item.unit,
  })),
  ...BOOK_2_RAW_DATA.map((item, idx) => ({
    id: `b2_u${item.unit}_w${idx + 1}`,
    word: item.word,
    definition: item.definition,
    example: item.example,
    pos: normalizePos(item.pos),
    courseId: 'book2' as const,
    unit: item.unit,
  })),
];

// Generate 30 Unit metadata entries for each course
export const UNITS: UnitMeta[] = [];

for (let u = 1; u <= 30; u++) {
  const b1Words = ALL_VOCABULARY.filter(v => v.courseId === 'book1' && v.unit === u);
  const sampleWords = b1Words.slice(0, 3).map(w => w.word).join(', ');
  UNITS.push({
    unitNumber: u,
    courseId: 'book1',
    title: `Unit ${u}`,
    wordCount: b1Words.length,
    description: `Target words: ${sampleWords}... va boshqa asosiy leksika.`,
  });
}

for (let u = 1; u <= 30; u++) {
  const b2Words = ALL_VOCABULARY.filter(v => v.courseId === 'book2' && v.unit === u);
  const sampleWords = b2Words.slice(0, 3).map(w => w.word).join(', ');
  UNITS.push({
    unitNumber: u,
    courseId: 'book2',
    title: `Unit ${u}`,
    wordCount: b2Words.length,
    description: `Target words: ${sampleWords}... va boyitilgan leksika.`,
  });
}
