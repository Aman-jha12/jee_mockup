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
  const autoSubmittedRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    await submitExam();
    router.push("/result");
  }, [router, submitExam, submitting]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (initialized && questions.length > 0) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/questions", { cache: "no-store" });
      const payload = (await response.json()) as QuestionsPayload;
      initializeExam(payload.questions);
      setLoading(false);
    };
    void loadQuestions();
  }, [initializeExam, initialized, questions.length]);

  useEffect(() => {
    if (!loading && remainingTime <= 0 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      void submitExam().then(() => router.push("/result"));
    }
  }, [loading, remainingTime, router, submitExam]);

  const questionsBySubject = useMemo(
    () =>
      SUBJECTS.reduce(
        (acc, subject) => {
          acc[subject] = questions.filter((q) => q.subject === subject).slice(0, 25);
          return acc;
        },
        {} as Record<Subject, Question[]>
      ),
    [questions]
  );

  const currentQuestion = questionsBySubject[currentSubject]?.[currentIndexBySubject[currentSubject] ?? 0] ?? null;

  if (loading || !currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-700">
        Loading exam...
      </main>
    );
  }

  const subjectQuestions = questionsBySubject[currentSubject];
  const currentResponse = responses[currentQuestion.id];
  const currentAnswer = currentResponse?.answer ?? "";

  return (
    <main className="min-h-screen bg-slate-200 p-3 text-slate-900">
      <div className="mx-auto max-w-[1400px] rounded-lg bg-white shadow ring-1 ring-slate-300">
        <header className="grid grid-cols-3 gap-2 border-b border-slate-300 bg-slate-800 px-4 py-3 text-sm font-semibold text-white">
          <div>Question Type: {currentQuestion.type === "mcq" ? "MCQ" : "Numerical"}</div>
          <div className="text-center">{toTitleCase(currentSubject)}</div>
          <div className="text-right">Time Left: {formatTime(remainingTime)}</div>
        </header>

        <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
          Marks for correct answer: +4 | Negative: -1
        </p>

        <section className="flex min-h-[78vh]">
          <div className="flex-1 border-r border-slate-200 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Question No. {currentIndexBySubject[currentSubject] + 1}
            </p>
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm leading-6">{currentQuestion.questionText}</p>
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
                    <span>{option.label}. {option.value}</span>
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
              <div className="h-14 w-14 rounded-full bg-slate-300" />
              <div>
                <p className="text-sm font-semibold">Candidate</p>
                <p className="text-xs text-slate-500">Photo Placeholder</p>
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
              className="mt-auto rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
