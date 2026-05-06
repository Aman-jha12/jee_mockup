import { CATEGORY_RULES } from '@/lib/generateTest';
import { EvaluationResult, ExamPaper, UserAnswer } from '@/lib/types';

function normalizeAnswerIndexes(questionKey: string, answers: UserAnswer[]): number[] {
  return answers.find((entry) => entry.questionKey === questionKey)?.selectedOptionIndexes ?? [];
}

function scoreQuestion(question: ExamPaper['questions'][number], selectedOptionIndexes: number[]): number {
  if (selectedOptionIndexes.length === 0 || question.correctAnswers.length === 0) {
    return 0;
  }

  const selectedValues = selectedOptionIndexes
    .map((index) => question.options[index])
    .filter((value): value is string => typeof value === 'string');

  const selectedSet = new Set(selectedValues);
  const correctSet = new Set(question.correctAnswers);
  const allowsMulti = CATEGORY_RULES[question.category].allowsMulti;

  const selectedOnlyCorrect = [...selectedSet].every((value) => correctSet.has(value));
  if (!selectedOnlyCorrect) {
    return CATEGORY_RULES[question.category].incorrect;
  }

  if (allowsMulti) {
    if (selectedSet.size === correctSet.size) {
      return CATEGORY_RULES[question.category].correct;
    }

    if (selectedSet.size === 1) {
      return 1;
    }

    return 0;
  }

  return selectedSet.size === 1 && correctSet.has(selectedValues[0])
    ? CATEGORY_RULES[question.category].correct
    : CATEGORY_RULES[question.category].incorrect;
}

export function evaluateExam(paper: ExamPaper, userAnswers: UserAnswer[]): EvaluationResult {
  const result: EvaluationResult = {
    totalMarks: 0,
    subjectMarks: { maths: 0, physics: 0, chemistry: 0 },
    categoryMarks: { I: 0, II: 0, III: 0 },
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0,
  };

  for (const question of paper.questions) {
    const selectedOptionIndexes = normalizeAnswerIndexes(question.questionKey, userAnswers);
    const attempted = selectedOptionIndexes.length > 0;
    const score = attempted ? scoreQuestion(question, selectedOptionIndexes) : 0;

    result.totalMarks += score;
    result.subjectMarks[question.subjectKey] += score;
    result.categoryMarks[question.category] += score;

    if (!attempted) {
      result.unansweredCount += 1;
      continue;
    }

    const maxScore = CATEGORY_RULES[question.category].correct;
    if (score >= maxScore) {
      result.correctCount += 1;
    } else {
      result.wrongCount += 1;
    }
  }

  result.totalMarks = Number(result.totalMarks.toFixed(2));
  result.subjectMarks = {
    maths: Number(result.subjectMarks.maths.toFixed(2)),
    physics: Number(result.subjectMarks.physics.toFixed(2)),
    chemistry: Number(result.subjectMarks.chemistry.toFixed(2)),
  };
  result.categoryMarks = {
    I: Number(result.categoryMarks.I.toFixed(2)),
    II: Number(result.categoryMarks.II.toFixed(2)),
    III: Number(result.categoryMarks.III.toFixed(2)),
  };

  return result;
}