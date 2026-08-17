import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const HeroBanner = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const controller = new AbortController();

    const fetchBanners = async () => {
      try {
        const data = await api.banners.getAll({ signal: controller.signal });
        const active = data ? data.filter(b => b.active) : [];
        setBanners(active);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching hero banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  // Determine current display image
  const currentBanner = banners[currentIndex];

  if (loading) {
    return (
      <div className="w-full bg-black h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-neutral-800 border-t-neutral-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const bgImage = currentBanner ? currentBanner.image : '';

  return (
    <div className="w-full relative overflow-hidden bg-black flex items-center justify-center">
      <img 
        src={bgImage} 
        alt="Hero Banner" 
        className="w-full h-auto object-contain block transition-all duration-700 hover:scale-[1.01]"
      />
    </div>
  );
};

export default HeroBanner;
