export type Subject = "mathematics" | "physics" | "chemistry";
export type QuestionType = "mcq" | "numerical";

export type Question = {
  id: string;
  subject: Subject;
  type: QuestionType;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  imageUrl?: string;
};

export type QuestionStatus =
  | "not-visited"
  | "not-answered"
  | "answered"
  | "marked-for-review";

export type QuestionResponse = {
  answer: string;
  visited: boolean;
  markedForReview: boolean;
};

export type SubjectSummary = {
  score: number;
  attempted: number;
  unattempted: number;
  correct: number;
  wrong: number;
};

export type ExamResult = {
  totalScore: number;
  attempted: number;
  unattempted: number;
  correct: number;
  wrong: number;
  subjectWise: Record<Subject, SubjectSummary>;
  submittedAt: string;
};
