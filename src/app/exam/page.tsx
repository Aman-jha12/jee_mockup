'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitExam } from '@/lib/api';
import { sampleQuestions } from '@/lib/sample_questions';
import Image from 'next/image';
import { Clock, ChevronRight, Flag, XCircle, AlertCircle, Maximize2 } from 'lucide-react';

type Category = 1 | 2 | 3;
type SubjectKey = 'mathematics' | 'physics' | 'chemistry';
type PaperKey = 'paper1' | 'paper2';

type GeneratedQuestionContent = {
  question: string;
  options: [string, string, string, string];
  correctAnswers: string[];
};

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswers: string[];
  subject: string;
  subjectKey: SubjectKey;
  category: Category;
  paper: PaperKey;
  status: 'answered' | 'not-answered' | 'not-visited' | 'marked';
  selectedOptionIndexes: number[];
}

const normalizeSubject = (subject: string): SubjectKey => {
  const value = subject.trim().toLowerCase();
  if (value === 'maths' || value === 'mathematics') return 'mathematics';
  if (value === 'physics') return 'physics';
  return 'chemistry';
};

const subjectLabel: Record<SubjectKey, string> = {
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
};

const subjectToPaper = (subject: SubjectKey): PaperKey =>
  subject === 'mathematics' ? 'paper1' : 'paper2';

const PAPER_SUBJECTS: Record<PaperKey, SubjectKey[]> = {
  paper1: ['mathematics'],
  paper2: ['physics', 'chemistry'],
};

const QUESTION_TARGETS: Record<PaperKey, Record<SubjectKey, Record<Category, number>>> = {
  paper1: {
    mathematics: { 1: 50, 2: 15, 3: 10 },
    physics: { 1: 0, 2: 0, 3: 0 },
    chemistry: { 1: 0, 2: 0, 3: 0 },
  },
  paper2: {
    mathematics: { 1: 0, 2: 0, 3: 0 },
    physics: { 1: 30, 2: 5, 3: 5 },
    chemistry: { 1: 30, 2: 5, 3: 5 },
  },
};

const buildGeneratedQuestion = (
  subject: SubjectKey,
  category: Category,
  sequence: number
): GeneratedQuestionContent => {
  const variant = sequence % 4;

  if (subject === 'mathematics') {
    if (category === 1) {
      const a = 8 + sequence;
      const b = 3 + (sequence % 7);
      const correct = a + b;
      return {
        question: `Question ${sequence + 1}: What is ${a} + ${b}?`,
        options: [String(correct + 2), String(correct), String(correct - 1), String(correct + 4)],
        correctAnswers: [String(correct)],
      };
    }

    if (category === 2) {
      const base = 4 + (sequence % 8);
      const correct = base * base;
      return {
        question: `Question ${sequence + 1}: What is the square of ${base}?`,
        options: [String(correct + 1), String(correct - 1), String(correct), String(correct + 4)],
        correctAnswers: [String(correct)],
      };
    }

    const c3Variants: GeneratedQuestionContent[] = [
      {
        question: `Question ${sequence + 1}: Which of the following are even numbers?`,
        options: ['2', '3', '4', '5'],
        correctAnswers: ['2', '4'],
      },
      {
        question: `Question ${sequence + 1}: Which of the following are prime numbers?`,
        options: ['2', '4', '5', '6'],
        correctAnswers: ['2', '5'],
      },
      {
        question: `Question ${sequence + 1}: Which of the following are perfect squares?`,
        options: ['1', '2', '4', '5'],
        correctAnswers: ['1', '4'],
      },
      {
        question: `Question ${sequence + 1}: Which of the following are multiples of 3?`,
        options: ['3', '4', '6', '8'],
        correctAnswers: ['3', '6'],
      },
    ];
    return c3Variants[variant];
  }

  if (subject === 'physics') {
    if (category === 1) {
      const c1Variants: GeneratedQuestionContent[] = [
        {
          question: `Question ${sequence + 1}: What is the SI unit of force?`,
          options: ['Joule', 'Newton', 'Watt', 'Pascal'],
          correctAnswers: ['Newton'],
        },
        {
          question: `Question ${sequence + 1}: Which instrument measures electric current?`,
          options: ['Voltmeter', 'Ammeter', 'Barometer', 'Thermometer'],
          correctAnswers: ['Ammeter'],
        },
        {
          question: `Question ${sequence + 1}: What is the full form of LED?`,
          options: ['Light Emitting Diode', 'Linear Electric Device', 'Low Energy Driver', 'Light Energy Device'],
          correctAnswers: ['Light Emitting Diode'],
        },
        {
          question: `Question ${sequence + 1}: What is the SI unit of power?`,
          options: ['Newton', 'Joule', 'Watt', 'Tesla'],
          correctAnswers: ['Watt'],
        },
      ];
      return c1Variants[variant];
    }

    if (category === 2) {
      const c2Variants: GeneratedQuestionContent[] = [
        {
          question: `Question ${sequence + 1}: What is the acceleration due to gravity on Earth?`,
          options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'],
          correctAnswers: ['9.8 m/s²'],
        },
        {
          question: `Question ${sequence + 1}: What is the formula for momentum?`,
          options: ['p = mv', 'p = ma', 'p = m/v', 'p = v/m'],
          correctAnswers: ['p = mv'],
        },
        {
          question: `Question ${sequence + 1}: What is the SI unit of work?`,
          options: ['Watt', 'Joule', 'Pascal', 'Newton'],
          correctAnswers: ['Joule'],
        },
        {
          question: `Question ${sequence + 1}: What is the speed of light in vacuum?`,
          options: ['3 × 10^6 m/s', '3 × 10^8 m/s', '3 × 10^5 m/s', '3 × 10^4 m/s'],
          correctAnswers: ['3 × 10^8 m/s'],
        },
      ];
      return c2Variants[variant];
    }

    const c3Variants: GeneratedQuestionContent[] = [
      {
        question: `Question ${sequence + 1}: Which of the following are scalar quantities?`,
        options: ['Mass', 'Force', 'Speed', 'Velocity'],
        correctAnswers: ['Mass', 'Speed'],
      },
      {
        question: `Question ${sequence + 1}: Which of the following are vector quantities?`,
        options: ['Displacement', 'Distance', 'Force', 'Time'],
        correctAnswers: ['Displacement', 'Force'],
      },
      {
        question: `Question ${sequence + 1}: Which of the following are renewable energy sources?`,
        options: ['Solar', 'Coal', 'Wind', 'Petrol'],
        correctAnswers: ['Solar', 'Wind'],
      },
      {
        question: `Question ${sequence + 1}: Which of the following are units of pressure?`,
        options: ['Pascal', 'Newton', 'Bar', 'Joule'],
        correctAnswers: ['Pascal', 'Bar'],
      },
    ];
    return c3Variants[variant];
  }

  if (category === 1) {
    const c1Variants: GeneratedQuestionContent[] = [
      {
        question: `Question ${sequence + 1}: What is the atomic number of Oxygen?`,
        options: ['6', '7', '8', '9'],
        correctAnswers: ['8'],
      },
      {
        question: `Question ${sequence + 1}: What is the symbol of Sodium?`,
        options: ['So', 'Sd', 'Na', 'Sm'],
        correctAnswers: ['Na'],
      },
      {
        question: `Question ${sequence + 1}: What is the pH of a neutral solution?`,
        options: ['5', '6', '7', '8'],
        correctAnswers: ['7'],
      },
      {
        question: `Question ${sequence + 1}: Which gas is known as laughing gas?`,
        options: ['Nitrogen', 'Oxygen', 'Nitrous Oxide', 'Carbon Dioxide'],
        correctAnswers: ['Nitrous Oxide'],
      },
    ];
    return c1Variants[variant];
  }

  if (category === 2) {
    const c2Variants: GeneratedQuestionContent[] = [
      {
        question: `Question ${sequence + 1}: What is the chemical formula of water?`,
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctAnswers: ['H2O'],
      },
      {
        question: `Question ${sequence + 1}: Which acid is present in vinegar?`,
        options: ['Citric acid', 'Acetic acid', 'Sulphuric acid', 'Nitric acid'],
        correctAnswers: ['Acetic acid'],
      },
      {
        question: `Question ${sequence + 1}: What is the valency of oxygen?`,
        options: ['1', '2', '3', '4'],
        correctAnswers: ['2'],
      },
      {
        question: `Question ${sequence + 1}: Which gas is used in balloons?`,
        options: ['Hydrogen', 'Helium', 'Ozone', 'Chlorine'],
        correctAnswers: ['Helium'],
      },
    ];
    return c2Variants[variant];
  }

  const c3Variants: GeneratedQuestionContent[] = [
    {
      question: `Question ${sequence + 1}: Which of the following are noble gases?`,
      options: ['Helium', 'Oxygen', 'Neon', 'Nitrogen'],
      correctAnswers: ['Helium', 'Neon'],
    },
    {
      question: `Question ${sequence + 1}: Which of the following are alkali metals?`,
      options: ['Lithium', 'Sodium', 'Calcium', 'Iron'],
      correctAnswers: ['Lithium', 'Sodium'],
    },
    {
      question: `Question ${sequence + 1}: Which of the following are elements?`,
      options: ['Oxygen', 'Water', 'Carbon', 'Salt'],
      correctAnswers: ['Oxygen', 'Carbon'],
    },
    {
      question: `Question ${sequence + 1}: Which of the following are halogens?`,
      options: ['Fluorine', 'Chlorine', 'Sodium', 'Helium'],
      correctAnswers: ['Fluorine', 'Chlorine'],
    },
  ];
  return c3Variants[variant];
};

const seedQuestions: Question[] = sampleQuestions.map((q) => ({
  id: q.question_number,
  text: q.question,
  options: [q.optionA, q.optionB, q.optionC, q.optionD],
  correctAnswers: String(q.correct_answer)
    .split(',')
    .map((ans) => ans.trim())
    .filter(Boolean),
  subject: q.subject,
  subjectKey: normalizeSubject(q.subject),
  category: q.category === 2 || q.category === 3 ? q.category : 1,
  paper: subjectToPaper(normalizeSubject(q.subject)),
  status: 'not-visited',
  selectedOptionIndexes: [],
}));

const buildQuestionBank = (seeds: Question[]): Question[] => {
  const sourceGroups = seeds.reduce<Partial<Record<PaperKey, Partial<Record<SubjectKey, Partial<Record<Category, Question[]>>>>>>>(
    (acc, question) => {
      const paper = question.paper;
      const subject = question.subjectKey;
      const category = question.category;
      acc[paper] ??= {};
      acc[paper]![subject] ??= { 1: [], 2: [], 3: [] };
      acc[paper]![subject]![category] ??= [];
      acc[paper]![subject]![category]!.push(question);
      return acc;
    },
    {}
  );

  const result: Question[] = [];
  let nextId = 1;

  (['paper1', 'paper2'] as PaperKey[]).forEach((paper) => {
    PAPER_SUBJECTS[paper].forEach((subject) => {
      ([1, 2, 3] as Category[]).forEach((category) => {
        const targetCount = QUESTION_TARGETS[paper][subject][category];
        const existing = sourceGroups[paper]?.[subject]?.[category] ?? [];

        existing.forEach((question) => {
          result.push({ ...question, id: nextId });
          nextId += 1;
        });

        const missing = targetCount - existing.length;
        for (let index = 0; index < missing; index += 1) {
          const generated = buildGeneratedQuestion(subject, category, existing.length + index);
          result.push({
            id: nextId,
            text: generated.question,
            options: generated.options,
            correctAnswers: generated.correctAnswers,
            subject,
            subjectKey: subject,
            category,
            paper,
            status: 'not-visited',
            selectedOptionIndexes: [],
          });
          nextId += 1;
        }
      });
    });
  });

  return result;
};
const QUESTIONS: Question[] = buildQuestionBank(seedQuestions);

const CATEGORY_RULES: Record<Category, { label: string; correct: number; incorrect: number; allowsMulti: boolean }> = {
  1: { label: 'Category 1', correct: 1, incorrect: -0.25, allowsMulti: false },
  2: { label: 'Category 2', correct: 2, incorrect: -0.5, allowsMulti: false },
  3: { label: 'Category 3', correct: 2, incorrect: 0, allowsMulti: true },
};

export default function ExamInterface() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(4 * 60 * 60); // Paper 1 + Paper 2
  const [questions, setQuestions] = useState(QUESTIONS);
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
    const id = localStorage.getItem("userId");
    const verified = localStorage.getItem("verified");
    if (!id || verified !== "true") {
      router.push("/");
      return;
    }

    setTimeout(() => {
      setIsLoadingQuestions(false);
    }, 1500);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeRunningOut = timeLeft < 300;

  const visibleQuestionIndexes = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.paper === activePaper && question.subjectKey === activeSubject)
    .map(({ index }) => index);

  const currentVisibleQuestionIndex = visibleQuestionIndexes.indexOf(currentQuestion);

  const focusQuestion = (index: number) => {
    const question = questions[index];
    if (!question) return;

    setCurrentQuestion(index);
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
    const activeQuestion = questions[currentQuestion];
    if (!activeQuestion) return;

    const allowsMulti = CATEGORY_RULES[activeQuestion.category].allowsMulti;

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

    if (localStorage.getItem("submitted")) {
      return;
    }

    const id = localStorage.getItem("userId");
    if (!id) {
      router.push("/");
      return;
    }

    setIsSubmitting(true);

    // Calculate marks dynamically
    let mathScore = 0;
    let physScore = 0;
    let chemScore = 0;

    let mathTotal = 0;
    let physTotal = 0;
    let chemTotal = 0;

    questions.forEach((q) => {
      const isAttempted = q.selectedOptionIndexes.length > 0;
      const rule = CATEGORY_RULES[q.category];

      let scoreChange = 0;
      if (isAttempted) {
        if (q.category === 3) {
          scoreChange = evaluateCategory3Score(q);
        } else {
          const selectedValue = q.options[q.selectedOptionIndexes[0]];
          const isCorrect = q.correctAnswers.includes(selectedValue);
          scoreChange = isCorrect ? rule.correct : rule.incorrect;
        }
      }
      
      const subj = q.subject.toLowerCase();
      if (subj === 'maths' || subj === 'mathematics') {
        mathScore += scoreChange;
        mathTotal++;
      } else if (subj === 'physics') {
        physScore += scoreChange;
        physTotal++;
      } else if (subj === 'chemistry') {
        chemScore += scoreChange;
        chemTotal++;
      }
    });

    const mathematics = mathTotal === 0 ? 0 : Number(mathScore.toFixed(2));
    const physics = physTotal === 0 ? 0 : Number(physScore.toFixed(2));
    const chemistry = chemTotal === 0 ? 0 : Number(chemScore.toFixed(2));

    // Calculate total marks dynamically
    const total_marks = mathematics + physics + chemistry;

    try {
      await submitExam({
        id,
        total_marks,
        mathematics,
        physics,
        chemistry
      });

      localStorage.setItem("submitted", "true");
      localStorage.setItem("submittedUserId", id);
      localStorage.setItem("examMarks", JSON.stringify({
        total_marks,
        mathematics,
        physics,
        chemistry
      }));

      router.push('/result');
    } catch (error) {
      console.error("Failed to submit exam:", error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit exam results.');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900 relative overflow-hidden"
      style={{ zoom: 0.9 }}
    >
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* TOP NAVIGATION BAR */}
      <nav className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm px-6 py-2.5 flex items-center justify-between z-50">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-md">
            {activePaper === 'paper1' ? 'Paper 1: Mathematics' : 'Paper 2: Physics and Chemistry'}
          </h1>
        </div>

        <div className="flex flex-1 justify-center max-w-md mx-4">
          {/* Animated Timer Indicator */}
          <div className={`flex items-center gap-3 px-4 py-1.5 rounded-2xl font-mono text-lg font-bold shadow-sm transition-all duration-300 ${
            isTimeRunningOut 
              ? 'bg-red-50 text-red-600 border-2 border-red-400 animate-pulse shadow-red-500/10' 
              : 'bg-white text-slate-800 border-2 border-slate-400 shadow-slate-200/50'
          }`}>
            <Clock className={`w-5 h-5 ${isTimeRunningOut ? 'text-red-500' : 'text-blue-500'}`} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden lg:block">
            <Maximize2 className="w-5 h-5" />
          </button>
          
          {/* USER PROFILE CARD */}
          <div className="flex items-center gap-3 pl-4 lg:border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{candidateName}</p>
              <p className="text-xs text-slate-500 font-medium tracking-wide">JEE Candidate</p>
            </div>
            <div className="relative group cursor-pointer">
              {/* Dynamic Avatar */}
              <Image
                src={`https://api.dicebear.com/9.x/micah/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                alt="Candidate Profile"
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full border-2 border-white shadow-md shadow-slate-200/80 bg-slate-100 transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex flex-1 overflow-hidden p-3 md:p-4 gap-4 max-w-[1600px] mx-auto w-full">
        
        {/* LEFT COLUMN: QUESTION PANEL */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <div className="bg-white/90 backdrop-blur-md rounded-2xl flex-1 flex flex-col overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/40 transition-all">
            
            {isLoadingQuestions ? (
               <div className="p-8 flex flex-col gap-6 w-full h-full animate-pulse">
                  <div className="h-10 bg-slate-200 rounded-xl w-1/3 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                  <div className="h-6 bg-slate-200 rounded-lg w-2/3 mb-8"></div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="h-16 bg-slate-200 rounded-2xl w-full border-2 border-slate-100"></div>
                    <div className="h-16 bg-slate-200 rounded-2xl w-full border-2 border-slate-100"></div>
                    <div className="h-16 bg-slate-200 rounded-2xl w-full border-2 border-slate-100"></div>
                    <div className="h-16 bg-slate-200 rounded-2xl w-full border-2 border-slate-100"></div>
                  </div>
               </div>
            ) : (
            <>
            {/* Question Header Metadata */}
            <div className="px-6 py-4 border-b-2 border-slate-400 flex items-center justify-between bg-white/60">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold text-base shadow-inner border-2 border-blue-400">
                  Q{currentQuestion + 1}
                </span>
                <p className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
                  {CATEGORY_RULES[questions[currentQuestion]?.category ?? 1].allowsMulti
                    ? 'Multiple Correct Options'
                    : 'Single Correct Option'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border-2 border-slate-300 shadow-sm">
                  {subjectLabel[questions[currentQuestion]?.subjectKey ?? 'mathematics']}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border-2 border-indigo-600 shadow-sm">
                  {CATEGORY_RULES[questions[currentQuestion]?.category ?? 1].label}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border-2 border-green-600 shadow-sm">
                  +{CATEGORY_RULES[questions[currentQuestion]?.category ?? 1].correct}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border-2 border-red-600 shadow-sm">
                  {CATEGORY_RULES[questions[currentQuestion]?.category ?? 1].incorrect === 0
                    ? 'No Negative'
                    : `${CATEGORY_RULES[questions[currentQuestion]?.category ?? 1].incorrect}`}
                </span>
              </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-auto px-6 py-6 scroll-smooth custom-scrollbar">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-[1.1rem] md:text-lg font-medium text-slate-800 leading-relaxed mb-8">
                  {questions[currentQuestion].text}
                </h2>

                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswers.includes(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 relative group overflow-hidden ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50/40 shadow-md shadow-blue-500/10 scale-[1.01]' 
                            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/80 shadow-sm hover:shadow'
                        }`}
                      >
                        {/* Dynamic Selection Accent Bar */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        )}
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 border-2 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500 scale-110'
                                : 'border-slate-400 bg-transparent group-hover:border-slate-500'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-in zoom-in duration-200" />}
                          </div>
                          <div className="flex-1">
                            <span className={`font-bold mr-3 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
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

            {/* Bottom Action Footer */}
            <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkForReview}
                  className="px-5 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all duration-200 bg-white border-2 border-slate-400 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 shadow-sm active:scale-95"
                >
                  <Flag className="w-4 h-4" />
                  Mark for Review
                </button>
                <button
                  onClick={handleClear}
                  className="px-5 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all duration-200 bg-white border-2 border-slate-400 text-slate-700 hover:bg-red-50 hover:border-red-400 hover:text-red-700 shadow-sm active:scale-95"
                >
                  <XCircle className="w-4 h-4" />
                  Clear
                </button>
              </div>
              
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 border-2 border-transparent"
              >
                Save & Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTION PALETTE & STATUS */}
        <div className="w-[340px] flex flex-col min-w-0 flex-shrink-0 hidden lg:flex">
          
          <div className="bg-white/90 backdrop-blur-md rounded-2xl flex-1 flex flex-col overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/40">
            
            {isLoadingQuestions ? (
               <div className="p-5 flex flex-col gap-4 w-full h-full animate-pulse">
                  <div className="h-12 bg-slate-200 rounded-xl w-full mb-2"></div>
                  <div className="h-12 bg-slate-200 rounded-xl w-full mb-6"></div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="h-8 bg-slate-200 rounded-md"></div>
                     <div className="h-8 bg-slate-200 rounded-md"></div>
                     <div className="h-8 bg-slate-200 rounded-md"></div>
                     <div className="h-8 bg-slate-200 rounded-md"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded-lg w-1/2 mb-4"></div>
                  <div className="grid grid-cols-5 gap-2.5">
                     {Array.from({length: 25}).map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-200 rounded-xl w-full"></div>
                     ))}
                  </div>
               </div>
            ) : (
            <>
            {/* Subject Tabs Filter */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/80 space-y-3">
              <div className="flex gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl">
                {(['paper1', 'paper2'] as PaperKey[]).map((paper) => (
                  <button
                    key={paper}
                    onClick={() => selectPaper(paper)}
                    type="button"
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      activePaper === paper
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    {paper === 'paper1' ? 'Paper 1' : 'Paper 2'}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl">
                {PAPER_SUBJECTS[activePaper].map((subject) => (
                  <button
                    key={subject}
                    onClick={() => selectSubject(subject)}
                    type="button"
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      activeSubject === subject
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    {subjectLabel[subject]}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Status Legend */}
            <div className="p-5 border-b border-slate-100 bg-white/40">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {[
                  { color: 'bg-green-500', border: 'border-green-600', label: 'Answered', count: visibleQuestionIndexes.filter((questionIndex) => questions[questionIndex].status === 'answered').length },
                  { color: 'bg-red-500', border: 'border-red-600', label: 'Not Answered', count: visibleQuestionIndexes.filter((questionIndex) => questions[questionIndex].status === 'not-answered').length },
                  { color: 'bg-slate-100', border: 'border-slate-300', label: 'Not Visited', count: visibleQuestionIndexes.filter((questionIndex) => questions[questionIndex].status === 'not-visited').length },
                  { color: 'bg-indigo-500', border: 'border-indigo-600', label: 'Marked', count: visibleQuestionIndexes.filter((questionIndex) => questions[questionIndex].status === 'marked').length },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md ${item.color} border ${item.border} shadow-sm flex items-center justify-center text-[10px] text-slate-800 font-bold ${item.color.includes('green') || item.color.includes('red') || item.color.includes('indigo') ? 'text-white' : ''}`}>
                      {item.count > 0 ? item.count : '0'}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Question Grid */}
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{subjectLabel[activeSubject]} Palette</h3>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {visibleQuestionIndexes.map((questionIndex) => {
                  const q = questions[questionIndex];
                  let bgColor = 'bg-slate-50';
                  let textColor = 'text-slate-600';
                  let borderColor = 'border-slate-200';
                  const shadow = 'shadow-sm';

                  if (q.status === 'answered') {
                    bgColor = 'bg-gradient-to-b from-green-400 to-green-500';
                    textColor = 'text-white';
                    borderColor = 'border-green-600';
                  } else if (q.status === 'marked') {
                    bgColor = 'bg-gradient-to-b from-indigo-400 to-indigo-500';
                    textColor = 'text-white';
                    borderColor = 'border-indigo-600';
                  } else if (q.status === 'not-answered') {
                    bgColor = 'bg-gradient-to-b from-red-400 to-red-500';
                    textColor = 'text-white';
                    borderColor = 'border-red-600';
                  }

                  const isActive = questionIndex === currentQuestion;

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(questionIndex)}
                      className={`
                        relative w-full aspect-square rounded-xl font-extrabold text-[14px] transition-all duration-200 border-2
                        ${bgColor} ${textColor} ${borderColor} ${shadow}
                        hover:brightness-110 active:scale-90
                        ${isActive ? 'ring-4 ring-blue-500/30 scale-[1.10] z-10 shadow-lg border-blue-600' : 'hover:scale-105'}
                      `}
                    >
                      {q.id}
                      {/* Indicator for answered AND marked */}
                      {q.status === 'marked' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Final Action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80">
              {submitError && (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {submitError}
                </p>
              )}

              <button 
                onClick={() => window.print()} 
                className="group relative w-full py-3 rounded-2xl font-bold tracking-wide text-[14px] transition-all duration-300 bg-slate-700 text-white shadow-lg hover:shadow-xl hover:shadow-slate-900/20 hover:bg-slate-600 active:scale-[0.98] flex items-center justify-center gap-2.5 border border-slate-600 overflow-hidden mb-3"
                title="Download/Print Current Exam"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download/Print Exam</span>
              </button>

              <button disabled={isSubmitting} onClick={handleSubmitExam} className="group relative w-full py-4 rounded-2xl font-bold tracking-wide text-[15px] transition-all duration-300 bg-slate-900 text-white shadow-lg hover:shadow-xl hover:shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] flex items-center justify-center gap-2.5 border border-slate-700 overflow-hidden disabled:opacity-80">
                {/* Subtle top edge highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                {/* Bottom elegant emerald glow on hover */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
                
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" strokeWidth={2} />
                    <span>Submit Final Exam</span>
                  </>
                )}
              </button>
            </div>
            </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
