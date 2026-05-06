export type SubjectKey = 'maths' | 'physics' | 'chemistry';
export type PaperKey = 'paper1' | 'paper2';
export type QuestionCategory = 'I' | 'II' | 'III';

export type QuestionStatus = 'answered' | 'not-answered' | 'not-visited' | 'marked';

export interface Question {
  id: number;
  subject: SubjectKey;
  category: QuestionCategory;
  question: string;
  options: string[];
  answer: string;
  image: string | null;
  source_pdf: string;
}

export interface GeneratedQuestion extends Question {
  questionKey: string;
  subjectKey: SubjectKey;
  paper: PaperKey;
  correctAnswers: string[];
}

export interface ExamPaper {
  schemaVersion?: number;
  userId?: string;
  generatedAt: string;
  totalQuestions: number;
  subjectCounts: Record<SubjectKey, number>;
  categoryCounts: Record<QuestionCategory, number>;
  questions: GeneratedQuestion[];
  generationNotes?: string[];
}

export interface UserAnswer {
  questionKey: string;
  selectedOptionIndexes: number[];
}

export interface ExamSessionState {
  userId?: string;
  currentQuestionIndex: number;
  currentQuestionKey: string | null;
  timeLeft: number;
  activePaper: PaperKey;
  activeSubject: SubjectKey;
  selectedAnswersByQuestionKey: Record<string, number[]>;
  markedQuestionKeys: string[];
  visitedQuestionKeys: string[];
}

export interface ExamQuestionView extends GeneratedQuestion {
  selectedOptionIndexes: number[];
  status: QuestionStatus;
}

export interface EvaluationResult {
  totalMarks: number;
  subjectMarks: Record<SubjectKey, number>;
  categoryMarks: Record<QuestionCategory, number>;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}