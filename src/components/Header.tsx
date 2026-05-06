'use client';

import React from 'react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="bg-[#050a18] border-b border-gray-800 sticky top-0 z-50">
      <div className="flex justify-end items-center w-full px-4 md:px-8 py-4 md:py-5 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6">
          <a
            href="https://admissions.tint.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer bg-[#cc2229] hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all"
          >
            Apply 2026
          </a>

          <a 
            href="https://tint.edu.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/tint_logo.webp"
              alt="TINT Logo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
