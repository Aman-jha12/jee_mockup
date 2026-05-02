'use client';

import React from 'react';

export default function ResultPage() {
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

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Hero Summary Section */}
        <section className="mb-12">
          <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-8 border-t-[8px] border-t-red-500 text-center">
            <p className="font-extrabold text-[12px] tracking-[0.1em] leading-none text-[#6950a2] uppercase mb-2">Examination Result</p>
            <h1 className="font-bold text-[32px] tracking-[-0.02em] leading-[1.2] text-violet-950 mb-4">Your Result</h1>
            <p className="text-[16px] font-normal leading-relaxed text-[#5b403e] mb-8 italic">"Strong performance. Keep pushing."</p>
            <div className="inline-block border-4 border-violet-950 p-6 mb-8">
              <span className="font-extrabold text-[72px] tracking-[-0.04em] leading-none text-red-500">180</span>
              <span className="font-bold text-[32px] tracking-[-0.02em] leading-[1.2] text-violet-950"> / 300</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto border-t-2 border-violet-950 pt-8">
              <div>
                <p className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e] mb-1">GLOBAL RANK</p>
                <p className="font-bold text-[24px] leading-[1.3] text-violet-950">#42</p>
              </div>
              <div className="border-x-0 md:border-x-2 border-violet-950">
                <p className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e] mb-1">ACCURACY</p>
                <p className="font-bold text-[24px] leading-[1.3] text-violet-950">72%</p>
              </div>
              <div>
                <p className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e] mb-1">TIME TAKEN</p>
                <p className="font-bold text-[24px] leading-[1.3] text-violet-950">45m</p>
              </div>
            </div>
          </div>
        </section>

        {/* Score Breakdown Grid */}
        <section className="mb-12">
          <h2 className="font-extrabold text-[12px] tracking-[0.1em] leading-none text-violet-950 mb-6 uppercase">Detailed Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Marks */}
            <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-violet-950" data-icon="analytics">analytics</span>
                <span className="text-[10px] font-black bg-violet-950 text-white px-2 py-1">TOTAL</span>
              </div>
              <div>
                <p className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e]">TOTAL MARKS</p>
                <p className="font-bold text-[32px] tracking-[-0.02em] leading-[1.2] mt-2">
                  <span className="text-red-500">180</span><span className="text-violet-950">/300</span>
                </p>
              </div>
            </div>
            {/* Correct/Incorrect */}
            <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-violet-950" data-icon="check_circle">check_circle</span>
                <span className="text-[10px] font-black bg-violet-950 text-white px-2 py-1">VALIDATION</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e]">CORRECT</p>
                  <p className="font-bold text-[24px] leading-[1.3] text-green-600">54</p>
                </div>
                <div className="h-10 w-[2px] bg-violet-950"></div>
                <div className="text-right">
                  <p className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e]">INCORRECT</p>
                  <p className="font-bold text-[24px] leading-[1.3] text-red-500">18</p>
                </div>
              </div>
            </div>
            {/* Overall Accuracy */}
            <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-violet-950" data-icon="bolt">bolt</span>
                <span className="text-[10px] font-black bg-violet-950 text-white px-2 py-1">PRECISION</span>
              </div>
              <p className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e] mb-2">OVERALL ACCURACY</p>
              <div className="flex items-end gap-2 mb-3">
                <p className="font-bold text-[32px] tracking-[-0.02em] leading-[1.2] text-violet-950 leading-none">72%</p>
                <p className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e] pb-1">TARGET: 85%</p>
              </div>
              <div className="h-3 bg-gray-200 relative overflow-hidden border-2 border-violet-950">
                <div className="h-full bg-red-500 w-[72%]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Subject-wise Performance */}
        <section className="mb-12">
          <h2 className="font-extrabold text-[12px] tracking-[0.1em] leading-none text-violet-950 mb-6 uppercase">Subject Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mathematics */}
            <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-6">
              <h3 className="font-bold text-[24px] leading-[1.3] text-violet-950 mb-4 border-b-2 border-violet-950 pb-2">Mathematics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e]">SCORE</span>
                  <span className="text-[16px] font-semibold leading-relaxed text-red-500">70/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-bold">21 Correct</span>
                  <span className="text-red-500 font-bold">4 Incorrect</span>
                  <span className="text-violet-300 font-bold">5 Left</span>
                </div>
                <div className="h-3 bg-gray-200 relative overflow-hidden border-2 border-violet-950">
                  <div className="h-full bg-red-500 w-[70%]"></div>
                </div>
              </div>
            </div>
            {/* Physics */}
            <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-6">
              <h3 className="font-bold text-[24px] leading-[1.3] text-violet-950 mb-4 border-b-2 border-violet-950 pb-2">Physics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e]">SCORE</span>
                  <span className="text-[16px] font-semibold leading-relaxed text-red-500">60/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-bold">18 Correct</span>
                  <span className="text-red-500 font-bold">7 Incorrect</span>
                  <span className="text-violet-300 font-bold">5 Left</span>
                </div>
                <div className="h-3 bg-gray-200 relative overflow-hidden border-2 border-violet-950">
                  <div className="h-full bg-red-500 w-[60%]"></div>
                </div>
              </div>
            </div>
            {/* Chemistry */}
            <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-6">
              <h3 className="font-bold text-[24px] leading-[1.3] text-violet-950 mb-4 border-b-2 border-violet-950 pb-2">Chemistry</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-extrabold text-[12px] tracking-[0.1em] uppercase leading-none text-[#5b403e]">SCORE</span>
                  <span className="text-[16px] font-semibold leading-relaxed text-red-500">50/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-bold">15 Correct</span>
                  <span className="text-red-500 font-bold">7 Incorrect</span>
                  <span className="text-violet-300 font-bold">8 Left</span>
                </div>
                <div className="h-3 bg-gray-200 relative overflow-hidden border-2 border-violet-950">
                  <div className="h-full bg-red-500 w-[50%]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Question Grid Summary */}
        <section className="mb-12">
          <div className="border-2 border-[#2e1065] bg-white transition-transform duration-100 ease-out hover:-translate-y-[2px] hover:-translate-x-[2px] p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="font-extrabold text-[12px] tracking-[0.1em] leading-none text-violet-950 uppercase">Question Grid Summary</h2>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-violet-950 border border-violet-950"></div>
                  <span className="text-[10px] font-black uppercase">Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 border border-violet-950"></div>
                  <span className="text-[10px] font-black uppercase">Incorrect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-violet-950"></div>
                  <span className="text-[10px] font-black uppercase">Skipped</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">1</div>
              <div className="w-8 h-8 bg-red-500 text-white flex items-center justify-center font-bold text-xs">2</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">3</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">4</div>
              <div className="w-8 h-8 bg-white border border-violet-950 text-violet-950 flex items-center justify-center font-bold text-xs">5</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">6</div>
              <div className="w-8 h-8 bg-red-500 text-white flex items-center justify-center font-bold text-xs">7</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">8</div>
              <div className="w-8 h-8 bg-white border border-violet-950 text-violet-950 flex items-center justify-center font-bold text-xs">9</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">10</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">11</div>
              <div className="w-8 h-8 bg-red-500 text-white flex items-center justify-center font-bold text-xs">12</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">13</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">14</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">15</div>
              <div className="w-8 h-8 bg-red-500 text-white flex items-center justify-center font-bold text-xs">16</div>
              <div className="w-8 h-8 bg-white border border-violet-950 text-violet-950 flex items-center justify-center font-bold text-xs">17</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">18</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">19</div>
              <div className="w-8 h-8 bg-violet-950 text-white flex items-center justify-center font-bold text-xs">20</div>
              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-violet-300">...</div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col md:flex-row gap-6 justify-center items-stretch md:items-center mt-12">
          <button className="px-8 py-4 bg-white border-4 border-violet-950 text-violet-950 font-black uppercase tracking-widest hover:bg-violet-50 transition-all active:translate-y-1">
            Review Answers
          </button>
          <button className="px-10 py-4 bg-red-500 border-4 border-violet-950 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-all active:translate-y-1">
            Go to Dashboard
          </button>
          <button className="px-8 py-4 bg-transparent text-violet-950 font-black uppercase tracking-widest hover:underline transition-all">
            Download Result
          </button>
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
