import { Question } from '@/lib/types';

const QUESTION_PATHS = {
  physics: '/questions/json/physics/physics.json',
  chemistry: '/questions/json/chemistry/chemistry.json',
  maths: '/questions/json/maths/maths.json',
} as const;

type QuestionBankKey = keyof typeof QUESTION_PATHS;

const bankCache: Partial<Record<QuestionBankKey, Promise<Question[]>>> = {};

function normalizeSubject(subject: string): Question['subject'] {
  const value = String(subject ?? '').toLowerCase().trim();
  if (value === 'mathematics') {
    return 'maths';
  }

  return value as Question['subject'];
}

async function loadQuestionBank(key: QuestionBankKey): Promise<Question[]> {
  if (!bankCache[key]) {
    bankCache[key] = fetch(QUESTION_PATHS[key])
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load question bank: ${QUESTION_PATHS[key]}`);
        }

        return response.json() as Promise<Question[]>;
      })
      .then((questions) =>
        questions.map((question) => ({
          ...question,
          subject: normalizeSubject(question.subject),
          category: question.category.trim().toUpperCase() as Question['category'],
          options: Array.isArray(question.options) ? [...question.options] : [],
          image: question.image ?? null,
          answer: Array.isArray(question.answer)
            ? question.answer.map((entry) => String(entry).trim()).filter(Boolean)
            : String(question.answer ?? '').trim(),
          source_pdf: String(question.source_pdf ?? '').trim(),
          question: String(question.question ?? '').trim(),
        }))
      );
  }

  return bankCache[key] as Promise<Question[]>;
}

export function loadPhysicsQuestions(): Promise<Question[]> {
  return loadQuestionBank('physics');
}

export function loadChemistryQuestions(): Promise<Question[]> {
  return loadQuestionBank('chemistry');
}

export function loadMathsQuestions(): Promise<Question[]> {
  return loadQuestionBank('maths');
}

export async function loadAllQuestions(): Promise<Question[]> {
  const [physics, chemistry, maths] = await Promise.all([
    loadPhysicsQuestions(),
    loadChemistryQuestions(),
    loadMathsQuestions(),
  ]);

  return [...physics, ...chemistry, ...maths];
}