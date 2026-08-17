import mongoose from 'mongoose';
import { uuidString, timestamps, applyIdVirtual } from './base.js';

const heroContentSchema = new mongoose.Schema(
  {
    _id: uuidString,
    aboutUsTitle1: { type: String, default: 'BUILT DIFFERENT.' },
    aboutUsHeader1: { type: String, default: 'OUR MISSION' },
    aboutUsDesc1: { type: String, default: 'CROSS exists for those who refuse to blend in. We create bold, everyday streetwear that represents individuality, confidence, and the freedom to move on your own terms. Every piece is designed to help you express who you are without saying a word.' },
    aboutUsBtn1: { type: String, default: 'DISCOVER CROSS' },
    aboutUsImg1: { type: String, default: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop' },

    aboutUsTitle2: { type: String, default: 'THINK DIFFERENT.' },
    aboutUsHeader2: { type: String, default: 'OUR VISION' },
    aboutUsDesc2: { type: String, default: "We're building more than a clothing brand — we're building a mindset. CROSS is for the generation that challenges the ordinary, creates its own path, and never follows the crowd. We believe style should be personal, fearless, and unapologetically different." },
    aboutUsBtn2: { type: String, default: 'EXPLORE OUR STORY' },
    aboutUsImg2: { type: String, default: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop' },

    lookbookTitle: { type: String, default: "Lookbook '24" },
    lookbookHeading1: { type: String, default: 'Timeless' },
    lookbookHeading2: { type: String, default: 'Pieces.' },
    lookbookHeading3: { type: String, default: 'Limitless' },
    lookbookHeading4: { type: String, default: 'Vibes.' },
    lookbookDesc: { type: String, default: 'Designed for the streets.\nMade for the misfits.' },

    mindsetTitle: { type: String, default: 'Our Mindset' },
    mindsetHeading1: { type: String, default: "We Don't Follow." },
    mindsetHeading2: { type: String, default: 'We Cross.' },
    mindsetDesc: { type: String, default: "CROSS isn't just a brand, it's a mindset.\nWe challenge the norm and create our own lane.\nBuilt for those who move different and choose their own path." },
    
    created_at: timestamps.created_at,
    updated_at: timestamps.updated_at,
  },
  { _id: false, versionKey: false }
);

heroContentSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

heroContentSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

applyIdVirtual(heroContentSchema);

export const HeroContent = mongoose.model('HeroContent', heroContentSchema);
