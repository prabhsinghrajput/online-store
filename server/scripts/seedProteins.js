import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { connectDB } from '../src/db/mongo.js';

const newUuid = () => crypto.randomUUID();

async function seedProteins() {
  try {
    await connectDB();

    // Find the Proteins category (case-insensitive search)
    const category = await Category.findOne({ name: { $regex: /^proteins$/i } });
    if (!category) {
      console.error('Proteins category not found. Please seed categories first.');
      process.exit(1);
    }

    console.log(`Found Proteins Category: ${category.name} (${category._id})`);

    // Clean up any existing products under this category to start fresh
    await Product.deleteMany({ category_id: category._id });

    const proteinsData = [
      {
        name: 'Biozyme Performance Whey',
        description: 'Clinically tested Biozyme Performance Whey for 50% higher protein absorption and 60% higher BCAA absorption. Designed for athletes looking for peak performance.',
        price: 3299,
        discounted_price: 2999,
        brand: 'MuscleBlaze',
        weight: '2 kg (4.4 lbs)',
        stock: 50,
        image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165567/f8ce5b03c4bae3b1c74bb179a8222b52_qgcsws.jpg',
        key_benefits: '• 25g Protein per serving\n• 11.75g EAAs & 5.51g BCAAs\n• Enhanced Absorption Formula (EAF®) for reduced bloating\n• Informed Choice certified - tested for banned substances',
        usage_instructions: 'Add 1 level scoop (36g) to 200ml of cold water. Shake vigorously for 15 to 30 seconds until dissolved.'
      },
      {
        name: 'Premium Gold Whey',
        description: 'Premium Gold Whey delivers a high-quality protein blend to support muscle recovery, lean muscle growth, and strength gains.',
        price: 1899,
        discounted_price: 1699,
        brand: 'Bigmuscles Nutrition',
        weight: '1 kg (2.2 lbs)',
        stock: 40,
        image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165567/f9eac1a5b335196fcefd41c55f663261_jbbfnd.jpg',
        key_benefits: '• 25g Whey Protein per serving\n• 5.5g BCAAs & 4g Glutamic Acid\n• Zero Sugar & Zero Soy\n• Multi-filtered Whey Isolate & Concentrate blend for best taste and solubility',
        usage_instructions: 'Mix 1 scoop (33g) with 150ml of cold water or milk. Consume immediately post-workout.'
      },
      {
        name: 'Gold Standard 100% Whey',
        description: "The world's best-selling whey protein powder. Formulated with Whey Protein Isolate as the primary ingredient to support post-workout muscle recovery and muscle building.",
        price: 3899,
        discounted_price: 3499,
        brand: 'Optimum Nutrition (ON)',
        weight: '2 lbs (907g)',
        stock: 60,
        image: 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786165566/1b6105d22751e2d9651acb7741ec5262_rkikvc.jpg',
        key_benefits: '• 24g Whey Protein primarily from Isolate\n• 5.5g BCAAs & 4g Glutamine/Glutamic Acid\n• Gluten-Free and banned substance tested\n• Instantized for easy mixing with a shaker or spoon',
        usage_instructions: 'Mix 1 scoop in 180-240ml of cold water, milk, or your favorite beverage. Stir or shake until completely dissolved.'
      }
    ];

    console.log('Seeding protein products...');
    for (const prod of proteinsData) {
      const newProd = new Product({
        _id: newUuid(),
        name: prod.name,
        description: prod.description,
        price: prod.price,
        discounted_price: prod.discounted_price,
        category_id: category._id,
        image: prod.image,
        brand: prod.brand,
        key_benefits: prod.key_benefits,
        usage_instructions: prod.usage_instructions,
        weight: prod.weight,
        stock: prod.stock
      });
      await newProd.save();
      console.log(`Created Product: ${prod.name}`);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding protein products:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedProteins();
