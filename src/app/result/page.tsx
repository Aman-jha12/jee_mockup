'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';

export default function ResultPage() {
  const router = useRouter();
  const [marks, setMarks] = useState({ mathematics: 70, physics: 60, chemistry: 50, total_marks: 180 });

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem("examMarks");
      if (saved) {
        setMarks(JSON.parse(saved));
      }
    });
  }, []);

  const getStatus = (score: number) => score >= 75 ? 'Excellent' : score >= 60 ? 'Good' : 'Average';

  const subjects = [
    { name: 'Mathematics', score: marks.mathematics, total: 100, icon: 'grid_view', status: getStatus(marks.mathematics) },
    { name: 'Physics', score: marks.physics, total: 100, icon: 'science', status: getStatus(marks.physics) },
    { name: 'Chemistry', score: marks.chemistry, total: 100, icon: 'biotech', status: getStatus(marks.chemistry) },
  ];

  return (
    <div className="bg-[#050a18] text-white min-h-screen font-sans selection:bg-red-500/30">
      <Header />

      <main className="max-w-[1100px] mx-auto px-6 py-12">
        {/* Main Score Card */}
        <div className="relative bg-[#0b1224] border border-gray-800 rounded-3xl p-8 md:p-12 mb-10 overflow-hidden shadow-2xl">
          {/* Glowing Red Border Accent */}
          <div className="absolute top-0 left-0 w-1 h-32 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Your Score</p>
              <div className="w-6 h-1 bg-red-600 mb-6"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-red-600">{marks.total_marks}</span>
                <span className="text-4xl md:text-5xl font-bold text-gray-500">/300</span>
              </div>
            </div>
            
            <button className="cursor-pointer mt-4 md:mt-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            
            </button>
          </div>

          {/* Main Progress Bar */}
          <div className="relative h-1 bg-gray-800 rounded-full mb-12">
            <div className="absolute top-0 left-0 h-full bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" style={{ width: `${(marks.total_marks / 300) * 100}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_#ff0000]"></div>
            </div>
          </div>

          {/* Mini Subject Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            {[
              {l:'M', n:'Mathematics', s:`${marks.mathematics}/100`}, 
              {l:'P', n:'Physics', s:`${marks.physics}/100`}, 
              {l:'C', n:'Chemistry', s:`${marks.chemistry}/100`}
            ].map((sub, i) => (
              <div key={sub.n} className={`flex items-center gap-4 ${i !== 2 ? 'md:border-r border-gray-800' : ''}`}>
                <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                  {sub.l}
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">{sub.s.split('/')[0]}</span>
                    <span className="text-sm text-gray-500 font-bold">/{sub.s.split('/')[1]}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{sub.n}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
          Detailed Breakdown <span className="w-6 h-0.5 bg-red-600 opacity-50"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {subjects.map((subject) => (
            <div key={subject.name} className="bg-[#0b1224] border border-gray-800 rounded-2xl p-6 hover:border-red-900/40 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#161d2f] border border-gray-700 flex items-center justify-center">
                   {/* Placeholder icons based on subject */}
                   <div className="text-red-600 opacity-80">
                      {subject.name === 'Mathematics' && '++'}
                      {subject.name === 'Physics' && '⚛'}
                      {subject.name === 'Chemistry' && '🧪'}
                   </div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{subject.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-red-600">{subject.score}</span>
                    <span className="text-lg font-bold text-gray-600">/{subject.total}</span>
                  </div>
                </div>
              </div>

              <div className="h-1 bg-gray-800 rounded-full mb-4">
                <div 
                  className="h-full bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.4)]" 
                  style={{ width: `${(subject.score / subject.total) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-gray-400">{subject.score}%</span>
                <span className={subject.status === 'Good' ? 'text-green-500' : 'text-yellow-500'}>
                  • {subject.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button 
            onClick={() => router.push("/")}
            className="cursor-pointer flex items-center gap-2 px-10 py-4 rounded-xl border border-gray-800 text-gray-400 font-bold uppercase tracking-widest hover:border-red-600 hover:text-white transition-all min-w-[220px] justify-center"
          >
            Go Back <span>←</span>
          </button>
          <button 
            onClick={() => router.push("/solutions")}
            className="cursor-pointer flex items-center gap-2 px-10 py-4 rounded-xl bg-[#cc2229] text-white font-bold uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all min-w-[220px] justify-center"
          >
            View Solutions <span>→</span>
          </button>
        </div>
      </main>
    </div>
  );
}