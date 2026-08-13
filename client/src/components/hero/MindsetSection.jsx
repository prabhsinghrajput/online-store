import React from 'react';

const MindsetSection = () => {
  return (
    <div className="dark:bg-black text-gray-900 dark:text-white p-8 md:p-12 rounded-md my-8 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Brand Logo + Mindset Tagline */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Distressed X shape logo */}
          <svg className="w-16 h-16 sm:w-20 sm:h-20 text-black dark:text-white flex-shrink-0 stroke-[1.2]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <path d="M20 20 L80 80" strokeWidth="12" strokeLinecap="round" />
            <path d="M80 20 L20 80" strokeWidth="12" strokeLinecap="round" />
            <path d="M16 24 C 30 35, 65 70, 76 84" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <path d="M24 16 C 35 30, 70 65, 84 76" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <path d="M76 16 C 65 30, 30 65, 16 76" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <path d="M84 24 C 70 35, 35 70, 24 84" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </svg>
          
          <div className="space-y-3">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 dark:text-neutral-500 uppercase block">
              Our Mindset
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none uppercase space-y-1">
              <span className="text-gray-950 dark:text-white block">We Don&apos;t Follow.</span>
              <span className="text-gray-400 dark:text-neutral-500 block">We Cross.</span>
            </h2>
          </div>
        </div>

        {/* Right Column: Paragraph + Signature */}
        <div className="lg:col-span-5 space-y-6">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-500 font-medium leading-relaxed max-w-md">
            CROSS isn&apos;t just a brand, it&apos;s a mindset.<br />
            We challenge the norm and create our own lane.<br />
            Built for those who move different and choose their own path.
          </p>
          
          {/* Signature SVG */}
          <div className="pt-1">
            <svg className="w-28 h-10 text-black dark:text-white opacity-90" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="1.25">
              <path d="M10 25 C 20 5, 25 35, 35 15 C 45 -5, 40 38, 55 20 C 65 5, 60 30, 75 18 C 85 10, 80 30, 95 15 M30 22 L85 22" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindsetSection;
