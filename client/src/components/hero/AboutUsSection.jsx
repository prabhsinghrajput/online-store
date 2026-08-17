import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="-mx-6 md:-mx-12 my-8 text-gray-900 dark:text-white">
      {/* Row 1: Our Mission (Text Left, Image Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Text Content */}
        <div className="bg-white dark:bg-black px-8 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 lg:px-24 flex flex-col justify-center items-start space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-outfit uppercase">
            <span className="text-black dark:text-white">✦</span> BUILT DIFFERENT.
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-wider font-bebas text-gray-950 dark:text-white leading-none">
            OUR MISSION
          </h2>
          <p className="text-xs sm:text-sm font-outfit text-gray-600 dark:text-neutral-300 leading-relaxed font-light max-w-md">
            CROSS exists for those who refuse to blend in. We create bold, everyday streetwear that represents
            individuality, confidence, and the freedom to move on your own terms. Every piece is designed to help
            you express who you are without saying a word.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center justify-center bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider px-6 py-3 font-outfit transition-all duration-300 shadow-sm cursor-pointer"
          >
            DISCOVER CROSS &nbsp; &rarr;
          </button>
        </div>

        {/* Image */}
        <div className="w-full h-[280px] sm:h-[340px] md:h-[400px] relative overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop"
            alt="Our Mission - CROSS Urban Streetwear"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>
      </div>

      {/* Separator Strip */}
      <div className="bg-white dark:bg-black border-y border-gray-200 dark:border-neutral-800 py-3 flex items-center justify-center gap-6 sm:gap-12 md:gap-16 text-center">
        <div className="text-[10px] md:text-xs font-semibold tracking-[0.25em] text-neutral-500 dark:text-neutral-400 font-outfit uppercase">
          MOVE DIFFERENT.
        </div>
        <div className="flex items-center justify-center">
          {/* Light Mode Logo */}
          <img
            src="https://res.cloudinary.com/dwfalgx6c/image/upload/v1786181989/cross_logo_xlumhw.webp"
            alt="CROSS"
            className="dark:hidden h-7 md:h-9 w-auto object-contain"
          />
          {/* Dark Mode Logo */}
          <img
            src="https://res.cloudinary.com/dwfalgx6c/image/upload/v1786183228/ChatGPT_Image_Aug_8_2026_03_30_05_PM_a98rks.png"
            alt="CROSS"
            className="hidden dark:block h-7 md:h-9 w-auto object-contain"
          />
        </div>
        <div className="text-[10px] md:text-xs font-semibold tracking-[0.25em] text-neutral-500 dark:text-neutral-400 font-outfit uppercase">
          WEAR CROSS.
        </div>
      </div>

      {/* Row 2: Our Vision (Image Left, Text Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="w-full h-[280px] sm:h-[340px] md:h-[400px] relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 order-2 md:order-1">
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop"
            alt="Our Vision - CROSS Contemporary Fashion"
            className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 ease-out"
            loading="lazy"
          />
        </div>

        {/* Text Content */}
        <div className="bg-white dark:bg-black px-8 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 lg:px-24 flex flex-col justify-center items-start space-y-5 order-1 md:order-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-outfit uppercase">
            <span className="text-black dark:text-white">✦</span> THINK DIFFERENT.
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-wider font-bebas text-gray-950 dark:text-white leading-none">
            OUR VISION
          </h2>
          <p className="text-xs sm:text-sm font-outfit text-gray-600 dark:text-neutral-300 leading-relaxed font-light max-w-md">
            We&apos;re building more than a clothing brand &mdash; we&apos;re building a mindset. CROSS is for the generation that
            challenges the ordinary, creates its own path, and never follows the crowd. We believe style should be
            personal, fearless, and unapologetically different.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center justify-center bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider px-6 py-3 font-outfit transition-all duration-300 shadow-sm cursor-pointer"
          >
            EXPLORE OUR STORY &nbsp; &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
