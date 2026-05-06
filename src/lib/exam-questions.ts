export type Category = 1 | 2 | 3;
export type SubjectKey = 'mathematics' | 'physics' | 'chemistry';
export type PaperKey = 'paper1' | 'paper2';

export interface ExamQuestion {
  id: number;
  sourceId: number;
  text: string;
  options: string[];
  correctAnswers: string[];
  subject: string;
  subjectKey: SubjectKey;
  category: Category;
  paper: PaperKey;
  status: 'answered' | 'not-answered' | 'not-visited' | 'marked';
  selectedOptionIndexes: number[];
  image?: string | null;
}

type RawQuestion = {
  id: number;
  subject: string;
  category: string;
  question: string;
  options: string[];
  answer: string | null;
  image?: string | null;
};

export const subjectLabel: Record<SubjectKey, string> = {
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
};

export const PAPER_SUBJECTS: Record<PaperKey, SubjectKey[]> = {
  paper1: ['mathematics'],
  paper2: ['physics', 'chemistry'],
};

export const CATEGORY_RULES: Record<
  Category,
  { label: string; correct: number; incorrect: number; allowsMulti: boolean }
> = {
  1: { label: 'Category 1', correct: 1, incorrect: -0.25, allowsMulti: false },
  2: { label: 'Category 2', correct: 2, incorrect: -0.5, allowsMulti: false },
  3: { label: 'Category 3', correct: 2, incorrect: 0, allowsMulti: true },
};

export const normalizeSubject = (subject: string): SubjectKey => {
  const value = subject.trim().toLowerCase();
  if (value === 'maths' || value === 'mathematics') return 'mathematics';
  if (value === 'physics') return 'physics';
  return 'chemistry';
};

export const subjectToPaper = (subject: SubjectKey): PaperKey =>
  subject === 'mathematics' ? 'paper1' : 'paper2';

const normalizeCategory = (category: string): Category => {
  const value = category.trim().toUpperCase();
  if (value === 'II') return 2;
  if (value === 'III') return 3;
  return 1;
};

const normalizeCorrectAnswers = (answer: string | null, options: string[]): string[] => {
  if (!answer) return [];

  const resolved = answer
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      const letter = entry.toUpperCase();
      if (/^[A-D]$/.test(letter)) {
        const optionIndex = letter.charCodeAt(0) - 65;
        return options[optionIndex] ? [options[optionIndex]] : [];
      }

      const matchingOption = options.find((option) => option.trim() === entry);
      return matchingOption ? [matchingOption] : [];
    });

  return [...new Set(resolved)];
};

const normalizeQuestion = (question: RawQuestion): Omit<ExamQuestion, 'id'> => {
  const subjectKey = normalizeSubject(question.subject);
  return {
    sourceId: question.id,
    text: question.question,
    options: question.options,
    correctAnswers: normalizeCorrectAnswers(question.answer, question.options),
    subject: question.subject,
    subjectKey,
    category: normalizeCategory(question.category),
    paper: subjectToPaper(subjectKey),
    status: 'not-visited',
    selectedOptionIndexes: [],
    image: question.image ?? null,
  };
};

const loadSubjectQuestions = async (path: string): Promise<RawQuestion[]> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load questions from ${path}`);
  }

  return (await response.json()) as RawQuestion[];
};

export const loadExamQuestions = async (): Promise<ExamQuestion[]> => {
  const [mathsQuestions, physicsQuestions, chemistryQuestions] = await Promise.all([
    loadSubjectQuestions('/questions/json/maths/maths.json'),
    loadSubjectQuestions('/questions/json/physics/physics.json'),
    loadSubjectQuestions('/questions/json/chemistry/chemistry.json'),
  ]);

  const normalizedQuestions = [
    ...mathsQuestions.map(normalizeQuestion),
    ...physicsQuestions.map(normalizeQuestion),
    ...chemistryQuestions.map(normalizeQuestion),
  ];

  return normalizedQuestions.map((question, index) => ({
    ...question,
    id: index + 1,
  }));
};
