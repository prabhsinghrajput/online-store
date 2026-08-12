import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { connectDB } from '../src/db/mongo.js';

const newUuid = () => crypto.randomUUID();

const categoriesData = [
  {
    name: 'Liver Support',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165286/liver_support_unh2se.jpg'
  },
  {
    name: 'Multivitamins',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165286/multivitamin_djf6gn.jpg'
  },
  {
    name: 'Proteins',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165286/protein_sxu3pt.jpg'
  },
  {
    name: 'Test Boosters',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165286/test_supporter_nzsd8q.jpg'
  },
  {
    name: 'Pre-Workout',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165286/pre_workout_pmzwkb.jpg'
  },
  {
    name: 'Healthy Feast',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165286/healthy_feast_gzonqo.jpg'
  },
  {
    name: 'Creatine',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165285/creatine_ttffzm.jpg'
  },
  {
    name: 'Gainers',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165285/gainer_lpozvg.jpg'
  },
  {
    name: 'Accessories & L-Carnitine',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165285/shakers_carnitine_ytxifu.jpg'
  },
  {
    name: 'Fish Oil & Omega',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165285/fish_oil_m3aeja.jpg'
  },
  {
    name: 'Fat Burners',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165285/fat_burner_gegdy2.jpg'
  },
  {
    name: 'BCAA & EAA',
    image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165285/bcaa_eaa_dueq4k.jpg'
  }
];

async function seedCategories() {
  try {
    await connectDB();
    console.log('Clearing existing categories and products...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Seeding categories...');
    for (const cat of categoriesData) {
      const id = newUuid();
      const newCat = new Category({
        _id: id,
        name: cat.name,
        image: cat.image
      });
      await newCat.save();
      console.log(`Created Category: ${cat.name}`);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding categories:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedCategories();
