import React from 'react';
import HeroBanner from '../components/hero/HeroBanner';
import CollectionCarousel from '../components/hero/CollectionCarousel';
import FeaturesStrip from '../components/hero/FeaturesStrip';
import AboutUsSection from '../components/hero/AboutUsSection';
import LookbookSection from '../components/hero/LookbookSection';
import MindsetSection from '../components/hero/MindsetSection';

const Hero = () => {
  return (
    <div className="min-h-screen bg-[#f9f9fa] dark:bg-black font-sans">
      {/* Hero Banner Section */}
      <HeroBanner />

      <div className="w-full px-6 md:px-12 pt-8 pb-4 space-y-12">
        {/* Shop The Collection Section */}
        <CollectionCarousel />

        {/* Features Info Strip */}
        <FeaturesStrip />

        {/* About Us Section */}
        <AboutUsSection />

        {/* Lookbook Section */}
        <LookbookSection />

        {/* Our Mindset Section */}
        <MindsetSection />
      </div>
    </div>
  );
};

export default Hero;
