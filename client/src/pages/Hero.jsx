import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/hero/HeroBanner';
import CollectionCarousel from '../components/hero/CollectionCarousel';
import FeaturesStrip from '../components/hero/FeaturesStrip';
import AboutUsSection from '../components/hero/AboutUsSection';
import LookbookSection from '../components/hero/LookbookSection';
import MindsetSection from '../components/hero/MindsetSection';
import api from '../lib/api';

const Hero = () => {
  const [heroContent, setHeroContent] = useState(null);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const data = await api.hero.get();
        setHeroContent(data);
      } catch (error) {
        console.error('Error fetching hero content:', error);
      }
    };
    fetchHeroContent();
  }, []);

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
        <AboutUsSection content={heroContent} />

        {/* Lookbook Section */}
        <LookbookSection content={heroContent} />

        {/* Our Mindset Section */}
        <MindsetSection content={heroContent} />
      </div>
    </div>
  );
};

export default Hero;
