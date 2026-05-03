'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructionsPage() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    if (agreed) {
      router.push("/exam");
    }
  };

  return (
    <div className="bg-[#fff8f7] text-[#271816] min-h-screen pb-20 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}} />

      {/* TopAppBar */}
      <header className="bg-white dark:bg-violet-950 border-b-2 border-violet-950 dark:border-white sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1200px] mx-auto">
          <div className="text-2xl font-black text-violet-950 dark:text-white tracking-tighter uppercase font-sans">
            EXAMPORTAL
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <a className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-red-500 border-b-4 border-red-500 pb-1" href="#">Dashboard</a>
            <a className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-violet-950 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-900 transition-colors active:scale-95 duration-75" href="#">Exams</a>
            <a className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-violet-950 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-900 transition-colors active:scale-95 duration-75" href="#">Performance</a>
            <a className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-violet-950 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-900 transition-colors active:scale-95 duration-75" href="#">Profile</a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-violet-950 dark:text-white cursor-pointer" data-icon="notifications">notifications</span>
            <span className="material-symbols-outlined text-violet-950 dark:text-white cursor-pointer" data-icon="help_outline">help_outline</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 py-12">
        {/* Instructions Hero Box */}
        <section className="mb-12">
          <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-8 md:p-12 border-t-[8px] border-t-red-500">
            <p className="font-extrabold text-[12px] tracking-[0.1em] leading-none text-[#6950a2] uppercase mb-4 text-center">Academic Session 2024 • Phase 1</p>
            <h1 className="font-bold text-[32px] md:text-[40px] tracking-[-0.02em] leading-[1.2] text-violet-950 mb-8 text-center uppercase">General Instructions</h1>
            
            <p className="text-[16px] font-semibold leading-relaxed text-[#5b403e] mb-8 text-center max-w-2xl mx-auto">
              National Testing Agency invites you to the premier gateway for technical education in India. Please validate all protocols below before proceeding.
            </p>

            <div className="space-y-4 mb-12">
              {[
                {
                  num: 1,
                  title: "Electronic Protocol",
                  desc: "Strict prohibition of electronic devices including smartwatches and calculators. Violation results in immediate disqualification.",
                },
                {
                  num: 2,
                  title: "Identity Verification",
                  desc: "Cross-verify your digital credentials with your physical Admit Card. Report any mismatch to the proctor immediately.",
                },
                {
                  num: 3,
                  title: "Navigation System",
                  desc: "Utilize the Question Palette for seamless navigation. 'Save & Next' must be explicitly used for finalizing responses.",
                },
                {
                  num: 4,
                  title: "Negative Marking Matrix",
                  desc: "Each correct answer yields +4. Each incorrect answer results in -1. Unattempted questions carry zero marks.",
                },
                {
                  num: 5,
                  title: "Auto-Submission Protocol",
                  desc: "The session will terminate automatically at the end of 180 minutes. Ensure periodic review of your progress.",
                },
              ].map((item) => (
                <div key={item.num} className="border-2 border-violet-950 p-5 bg-[#fff8f7] flex gap-4 items-start">
                  <div className="bg-red-500 text-white font-black w-8 h-8 flex items-center justify-center border-2 border-violet-950 flex-shrink-0 mt-0.5">
                    {item.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-[18px] text-violet-950 mb-1 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[15px] font-normal text-[#5b403e] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Agreement and Buttons */}
            <div className="border-t-2 border-violet-950 pt-10 flex flex-col items-center">
              <label 
                className="flex items-start gap-4 mb-8 cursor-pointer max-w-2xl group"
                onClick={() => setAgreed(!agreed)}
              >
                <div className="relative flex items-center justify-center w-6 h-6 border-2 border-violet-950 bg-white mt-1 flex-shrink-0 group-hover:border-red-500 transition-colors">
                  {agreed && (
                    <span className="material-symbols-outlined text-red-500 text-[20px] font-bold">check</span>
                  )}
                </div>
                <span className="text-[15px] font-bold text-[#5b403e] leading-relaxed select-none">
                  I confirm that I have read, understood, and will abide by all the examination protocols. I acknowledge that any breach of conduct may result in legal and academic penalties.
                </span>
              </label>

              <div className="flex flex-col md:flex-row gap-6 justify-center w-full">
                <button 
                  onClick={() => router.back()} 
                  className="px-8 py-4 bg-white border-4 border-violet-950 text-violet-950 font-black uppercase tracking-widest hover:bg-violet-50 transition-all active:translate-y-1 w-full md:w-auto text-center"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleStart} 
                  disabled={!agreed} 
                  className={`px-10 py-4 border-4 border-violet-950 font-black uppercase tracking-widest transition-all w-full md:w-auto text-center ${
                    agreed 
                      ? 'bg-red-500 text-white hover:bg-red-600 active:translate-y-1 cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                  }`}
                >
                  Proceed to Exam
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-stretch h-16 bg-white dark:bg-violet-950 border-t-2 border-violet-950 dark:border-white">
        <a className="flex flex-col items-center justify-center text-violet-950 dark:text-white p-2 flex-1 hover:bg-red-50 dark:hover:bg-violet-900 transition-transform active:translate-y-0.5" href="#">
          <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
          <span className="text-[10px] font-black uppercase font-sans">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-red-500 text-white p-2 flex-1 border-l-2 border-r-2 border-violet-950 transition-transform active:translate-y-0.5" href="#">
          <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
          <span className="text-[10px] font-black uppercase font-sans">Analysis</span>
        </a>
        <a className="flex flex-col items-center justify-center text-violet-950 dark:text-white p-2 flex-1 hover:bg-red-50 dark:hover:bg-violet-900 transition-transform active:translate-y-0.5" href="#">
          <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
          <span className="text-[10px] font-black uppercase font-sans">Schedule</span>
        </a>
        <a className="flex flex-col items-center justify-center text-violet-950 dark:text-white p-2 flex-1 hover:bg-red-50 dark:hover:bg-violet-900 transition-transform active:translate-y-0.5" href="#">
          <span className="material-symbols-outlined" data-icon="person">person</span>
          <span className="text-[10px] font-black uppercase font-sans">Account</span>
        </a>
      </nav>
    </div>
  );
}
