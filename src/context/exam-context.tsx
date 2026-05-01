"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { calculateExamResult, EXAM_DURATION_SECONDS, QUESTIONS_PER_SUBJECT, SUBJECTS } from "@/lib/exam-utils";
import { ExamResult, Question, QuestionResponse, Subject } from "@/types/exam";

const STORAGE_KEY = "jee_mock_exam_state";
const RESULT_KEY = "jee_mock_exam_latest_result";

type ExamContextValue = {
  questions: Question[];
  responses: Record<string, QuestionResponse>;
  currentSubject: Subject;
  currentIndexBySubject: Record<Subject, number>;
  remainingTime: number;
  initialized: boolean;
  result: ExamResult | null;
  initializeExam: (questions: Question[]) => void;
  switchSubject: (subject: Subject) => void;
  jumpToQuestion: (subject: Subject, index: number) => void;
  setAnswer: (questionId: string, answer: string) => void;
  clearAnswer: (questionId: string) => void;
  saveAndNext: (question: Question) => void;
  markForReviewAndNext: (question: Question) => void;
  submitExam: () => Promise<ExamResult>;
  getQuestionStatus: (question: Question) => "not-visited" | "not-answered" | "answered" | "marked-for-review";
};

const ExamContext = createContext<ExamContextValue | null>(null);

const defaultIndexMap: Record<Subject, number> = {
  mathematics: 0,
  physics: 0,
  chemistry: 0,
};

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [currentSubject, setCurrentSubject] = useState<Subject>("mathematics");
  const [currentIndexBySubject, setCurrentIndexBySubject] =
    useState<Record<Subject, number>>(defaultIndexMap);
  const [remainingTime, setRemainingTime] = useState(EXAM_DURATION_SECONDS);
  const [initialized, setInitialized] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const hasHydrated = useRef(false);

  const hydrateFromStorage = useCallback(() => {
    if (hasHydrated.current || typeof window === "undefined") return;
    hasHydrated.current = true;
    const raw = localStorage.getItem(STORAGE_KEY);
    const rawResult = localStorage.getItem(RESULT_KEY);
    if (rawResult) {
      setResult(JSON.parse(rawResult) as ExamResult);
    }
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      questions: Question[];
      responses: Record<string, QuestionResponse>;
      currentSubject: Subject;
      currentIndexBySubject: Record<Subject, number>;
      remainingTime: number;
    };
    setQuestions(parsed.questions ?? []);
    setResponses(parsed.responses ?? {});
    setCurrentSubject(parsed.currentSubject ?? "mathematics");
    setCurrentIndexBySubject(parsed.currentIndexBySubject ?? defaultIndexMap);
    setRemainingTime(parsed.remainingTime ?? EXAM_DURATION_SECONDS);
    setInitialized(true);
  }, []);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined" || !initialized) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        questions,
        responses,
        currentSubject,
        currentIndexBySubject,
        remainingTime,
      })
    );
  }, [questions, responses, currentSubject, currentIndexBySubject, remainingTime, initialized]);

  useEffect(() => {
    if (!initialized) return;
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [initialized]);

  const initializeExam = useCallback((incomingQuestions: Question[]) => {
    setQuestions(incomingQuestions);
    setResponses((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return incomingQuestions.reduce<Record<string, QuestionResponse>>((acc, q) => {
        acc[q.id] = { answer: "", visited: false, markedForReview: false };
        return acc;
      }, {});
    });
    setCurrentSubject("mathematics");
    setCurrentIndexBySubject(defaultIndexMap);
    setRemainingTime((prev) => (prev <= 0 ? EXAM_DURATION_SECONDS : prev));
    setInitialized(true);
  }, []);

  const getQuestionsBySubject = useCallback(
    (subject: Subject) => questions.filter((q) => q.subject === subject).slice(0, QUESTIONS_PER_SUBJECT),
    [questions]
  );

  const currentQuestion = useMemo(() => {
    const list = getQuestionsBySubject(currentSubject);
    return list[currentIndexBySubject[currentSubject] ?? 0] ?? null;
  }, [currentIndexBySubject, currentSubject, getQuestionsBySubject]);

  useEffect(() => {
    if (!currentQuestion) return;
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        visited: true,
      },
    }));
  }, [currentQuestion]);

  const switchSubject = useCallback((subject: Subject) => {
    setCurrentSubject(subject);
  }, []);

  const jumpToQuestion = useCallback((subject: Subject, index: number) => {
    setCurrentSubject(subject);
    setCurrentIndexBySubject((prev) => ({ ...prev, [subject]: index }));
  }, []);

  const setAnswer = useCallback((questionId: string, answer: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { answer: "", visited: true, markedForReview: false }),
        answer,
        visited: true,
      },
    }));
  }, []);

  const clearAnswer = useCallback((questionId: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { answer: "", visited: true, markedForReview: false }),
        answer: "",
      },
    }));
  }, []);

  const moveNextWithinSubject = useCallback((subject: Subject) => {
    setCurrentIndexBySubject((prev) => ({
      ...prev,
      [subject]: Math.min((prev[subject] ?? 0) + 1, QUESTIONS_PER_SUBJECT - 1),
    }));
  }, []);

  const saveAndNext = useCallback(
    (question: Question) => {
      setResponses((prev) => ({
        ...prev,
        [question.id]: {
          ...prev[question.id],
          visited: true,
          markedForReview: false,
        },
      }));
      moveNextWithinSubject(question.subject);
    },
    [moveNextWithinSubject]
  );

  const markForReviewAndNext = useCallback(
    (question: Question) => {
      setResponses((prev) => ({
        ...prev,
        [question.id]: {
          ...prev[question.id],
          visited: true,
          markedForReview: true,
        },
      }));
      moveNextWithinSubject(question.subject);
    },
    [moveNextWithinSubject]
  );

  const getQuestionStatus = useCallback(
    (question: Question) => {
      const response = responses[question.id];
      if (!response || !response.visited) return "not-visited";
      if (response.markedForReview) return "marked-for-review";
      if (!response.answer) return "not-answered";
      return "answered";
    },
    [responses]
  );

  const submitExam = useCallback(async () => {
    const finalResult = calculateExamResult(questions, responses);
    setResult(finalResult);
    if (typeof window !== "undefined") {
      localStorage.setItem(RESULT_KEY, JSON.stringify(finalResult));
      localStorage.removeItem(STORAGE_KEY);
    }
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedAt: finalResult.submittedAt,
        result: finalResult,
        responses,
      }),
    });
    return finalResult;
  }, [questions, responses]);

  return (
    <ExamContext.Provider
      value={{
        questions,
        responses,
        currentSubject,
        currentIndexBySubject,
        remainingTime,
        initialized,
        result,
        initializeExam,
        switchSubject,
        jumpToQuestion,
        setAnswer,
        clearAnswer,
        saveAndNext,
        markForReviewAndNext,
        submitExam,
        getQuestionStatus,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) throw new Error("useExam must be used within ExamProvider");
  return context;
}
