'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, ChevronRight, Flag, XCircle, AlertCircle, Maximize2 } from 'lucide-react';
import { submitExam } from '@/lib/api';
import {
  CATEGORY_RULES,
  PAPER_SUBJECTS,
  ExamQuestion,
  loadExamQuestions,
  subjectLabel,
  subjectToPaper,
  SubjectKey,
  PaperKey,
} from '@/lib/exam-questions';

type Question = ExamQuestion;

export default function ExamInterface() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(4 * 60 * 60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [avatarSeed] = useState(() => Math.random().toString(36).substring(7));
  const [submitError, setSubmitError] = useState('');
  const [activePaper, setActivePaper] = useState<PaperKey>('paper1');
  const [activeSubject, setActiveSubject] = useState<SubjectKey>('mathematics');
  const [candidateName] = useState(() => {
    if (typeof window === 'undefined') return 'Candidate';
    return localStorage.getItem('userName')?.trim() || 'Candidate';
  });
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const id = localStorage.getItem('userId');
      const verified = localStorage.getItem('verified');

      if (!id || verified !== 'true') {
        router.push('/');
        return;
      }

      try {
        const loadedQuestions = await loadExamQuestions();
        if (!mounted) return;

        setQuestions(loadedQuestions);

        const firstQuestion = loadedQuestions[0];
        if (firstQuestion) {
          setCurrentQuestion(0);
          setActivePaper(firstQuestion.paper);
          setActiveSubject(firstQuestion.subjectKey);
          setSelectedAnswers([]);
        }
      } catch (error) {
        console.error('Failed to load exam questions:', error);
        if (mounted) {
          setSubmitError('Failed to load question bank.');
        }
      } finally {
        if (mounted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    void bootstrap();

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [router]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeRunningOut = timeLeft < 300;
  const activeQuestion = questions[currentQuestion];

  const visibleQuestionIndexes = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.paper === activePaper && question.subjectKey === activeSubject)
    .map(({ index }) => index);

  const currentVisibleQuestionIndex = visibleQuestionIndexes.indexOf(currentQuestion);

  const focusQuestion = (index: number) => {
    const question = questions[index];
    if (!question) return;

    setCurrentQuestion(index);
    setActivePaper(question.paper);
    setActiveSubject(question.subjectKey);
    setSelectedAnswers(question.selectedOptionIndexes ?? []);
  };

  const selectSubject = (subject: SubjectKey) => {
    setActivePaper(subjectToPaper(subject));
    const targetIndex = questions.findIndex((question) => question.subjectKey === subject);
    if (targetIndex === -1) return;

    setActiveSubject(subject);
    setCurrentQuestion(targetIndex);
    setSelectedAnswers(questions[targetIndex].selectedOptionIndexes ?? []);
  };

  const selectPaper = (paper: PaperKey) => {
    const firstSubject = PAPER_SUBJECTS[paper][0];
    const targetIndex = questions.findIndex(
      (question) => question.paper === paper && question.subjectKey === firstSubject
    );

    setActivePaper(paper);
    setActiveSubject(firstSubject);

    if (targetIndex !== -1) {
      setCurrentQuestion(targetIndex);
      setSelectedAnswers(questions[targetIndex].selectedOptionIndexes ?? []);
    }
  };

  const handleSelectOption = (index: number) => {
    const question = questions[currentQuestion];
    if (!question) return;

    const allowsMulti = CATEGORY_RULES[question.category].allowsMulti;

    const nextSelection = allowsMulti
      ? selectedAnswers.includes(index)
        ? selectedAnswers.filter((x) => x !== index)
        : [...selectedAnswers, index].sort((a, b) => a - b)
      : [index];

    setSelectedAnswers(nextSelection);

    const newQuestions = [...questions];
    newQuestions[currentQuestion].status = nextSelection.length > 0 ? 'answered' : 'not-answered';
    newQuestions[currentQuestion].selectedOptionIndexes = nextSelection;
    setQuestions(newQuestions);
  };

  const handleMarkForReview = () => {
    const newMarked = new Set(marked);
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion);
    } else {
      newMarked.add(currentQuestion);
    }
    setMarked(newMarked);

    const newQuestions = [...questions];
    newQuestions[currentQuestion].status = marked.has(currentQuestion) ? 'answered' : 'marked';
    setQuestions(newQuestions);
  };

  const handleClear = () => {
    setSelectedAnswers([]);
    const newQuestions = [...questions];
    newQuestions[currentQuestion].status = 'not-answered';
    newQuestions[currentQuestion].selectedOptionIndexes = [];
    setQuestions(newQuestions);
  };

  const handleNext = () => {
    if (currentVisibleQuestionIndex < visibleQuestionIndexes.length - 1) {
      const nextIndex = visibleQuestionIndexes[currentVisibleQuestionIndex + 1];
      focusQuestion(nextIndex);
    }
  };

  const goToQuestion = (index: number) => {
    focusQuestion(index);
  };

  const evaluateCategory3Score = (question: Question) => {
    if (question.correctAnswers.length === 0) return 0;

    const selectedValues = question.selectedOptionIndexes.map((idx) => question.options[idx]);
    const selectedSet = new Set(selectedValues);
    const correctSet = new Set(question.correctAnswers);

    if (selectedSet.size === 0) return 0;

    const selectedOnlyCorrect = [...selectedSet].every((option) => correctSet.has(option));
    if (selectedOnlyCorrect && selectedSet.size === correctSet.size) return 2;
    if (selectedOnlyCorrect && selectedSet.size === 1) return 1;

    return 0;
  };

  const handleSubmitExam = async () => {
    setSubmitError('');

    if (localStorage.getItem('submitted')) {
      return;
    }

    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/');
      return;
    }

    setIsSubmitting(true);

    let mathScore = 0;
    let physScore = 0;
    let chemScore = 0;

    let mathTotal = 0;
    let physTotal = 0;
    let chemTotal = 0;

    questions.forEach((question) => {
      const isAttempted = question.selectedOptionIndexes.length > 0;
      const rule = CATEGORY_RULES[question.category];

      let scoreChange = 0;
      if (isAttempted) {
        if (question.category === 3) {
          scoreChange = evaluateCategory3Score(question);
        } else {
          const selectedValue = question.options[question.selectedOptionIndexes[0]];
          const isCorrect = question.correctAnswers.includes(selectedValue);
          scoreChange = isCorrect ? rule.correct : rule.incorrect;
        }
      }

      const subject = question.subject.toLowerCase();
      if (subject === 'maths' || subject === 'mathematics') {
        mathScore += scoreChange;
        mathTotal += 1;
      } else if (subject === 'physics') {
        physScore += scoreChange;
        physTotal += 1;
      } else if (subject === 'chemistry') {
        chemScore += scoreChange;
        chemTotal += 1;
      }
    });

    const mathematics = mathTotal === 0 ? 0 : Number(mathScore.toFixed(2));
    const physics = physTotal === 0 ? 0 : Number(physScore.toFixed(2));
    const chemistry = chemTotal === 0 ? 0 : Number(chemScore.toFixed(2));
    const total_marks = mathematics + physics + chemistry;

    try {
      await submitExam({
        id,
        total_marks,
        mathematics,
        physics,
        chemistry,
      });

      localStorage.setItem('submitted', 'true');
      localStorage.setItem('submittedUserId', id);
      localStorage.setItem(
        'examMarks',
        JSON.stringify({
          total_marks,
          mathematics,
          physics,
          chemistry,
        })
      );

      router.push('/result');
    } catch (error) {
      console.error('Failed to submit exam:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit exam results.');
      setIsSubmitting(false);
    }
  };

  if (!isLoadingQuestions && !activeQuestion) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-semibold">No questions were loaded.</p>
          <p className="mt-1 text-xs text-slate-500">Check the JSON files in public/questions/json.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden bg-[#f8fafc] font-sans selection:bg-blue-200 selection:text-blue-900"
      style={{ zoom: 0.9 }}
    >
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-96 w-full bg-gradient-to-b from-blue-100/50 to-transparent" />
      <div className="pointer-events-none absolute right-[-5%] top-[-10%] -z-10 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-5%] -z-10 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />

      <nav className="z-50 flex flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 py-2.5 shadow-sm backdrop-blur-xl">
        <div className="flex items-center">
          <h1 className="max-w-[200px] truncate text-xl font-bold tracking-tight text-slate-800 sm:max-w-md">
            {activePaper === 'paper1' ? 'Paper 1: Mathematics' : 'Paper 2: Physics and Chemistry'}
          </h1>
        </div>

        <div className="mx-4 flex max-w-md flex-1 justify-center">
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-1.5 font-mono text-lg font-bold shadow-sm transition-all duration-300 ${
              isTimeRunningOut
                ? 'animate-pulse border-2 border-red-400 bg-red-50 text-red-600 shadow-red-500/10'
                : 'border-2 border-slate-400 bg-white text-slate-800 shadow-slate-200/50'
            }`}
          >
            <Clock className={`h-5 w-5 ${isTimeRunningOut ? 'text-red-500' : 'text-blue-500'}`} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:block">
            <Maximize2 className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 pl-4 lg:border-l lg:border-slate-200">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{candidateName}</p>
              <p className="text-xs font-medium tracking-wide text-slate-500">JEE Candidate</p>
            </div>
            <div className="relative cursor-pointer group">
              <Image
                src={`https://api.dicebear.com/9.x/micah/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                alt="Candidate Profile"
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 shadow-md shadow-slate-200/80 transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 gap-4 overflow-hidden p-3 md:p-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur-md transition-all">
            {isLoadingQuestions ? (
              <div className="flex h-full w-full animate-pulse flex-col gap-6 p-8">
                <div className="mb-4 h-10 w-1/3 rounded-xl bg-slate-200" />
                <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
                <div className="mb-8 h-6 w-2/3 rounded-lg bg-slate-200" />
                <div className="flex flex-col gap-4">
                  <div className="h-16 w-full rounded-2xl border-2 border-slate-100 bg-slate-200" />
                  <div className="h-16 w-full rounded-2xl border-2 border-slate-100 bg-slate-200" />
                  <div className="h-16 w-full rounded-2xl border-2 border-slate-100 bg-slate-200" />
                  <div className="h-16 w-full rounded-2xl border-2 border-slate-100 bg-slate-200" />
                </div>
              </div>
            ) : activeQuestion ? (
              <>
                <div className="flex items-center justify-between border-b-2 border-slate-400 bg-white/60 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-blue-400 bg-blue-50 text-base font-bold text-blue-600 shadow-inner">
                      Q{activeQuestion.sourceId}
                    </span>
                    <p className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                      {CATEGORY_RULES[activeQuestion.category].allowsMulti
                        ? 'Multiple Correct Options'
                        : 'Single Correct Option'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border-2 border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                      {subjectLabel[activeQuestion.subjectKey]}
                    </span>
                    <span className="rounded-lg border-2 border-indigo-600 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
                      {CATEGORY_RULES[activeQuestion.category].label}
                    </span>
                    <span className="rounded-lg border-2 border-green-600 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm">
                      +{CATEGORY_RULES[activeQuestion.category].correct}
                    </span>
                    <span className="rounded-lg border-2 border-red-600 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm">
                      {CATEGORY_RULES[activeQuestion.category].incorrect === 0
                        ? 'No Negative'
                        : `${CATEGORY_RULES[activeQuestion.category].incorrect}`}
                    </span>
                  </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-auto px-6 py-6 scroll-smooth">
                  <div className="mx-auto max-w-4xl">
                    <h2 className="mb-5 text-[1.1rem] font-medium leading-relaxed text-slate-800 md:text-lg">
                      {activeQuestion.text}
                    </h2>

                    {activeQuestion.image ? (
                      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <Image
                          src={activeQuestion.image}
                          alt="Question image"
                          width={1200}
                          height={600}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {activeQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswers.includes(index);
                        return (
                          <button
                            key={index}
                            onClick={() => handleSelectOption(index)}
                            className={`relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 group ${
                              isSelected
                                ? 'scale-[1.01] border-blue-500 bg-blue-50/40 shadow-md shadow-blue-500/10'
                                : 'border-slate-300 bg-white shadow-sm hover:border-slate-400 hover:bg-slate-50/80 hover:shadow'
                            }`}
                          >
                            {isSelected ? (
                              <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-l-2xl bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            ) : null}
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                  isSelected
                                    ? 'scale-110 border-blue-500 bg-blue-500'
                                    : 'border-slate-400 bg-transparent group-hover:border-slate-500'
                                }`}
                              >
                                {isSelected ? (
                                  <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                                ) : null}
                              </div>
                              <div className="flex-1">
                                <span className={`mr-3 font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                <span className={`text-[1rem] font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {option}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/80 p-4 backdrop-blur-md md:p-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleMarkForReview}
                      className="flex items-center gap-2 rounded-xl border-2 border-slate-400 bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 active:scale-95"
                    >
                      <Flag className="h-4 w-4" />
                      Mark for Review
                    </button>
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-2 rounded-xl border-2 border-slate-400 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition-all duration-200 hover:border-red-400 hover:bg-red-50 hover:text-red-700 active:scale-95"
                    >
                      <XCircle className="h-4 w-4" />
                      Clear
                    </button>
                  </div>

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/50 active:scale-95"
                  >
                    Save & Next
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
                No questions loaded.
              </div>
            )}
          </div>
        </div>

        <div className="hidden w-[340px] flex-shrink-0 flex-col min-w-0 lg:flex">
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur-md">
            {isLoadingQuestions ? (
              <div className="flex h-full w-full animate-pulse flex-col gap-4 p-5">
                <div className="mb-2 h-12 w-full rounded-xl bg-slate-200" />
                <div className="mb-6 h-12 w-full rounded-xl bg-slate-200" />
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="h-8 rounded-md bg-slate-200" />
                  <div className="h-8 rounded-md bg-slate-200" />
                  <div className="h-8 rounded-md bg-slate-200" />
                  <div className="h-8 rounded-md bg-slate-200" />
                </div>
                <div className="mb-4 h-6 w-1/2 rounded-lg bg-slate-200" />
                <div className="grid grid-cols-5 gap-2.5">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <div key={index} className="aspect-square w-full rounded-xl bg-slate-200" />
                  ))}
                </div>
              </div>
            ) : activeQuestion ? (
              <>
                <div className="space-y-3 border-b border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex gap-1.5 rounded-2xl bg-slate-200/60 p-1.5">
                    {(['paper1', 'paper2'] as PaperKey[]).map((paper) => (
                      <button
                        key={paper}
                        onClick={() => selectPaper(paper)}
                        type="button"
                        className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 ${
                          activePaper === paper
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
                        }`}
                      >
                        {paper === 'paper1' ? 'Paper 1' : 'Paper 2'}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5 rounded-2xl bg-slate-200/60 p-1.5">
                    {PAPER_SUBJECTS[activePaper].map((subject) => (
                      <button
                        key={subject}
                        onClick={() => selectSubject(subject)}
                        type="button"
                        className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 ${
                          activeSubject === subject
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
                        }`}
                      >
                        {subjectLabel[subject]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-b border-slate-100 bg-white/40 p-5">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      {
                        color: 'bg-green-500',
                        border: 'border-green-600',
                        label: 'Answered',
                        count: visibleQuestionIndexes.filter((questionIndex) => questions[questionIndex].status === 'answered').length,
                      },
                      {
                        color: 'bg-red-500',
                        border: 'border-red-600',
                        label: 'Not Answered',
                        count: visibleQuestionIndexes.filter((questionIndex) => questions[questionIndex].status === 'not-answered').length,
                      },
                      {
                        color: 'bg-slate-100',
                        border: 'border-slate-300',
                        label: 'Not Visited',
                        count: visibleQuestionIndexes.filter((questionIndex) => questions[questionIndex].status === 'not-visited').length,
                      },
                      {
                        color: 'bg-indigo-500',
                        border: 'border-indigo-600',
                        label: 'Marked',
                        count: visibleQuestionIndexes.filter((questionIndex) => questions[questionIndex].status === 'marked').length,
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold text-slate-800 shadow-sm ${item.color} ${item.border} ${
                            item.color.includes('green') || item.color.includes('red') || item.color.includes('indigo')
                              ? 'text-white'
                              : ''
                          }`}
                        >
                          {item.count > 0 ? item.count : '0'}
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      {subjectLabel[activeSubject]} Palette
                    </h3>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {visibleQuestionIndexes.map((questionIndex) => {
                      const question = questions[questionIndex];
                      let bgColor = 'bg-slate-50';
                      let textColor = 'text-slate-600';
                      let borderColor = 'border-slate-200';
                      const shadow = 'shadow-sm';

                      if (question.status === 'answered') {
                        bgColor = 'bg-gradient-to-b from-green-400 to-green-500';
                        textColor = 'text-white';
                        borderColor = 'border-green-600';
                      } else if (question.status === 'marked') {
                        bgColor = 'bg-gradient-to-b from-indigo-400 to-indigo-500';
                        textColor = 'text-white';
                        borderColor = 'border-indigo-600';
                      } else if (question.status === 'not-answered') {
                        bgColor = 'bg-gradient-to-b from-red-400 to-red-500';
                        textColor = 'text-white';
                        borderColor = 'border-red-600';
                      }

                      const isActive = questionIndex === currentQuestion;

                      return (
                        <button
                          key={question.id}
                          onClick={() => goToQuestion(questionIndex)}
                          className={`relative aspect-square w-full rounded-xl border-2 text-[14px] font-extrabold transition-all duration-200 ${bgColor} ${textColor} ${borderColor} ${shadow} hover:brightness-110 active:scale-90 ${
                            isActive ? 'z-10 scale-[1.10] border-blue-600 ring-4 ring-blue-500/30 shadow-lg' : 'hover:scale-105'
                          }`}
                        >
                          {question.sourceId}
                          {question.status === 'marked' ? (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-yellow-400 shadow-sm" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/80 p-4">
                  {submitError ? (
                    <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      {submitError}
                    </p>
                  ) : null}

                  

                  <button
                    disabled={isSubmitting}
                    onClick={handleSubmitExam}
                    className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 py-4 text-[15px] font-bold tracking-wide text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] disabled:opacity-80"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />

                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-emerald-400 transition-colors group-hover:text-emerald-300" strokeWidth={2} />
                        <span>Submit Final Exam</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
                No questions loaded.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
