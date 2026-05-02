"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionPaletteButton } from "@/components/exam/question-palette-button";
import { StatusBadge } from "@/components/exam/status-badge";
import { VirtualKeyboard } from "@/components/exam/virtual-keyboard";
import { useExam } from "@/context/exam-context";
import { formatTime, SUBJECTS, toTitleCase } from "@/lib/exam-utils";
import { Question, Subject } from "@/types/exam";

type QuestionsPayload = { questions: Question[] };

export default function ExamPage() {
  const router = useRouter();
  const {
    questions,
    responses,
    currentSubject,
    currentIndexBySubject,
    remainingTime,
    initialized,
    initializeExam,
    switchSubject,
    jumpToQuestion,
    setAnswer,
    clearAnswer,
    saveAndNext,
    markForReviewAndNext,
    submitExam,
    getQuestionStatus,
  } = useExam();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSubmittedRef = useRef(false);
  const loadingStartedRef = useRef(false);

  // Clear expired result from storage on mount to allow restart
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasResult = localStorage.getItem("jee_mock_exam_latest_result");
      if (hasResult) {
        localStorage.removeItem("jee_mock_exam_latest_result");
        localStorage.removeItem("jee_mock_exam_state");
        console.log("Cleared expired exam data, allowing fresh start");
      }
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    await submitExam();
    router.push("/result");
  }, [router, submitExam, submitting]);

  useEffect(() => {
    const loadQuestions = async () => {
      // Use ref guard to load only once on mount
      if (loadingStartedRef.current) return;
      loadingStartedRef.current = true;

      try {
        console.log("Fetching questions from API...");
        const response = await fetch("/api/questions", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const payload = (await response.json()) as QuestionsPayload;
        console.log(`Loaded ${payload.questions.length} questions`);
        initializeExam(payload.questions);
        
        // Wait for state to propagate
        setTimeout(() => {
          console.log("Setting loading to false");
          setLoading(false);
        }, 150);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("Error loading questions:", msg);
        setError(`Failed to load questions: ${msg}`);
        setLoading(false);
      }
    };
    void loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && remainingTime <= 0 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      void submitExam().then(() => router.push("/result"));
    }
  }, [loading, remainingTime, router, submitExam]);

  const questionsBySubject = useMemo(() => {
    console.log(`Computed questionsBySubject - total questions: ${questions.length}, initialized: ${initialized}`);
    return SUBJECTS.reduce(
      (acc, subject) => {
        const filtered = questions.filter((q) => q.subject === subject).slice(0, 25);
        console.log(`${subject}: ${filtered.length} questions`);
        acc[subject] = filtered;
        return acc;
      },
      {} as Record<Subject, Question[]>
    );
  }, [questions]);

  const currentQuestion = questionsBySubject[currentSubject]?.[currentIndexBySubject[currentSubject] ?? 0] ?? null;
  
  useEffect(() => {
    console.log({
      loading,
      currentQuestion: currentQuestion ? `Q${currentQuestion.id}` : null,
      questions: questions.length,
      initialized,
    });
  }, [loading, currentQuestion, questions, initialized]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-200 p-3">
        <div className="w-full max-w-[500px] rounded-lg bg-white p-8 shadow">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6 text-slate-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (loading || !currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-200 p-3 text-slate-700">
        <div className="w-full max-w-[1000px] rounded-lg bg-white p-8 shadow">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-6 w-1/2 rounded bg-slate-200" />
            <div className="space-y-2">
              <div className="h-40 rounded bg-slate-200" />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="h-10 w-10 rounded bg-slate-200" />
              ))}
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">Loading exam...</p>
        </div>
      </main>
    );
  }

  const subjectQuestions = questionsBySubject[currentSubject];
  const currentResponse = responses[currentQuestion.id];
  const currentAnswer = currentResponse?.answer ?? "";
  const cleanedQuestionText = currentQuestion.questionText
    .replace(
      /^\s*(?:(?:mathematics|physics|chemistry)\s+)?(?:(?:mcq|numerical)\s*)?(?:question\s*)?(?:no\.?|number)?\s*\d+\s*[:.)-]?\s*/i,
      ""
    )
    .replace(/^\s*(?:mathematics|physics|chemistry)\s+(?:mcq|numerical)\s*[:.)-]?\s*/i, "")
    .trim();

  return (
    <main className="min-h-screen bg-slate-200 p-2 text-slate-900">
      <div className="mx-auto w-full max-w-full rounded-lg bg-white shadow ring-1 ring-slate-300">
        <header className="grid grid-cols-3 gap-2 border-b border-slate-300 bg-slate-800 px-4 py-3 text-sm font-semibold text-white">
          <div>Question Type: {currentQuestion.type === "mcq" ? "MCQ" : "Numerical"}</div>
          <div className="text-center">{toTitleCase(currentSubject)}</div>
          <div className="text-right">Time Left: {formatTime(remainingTime)}</div>
        </header>

        <section className="flex min-h-[calc(100vh-4rem)]">
          <div className="flex-1 border-r border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
              <p>Question No. {currentIndexBySubject[currentSubject] + 1}</p>
              <p className="text-right">Marks for correct answer: +4 | Negative: -1</p>
            </div>
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm leading-6">{cleanedQuestionText}</p>
              {currentQuestion.imageUrl ? (
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="mt-3 max-h-64 rounded border border-slate-200"
                />
              ) : null}
            </div>

            {currentQuestion.type === "mcq" ? (
              <div className="space-y-2">
                {[
                  { label: "A", value: currentQuestion.optionA ?? "" },
                  { label: "B", value: currentQuestion.optionB ?? "" },
                  { label: "C", value: currentQuestion.optionC ?? "" },
                  { label: "D", value: currentQuestion.optionD ?? "" },
                ].map((option) => (
                  <label
                    key={option.label}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white p-3 text-sm hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      checked={currentAnswer === option.label}
                      onChange={() => setAnswer(currentQuestion.id, option.label)}
                    />
                    <span className="font-semibold text-slate-800">{option.value}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800">
                  {currentAnswer || <span className="text-slate-400">No answer entered</span>}
                </div>
                <VirtualKeyboard
                  value={currentAnswer}
                  onValueChange={(value) => setAnswer(currentQuestion.id, value)}
                  disabled={false}
                />
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => markForReviewAndNext(currentQuestion)}
                  className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-bold text-white hover:bg-purple-700"
                >
                  Mark for Review & Next
                </button>
                <button
                  type="button"
                  onClick={() => clearAnswer(currentQuestion.id)}
                  className="rounded-lg bg-red-500 px-5 py-2 text-sm font-bold text-white hover:bg-red-600"
                >
                  Clear Response
                </button>
              </div>
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={() => saveAndNext(currentQuestion)}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Save & Next
                </button>
              </div>
            </div>
          </div>

          <aside className="box-border flex w-[320px] flex-col overflow-y-auto bg-slate-50 p-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-300 bg-white p-3">
              <img src="https://i.pravatar.cc/150?img=11" alt="Candidate Profile" className="h-14 w-14 rounded-full border border-slate-200 object-cover" />
              <div>
                <p className="text-lg font-semibold">Aman Jha</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-slate-300 bg-white p-3">
              <StatusBadge label="Answered" color="bg-emerald-500" />
              <StatusBadge label="Not Answered" color="bg-red-500" />
              <StatusBadge label="Not Visited" color="bg-slate-400" />
              <StatusBadge label="Marked for Review" color="bg-purple-600" />
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => switchSubject(subject)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    currentSubject === subject
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-300"
                  }`}
                >
                  {toTitleCase(subject)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-3 rounded-lg border border-slate-300 bg-white p-3">
              {subjectQuestions.map((question, idx) => {
                const status = getQuestionStatus(question);
                const isActive = currentIndexBySubject[currentSubject] === idx;
                return (
                  <QuestionPaletteButton
                    key={question.id}
                    index={idx}
                    status={status}
                    isActive={isActive}
                    onClick={() => jumpToQuestion(currentSubject, idx)}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="mt-6 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
