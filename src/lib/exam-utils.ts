import { ExamResult, Question, QuestionResponse, Subject, SubjectSummary } from "@/types/exam";

export const SUBJECTS: Subject[] = ["mathematics", "physics", "chemistry"];
export const QUESTIONS_PER_SUBJECT = 25;
export const EXAM_DURATION_SECONDS = 180 * 60;

export const toTitleCase = (subject: Subject) =>
  subject.charAt(0).toUpperCase() + subject.slice(1);

export const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hh = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const ss = String(safeSeconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

export const calculateExamResult = (
  questions: Question[],
  responses: Record<string, QuestionResponse>
): ExamResult => {
  const subjectWise = SUBJECTS.reduce(
    (acc, subject) => {
      acc[subject] = {
        score: 0,
        attempted: 0,
        unattempted: 0,
        correct: 0,
        wrong: 0,
      };
      return acc;
    },
    {} as Record<Subject, SubjectSummary>
  );

  let totalScore = 0;
  let attempted = 0;
  let unattempted = 0;
  let correct = 0;
  let wrong = 0;

  for (const question of questions) {
    const response = responses[question.id];
    const givenAnswer = response?.answer?.trim() ?? "";
    const isAttempted = Boolean(givenAnswer);
    const isCorrect = isAttempted && givenAnswer === question.correctAnswer;

    if (!isAttempted) {
      unattempted += 1;
      subjectWise[question.subject].unattempted += 1;
      continue;
    }

    attempted += 1;
    subjectWise[question.subject].attempted += 1;

    if (isCorrect) {
      correct += 1;
      subjectWise[question.subject].correct += 1;
      totalScore += 4;
      subjectWise[question.subject].score += 4;
      continue;
    }

    wrong += 1;
    subjectWise[question.subject].wrong += 1;
    if (question.type === "mcq") {
      totalScore -= 1;
      subjectWise[question.subject].score -= 1;
    }
  }

  return {
    totalScore,
    attempted,
    unattempted,
    correct,
    wrong,
    subjectWise,
    submittedAt: new Date().toISOString(),
  };
};
