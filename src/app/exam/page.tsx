'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronRight, Flag, XCircle, LayoutGrid, AlertCircle, Maximize2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  status: 'answered' | 'not-answered' | 'not-visited' | 'marked';
}

const QUESTIONS: Question[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  text: `If sin(x) + cos(x) = √2, then find the value of tan(x) + cot(x). Consider the principal value in the range [0, π/2].`,
  options: ['1', '√2', '2', '√3'],
  status: i === 0 ? 'answered' : i < 5 ? 'not-answered' : 'not-visited',
}));

export default function ExamInterface() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [questions, setQuestions] = useState(QUESTIONS);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [avatarSeed, setAvatarSeed] = useState('Felix');

  useEffect(() => {
    // Generate a random seed on mount for a dynamic profile avatar
    setAvatarSeed(Math.random().toString(36).substring(7));
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeRunningOut = timeLeft < 300;

  const handleSelectOption = (index: number) => {
    setSelectedAnswer(index);
    const newQuestions = [...questions];
    newQuestions[currentQuestion].status = 'answered';
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
    setSelectedAnswer(null);
    const newQuestions = [...questions];
    newQuestions[currentQuestion].status = 'not-answered';
    setQuestions(newQuestions);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
    setSelectedAnswer(questions[index].status === 'answered' ? 0 : null); 
  };

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900 relative overflow-hidden">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* TOP NAVIGATION BAR */}
      <nav className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm px-6 py-2.5 flex items-center justify-between z-50">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-md">
            Mathematics
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
              <p className="text-sm font-semibold text-slate-800">Aced Candidate</p>
              <p className="text-xs text-slate-500 font-medium tracking-wide">JEE2024001</p>
            </div>
            <div className="relative group cursor-pointer">
              {/* Dynamic Avatar */}
              <img 
                src={`https://api.dicebear.com/9.x/micah/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                alt="Candidate Profile" 
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
            
            {/* Question Header Metadata */}
            <div className="px-6 py-4 border-b-2 border-slate-400 flex items-center justify-between bg-white/60">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold text-base shadow-inner border-2 border-blue-400">
                  Q{currentQuestion + 1}
                </span>
                <p className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
                  Multiple Choice Question
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border-2 border-green-600 shadow-sm">
                  +4 Marks
                </span>
                <span className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border-2 border-red-600 shadow-sm">
                  -1 Negative
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
                    const isSelected = selectedAnswer === index;
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
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTION PALETTE & STATUS */}
        <div className="w-[340px] flex flex-col min-w-0 flex-shrink-0 hidden lg:flex">
          
          <div className="bg-white/90 backdrop-blur-md rounded-2xl flex-1 flex flex-col overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/40">
            
            {/* Subject Tabs Filter */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/80">
              <div className="flex gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl">
                {['Maths', 'Physics', 'Chemistry'].map((subject, idx) => (
                  <button
                    key={subject}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      idx === 0 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Status Legend */}
            <div className="p-5 border-b border-slate-100 bg-white/40">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {[
                  { color: 'bg-green-500', border: 'border-green-600', label: 'Answered', count: questions.filter(q => q.status === 'answered').length },
                  { color: 'bg-red-500', border: 'border-red-600', label: 'Not Answered', count: questions.filter(q => q.status === 'not-answered').length },
                  { color: 'bg-slate-100', border: 'border-slate-300', label: 'Not Visited', count: questions.filter(q => q.status === 'not-visited').length },
                  { color: 'bg-indigo-500', border: 'border-indigo-600', label: 'Marked', count: questions.filter(q => q.status === 'marked').length },
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
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Question Palette</h3>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  let bgColor = 'bg-slate-50';
                  let textColor = 'text-slate-600';
                  let borderColor = 'border-slate-200';
                  let shadow = 'shadow-sm';

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

                  const isActive = idx === currentQuestion;

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
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
              <button className="group relative w-full py-4 rounded-2xl font-bold tracking-wide text-[15px] transition-all duration-300 bg-slate-900 text-white shadow-lg hover:shadow-xl hover:shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] flex items-center justify-center gap-2.5 border border-slate-700 overflow-hidden">
                {/* Subtle top edge highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                {/* Bottom elegant emerald glow on hover */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
                <AlertCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" strokeWidth={2} />
                <span>Submit Final Exam</span>
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
