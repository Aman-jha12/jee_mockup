'use client';

import { useState, useEffect } from 'react';

export function DeviceGuard({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!isDesktop) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 p-6 text-center text-white">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl bg-slate-800 p-8 shadow-xl">
          <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold">Device Not Supported</h2>
          <p className="text-slate-300">This test is only available on desktop devices.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
