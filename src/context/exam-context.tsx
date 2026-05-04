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
import { calculateExamResult, EXAM_DURATION_SECONDS, QUESTIONS_PER_SUBJECT } from "@/lib/exam-utils";
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
    // If time has expired, clear the exam state to allow restart during development
    if (parsed.remainingTime <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RESULT_KEY);
      return;
    }
    setQuestions(parsed.questions ?? []);
    setResponses(parsed.responses ?? {});
    setCurrentSubject(parsed.currentSubject ?? "mathematics");
    setCurrentIndexBySubject(parsed.currentIndexBySubject ?? defaultIndexMap);
    setRemainingTime(parsed.remainingTime ?? EXAM_DURATION_SECONDS);
    setInitialized(true);
  }, []);

  useEffect(() => {
    queueMicrotask(hydrateFromStorage);
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
    console.log(`initializeExam called with ${incomingQuestions.length} questions`);
    setQuestions(incomingQuestions);
    setResponses((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const newResponses = incomingQuestions.reduce<Record<string, QuestionResponse>>((acc, q) => {
        acc[q.id] = { answer: "", visited: false, markedForReview: false };
        return acc;
      }, {});
      console.log(`initializeExam: Created ${Object.keys(newResponses).length} responses`);
      return newResponses;
    });
    setCurrentSubject("mathematics");
    setCurrentIndexBySubject(defaultIndexMap);
    setRemainingTime((prev) => (prev <= 0 ? EXAM_DURATION_SECONDS : prev));
    setInitialized(true);
    console.log("initializeExam: Exam initialized");
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
    queueMicrotask(() => {
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          visited: true,
        },
      }));
    });
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
    const registrationDraft = typeof window !== "undefined"
      ? localStorage.getItem("jee_mock_registration_draft")
      : null;
    const registrationData = registrationDraft ? JSON.parse(registrationDraft) as {
      id: string;
      name: string;
      number: string;
      city: string;
      class_status: string;
      stream: string;
      email: string;
    } : null;

    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(registrationData ?? {}),
        id: registrationData?.id ?? "",
        total_marks: finalResult.totalScore,
        mathematics: finalResult.subjectWise.mathematics.score,
        physics: finalResult.subjectWise.physics.score,
        chemistry: finalResult.subjectWise.chemistry.score,
        submitted_at: finalResult.submittedAt,
        attempted: finalResult.attempted,
        unattempted: finalResult.unattempted,
        correct: finalResult.correct,
        wrong: finalResult.wrong,
      }),
    });

    if (!response.ok) {
      let message = "Failed to submit exam results.";
      try {
        const payload = (await response.json()) as { message?: string };
        if (payload.message) {
          message = payload.message;
        }
      } catch {
        // Keep the generic message when the response body is not JSON.
      }
      throw new Error(message);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("jee_mock_registration_draft");
    }
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
