import { loadAllQuestions } from '@/lib/question-loader';
import { shuffleArray } from '@/lib/shuffle';
import { ExamPaper, GeneratedQuestion, Question, QuestionCategory, PaperKey, SubjectKey } from '@/lib/types';
import { loadExamPaper, saveExamPaper } from '@/lib/storage';

export const SUBJECT_LABELS: Record<SubjectKey, string> = {
  maths: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
};

export const PAPER_SUBJECTS: Record<PaperKey, SubjectKey[]> = {
  paper1: ['maths'],
  paper2: ['physics', 'chemistry'],
};

export const CATEGORY_RULES: Record<
  QuestionCategory,
  { label: string; correct: number; incorrect: number; allowsMulti: boolean }
> = {
  I: { label: 'Category I', correct: 1, incorrect: -0.25, allowsMulti: false },
  II: { label: 'Category II', correct: 2, incorrect: -0.5, allowsMulti: false },
  III: { label: 'Category III', correct: 2, incorrect: 0, allowsMulti: true },
};

export const EXAM_DISTRIBUTION: Record<SubjectKey, Record<QuestionCategory, number>> = {
  maths: { I: 50, II: 15, III: 10 },
  physics: { I: 30, II: 5, III: 5 },
  chemistry: { I: 30, II: 5, III: 5 },
};

const EXAM_PAPER_SCHEMA_VERSION = 3;
const CATEGORY_ORDER: QuestionCategory[] = ['I', 'II', 'III'];

export function subjectToPaper(subject: SubjectKey): PaperKey {
  return subject === 'maths' ? 'paper1' : 'paper2';
}

function normalizeCorrectAnswers(question: Question): string[] {
  const rawTokens = Array.isArray(question.answer)
    ? question.answer
    : String(question.answer ?? '').split(',');

  const tokens = rawTokens
    .map((entry) => String(entry))
    .map((entry) => entry.trim())
    .filter(Boolean);

  const resolved = tokens.flatMap((entry) => {
    const letter = entry.toUpperCase();
    if (/^[A-D]$/.test(letter)) {
      const optionIndex = letter.charCodeAt(0) - 65;
      return question.options[optionIndex] ? [question.options[optionIndex]] : [];
    }

    const matchingOption = question.options.find((option) => option.trim() === entry);
    return matchingOption ? [matchingOption] : [];
  });

  return [...new Set(resolved)];
}

function pickQuestions(questions: Question[], count: number): Question[] {
  if (questions.length < count) {
    // Fallback: if pool is smaller than requested, return all available
    // and let caller track the shortage via metadata/warnings.
    console.warn(
      `Not enough questions available for requested count ${count}. Returning ${questions.length} available questions.`
    );
    return shuffleArray(questions).slice(0, questions.length);
  }

  return shuffleArray(questions).slice(0, count);
}

function buildGeneratedQuestion(question: Question): GeneratedQuestion {
  const subjectKey = question.subject;
  return {
    ...question,
    subjectKey,
    paper: subjectToPaper(subjectKey),
    questionKey: `${subjectKey}:${question.id}`,
    correctAnswers: normalizeCorrectAnswers(question),
  };
}

export function buildExamPaper(allQuestions: Question[], userId?: string): ExamPaper {
  const generationNotes: string[] = [];

  const selectedQuestions = (Object.keys(EXAM_DISTRIBUTION) as SubjectKey[]).flatMap((subject) => {
    const subjectQuestions = allQuestions.filter((question) => question.subject === subject);
    const selectedForSubject = CATEGORY_ORDER.flatMap((category) => {
      const required = EXAM_DISTRIBUTION[subject][category];
      const pool = subjectQuestions.filter((question) => question.category === category);
      const picked = pickQuestions(pool, required);

      if (picked.length < required) {
        generationNotes.push(
          `Category shortage: subject=${subject} category=${category} requested=${required} selected=${picked.length}`
        );
      }
      return picked;
    });

    return selectedForSubject;
  });

  // Shuffle within each category per subject to randomize while keeping categories together
  const shuffledByCategory = (Object.keys(EXAM_DISTRIBUTION) as SubjectKey[])
    .flatMap((subject) => {
      const subjectQuestions = selectedQuestions.filter((q) => q.subject === subject);
      return CATEGORY_ORDER.flatMap((category) => {
        const categoryQuestions = subjectQuestions.filter((q) => q.category === category);
        return shuffleArray(categoryQuestions);
      });
    });

  const generatedQuestions = shuffledByCategory.map(buildGeneratedQuestion);

  const subjectCounts = generatedQuestions.reduce<Record<SubjectKey, number>>(
    (counts, question) => {
      counts[question.subjectKey] += 1;
      return counts;
    },
    { maths: 0, physics: 0, chemistry: 0 }
  );

  const categoryCounts = generatedQuestions.reduce<Record<QuestionCategory, number>>(
    (counts, question) => {
      counts[question.category] += 1;
      return counts;
    },
    { I: 0, II: 0, III: 0 }
  );

  const paper: ExamPaper = {
    schemaVersion: EXAM_PAPER_SCHEMA_VERSION,
    userId,
    generatedAt: new Date().toISOString(),
    totalQuestions: generatedQuestions.length,
    subjectCounts,
    categoryCounts,
    questions: generatedQuestions,
  };

  if (generationNotes.length > 0) {
    paper.generationNotes = generationNotes;
    console.warn('Exam generation notes:', generationNotes);
  }

  return paper;
}

export async function generateExamPaper(userId?: string): Promise<ExamPaper> {
  const storedPaper = loadExamPaper();
  if (
    storedPaper &&
    storedPaper.schemaVersion === EXAM_PAPER_SCHEMA_VERSION &&
    (!storedPaper.userId || !userId || storedPaper.userId === userId)
  ) {
    return storedPaper;
  }

  const allQuestions = await loadAllQuestions();
  const paper = buildExamPaper(allQuestions, userId);
  saveExamPaper(paper);

  return paper;
}