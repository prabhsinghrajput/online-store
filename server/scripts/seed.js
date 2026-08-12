import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { connectDB } from '../src/db/mongo.js';

const newUuid = () => crypto.randomUUID();

const categoriesData = [
  {
    name: 'Whey Protein',
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'BCAA & EAA',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Pre-Workout',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Creatine',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Mass Gainer',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop'
  }
];

const productsData = {
  'Whey Protein': [
    {
      name: '100% Gold Whey Isolate',
      description: 'Premium ultra-filtered whey protein isolate for fast absorption and maximum muscle recovery. Contains minimal carbs and fats.',
      price: 3899,
      discounted_price: 3499,
      brand: 'Fuel Nutrition',
      weight: '2.2 lbs (1 kg)',
      stock: 45,
      image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 25g pure protein per serving\n• Loaded with 5.5g BCAAs\n• Zero added sugar & gluten-free\n• Rapid absorption for post-workout recovery',
      usage_instructions: 'Mix 1 scoop with 200-250ml of cold water or skimmed milk. Consume immediately post-workout or in the morning.'
    },
    {
      name: 'Hydrolyzed Whey Performance',
      description: 'The fastest absorbing protein source for elite athletes. Hydrolyzed whey peptides ensure rapid amino acid delivery to tired muscles.',
      price: 4599,
      discounted_price: 4199,
      brand: 'Titan Sports',
      weight: '2 lbs (907g)',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 30g protein from Hydrolyzed Whey\n• 8.8g BCAAs for muscle protein synthesis\n• Extremely easy to digest\n• Low lactose and low fat content',
      usage_instructions: 'Take 1 scoop immediately after training in 250ml of cold water. Can be taken twice daily.'
    },
    {
      name: 'Grass-Fed Organic Whey Concentrate',
      description: 'Pure, grass-fed organic whey protein concentrate sourced from pasture-raised cows. No artificial colors, sweeteners, or preservatives.',
      price: 3199,
      discounted_price: 2899,
      brand: 'BioNature',
      weight: '2.2 lbs (1 kg)',
      stock: 25,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 100% Organic Grass-Fed Whey\n• 22g protein & 5.1g natural BCAAs\n• Sweetened naturally with Stevia\n• Non-GMO and Soy-free',
      usage_instructions: 'Mix 1 scoop into your favorite smoothie, oatmeal, or 200ml water/milk.'
    },
    {
      name: 'Nighttime Casein Protein Blend',
      description: 'Slow-digesting micellar casein formulation designed to feed your muscles during sleep. Prevents muscle breakdown over long periods.',
      price: 3699,
      discounted_price: 3399,
      brand: 'Fuel Nutrition',
      weight: '2.2 lbs (1 kg)',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 24g slow-release micellar casein protein\n• Continuous amino acid delivery for up to 8 hours\n• Perfect nighttime recovery formula\n• Rich in glutamine to support recovery',
      usage_instructions: 'Mix 1 scoop with 250ml of water or milk and consume 30 minutes before bedtime.'
    },
    {
      name: 'Vegan Pea & Brown Rice Protein',
      description: 'A complete plant-based protein blend combining pea isolate and organic brown rice protein to deliver a full amino acid profile.',
      price: 2799,
      discounted_price: 2499,
      brand: 'BioNature',
      weight: '2 lbs (907g)',
      stock: 60,
      image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 21g premium vegan protein\n• Complete essential amino acid profile\n• Added digestive enzymes\n• Dairy-free, soy-free, and hypoallergenic',
      usage_instructions: 'Mix 1 scoop with 300ml of cold plant milk or water. Shake well and consume.'
    }
  ],
  'BCAA & EAA': [
    {
      name: 'Intra-Workout Amino EAA Boost',
      description: 'Complete Essential Amino Acid (EAA) powder formulated with all 9 EAAs plus electrolytes to sustain hydration and promote muscle recovery.',
      price: 1899,
      discounted_price: 1699,
      brand: 'Fuel Nutrition',
      weight: '30 Servings',
      stock: 100,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• Contains all 9 essential amino acids\n• Electrolytes for superior cellular hydration\n• Enhances intra-workout recovery and stamina\n• Zero Sugar & Zero Calories',
      usage_instructions: 'Mix 1 scoop in 500-600ml of ice-cold water and sip throughout your training session.'
    },
    {
      name: 'BCAA 2:1:1 Recovery Powder',
      description: 'L-Leucine, L-Isoleucine, and L-Valine in the clinically researched 2:1:1 ratio. Designed to stimulate protein synthesis and reduce soreness.',
      price: 1499,
      discounted_price: 1299,
      brand: 'Titan Sports',
      weight: '30 Servings',
      stock: 80,
      image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 5g of pure BCAAs in 2:1:1 ratio\n• Speeds up post-workout muscle repair\n• Reduces muscle fatigue and soreness\n• Delicious and refreshing flavors',
      usage_instructions: 'Mix 1 scoop with 300ml of cold water. Drink during or immediately after exercise.'
    },
    {
      name: 'Hydration BCAA + Coconut Water',
      description: 'Replenishing BCAA mix powered by organic coconut water powder. Best for endurance athletes and outdoor workouts.',
      price: 1699,
      discounted_price: 1499,
      brand: 'BioNature',
      weight: '30 Servings',
      stock: 45,
      image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 6g BCAAs with 500mg Coconut water powder\n• Promotes optimal hydration and electrolyte balance\n• Supports muscle preservation during cutting\n• No artificial colors or dyes',
      usage_instructions: 'Mix 1 scoop with 400ml of cold water. Drink during workouts or throughout the day on rest days.'
    },
    {
      name: 'BCAA Energy & Focus Powder',
      description: 'Provides BCAAs for muscle recovery combined with natural caffeine from green tea to give you a clean, focused energy boost.',
      price: 1799,
      discounted_price: 1549,
      brand: 'Titan Sports',
      weight: '30 Servings',
      stock: 75,
      image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 5g BCAAs + 100mg Natural Caffeine\n• Enhances mental focus and alertness\n• Accelerates recovery and preserves lean muscle\n• Ideal morning energy or pre-training beverage',
      usage_instructions: 'Mix 1-2 scoops in 300ml cold water. Do not consume late in the evening.'
    },
    {
      name: 'Glutamine & BCAA Recovery Matrix',
      description: 'Dual-action formulation combining BCAAs with L-Glutamine to maximize gut health, immune function, and rapid muscle tissue repair.',
      price: 1599,
      discounted_price: 1399,
      brand: 'Fuel Nutrition',
      weight: '30 Servings',
      stock: 90,
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 5g BCAAs + 5g Pure L-Glutamine\n• Comprehensive muscle tissue recovery\n• Boosts immune system health\n• Prevents muscle catabolism (breakdown)',
      usage_instructions: 'Mix 1 scoop with 250ml of cold water and consume immediately after your workout.'
    }
  ],
  'Pre-Workout': [
    {
      name: 'Ignite Extreme Pre-Workout',
      description: 'High-stimulant pre-workout designed to deliver explosive energy, massive pumps, and razor-sharp mental focus.',
      price: 2199,
      discounted_price: 1899,
      brand: 'Titan Sports',
      weight: '30 Servings',
      stock: 65,
      image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 350mg Caffeine for high-intensity energy\n• 6g L-Citrulline Malate for skin-splitting pumps\n• 3.2g Beta-Alanine to delay muscle fatigue\n• Laser focus matrix',
      usage_instructions: 'Mix 1 scoop in 250ml of cold water 15-30 minutes prior to training. Assess tolerance with 1/2 scoop first.'
    },
    {
      name: 'Pump Nitro Stim-Free Pre-Workout',
      description: 'A completely stimulant-free pump and focus formulation. Ideal for late-night training or those sensitive to caffeine.',
      price: 2299,
      discounted_price: 1999,
      brand: 'Fuel Nutrition',
      weight: '30 Servings',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 8g L-Citrulline for extreme vasodilation\n• 1.5g Nitrosigine for sustained nitric oxide levels\n• 100% Caffeine & Stimulant Free\n• Superb mind-muscle connection',
      usage_instructions: 'Mix 1 scoop with 300ml of cold water and drink 20-30 minutes before your workout.'
    },
    {
      name: 'Natural Energizer Pre-Workout',
      description: 'Pre-workout formula crafted with clean organic ingredients, green coffee bean extract, and beetroot powder for natural nitric oxide boost.',
      price: 1999,
      discounted_price: 1799,
      brand: 'BioNature',
      weight: '30 Servings',
      stock: 35,
      image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• Organic Beetroot Powder for natural pumps\n• 150mg Natural Caffeine from Green Coffee Bean\n• No crash, no jitters formula\n• Vegan-friendly, gluten-free, no artificial sweeteners',
      usage_instructions: 'Take 1 scoop with 200-250ml of cold water 30 minutes before physical activity.'
    },
    {
      name: 'Focus Focus Nootropic Pre-Workout',
      description: 'Formulated with strong nootropic agents to create unmatched mental clarity, drive, and coordination during heavy workouts.',
      price: 2499,
      discounted_price: 2199,
      brand: 'Titan Sports',
      weight: '30 Servings',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• Alpha-GPC and L-Tyrosine for cognitive enhancement\n• 200mg Caffeine for clean energy\n• Improves reflexes and muscle recruitment\n• 3.2g Beta-Alanine for endurance',
      usage_instructions: 'Mix 1 scoop with 250ml of cold water 20 minutes before training. Do not exceed 1 scoop daily.'
    },
    {
      name: 'Keto Fuel Pre-Workout',
      description: 'Zero carb pre-workout formulated with BHB salts and MCT oil powder to keep you energized while in ketosis.',
      price: 2399,
      discounted_price: 2099,
      brand: 'Fuel Nutrition',
      weight: '30 Servings',
      stock: 20,
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• BHB Ketones for clean carb-free cellular fuel\n• Medium Chain Triglycerides (MCTs) for fat-adapted energy\n• Low stimulant, natural energy support\n• Zero sugar, gluten-free',
      usage_instructions: 'Mix 1 scoop in 300ml of cold water 20 minutes before exercise.'
    }
  ],
  'Creatine': [
    {
      name: 'Pure Micronized Creatine Monohydrate',
      description: '100% ultra-pure micronized creatine monohydrate. The most researched strength supplement in the world. Easy mixing.',
      price: 999,
      discounted_price: 849,
      brand: 'Fuel Nutrition',
      weight: '250g (83 Servings)',
      stock: 150,
      image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 100% Pure Micronized Creatine Monohydrate\n• 3g of pure creatine per serving\n• Unflavored to easily mix in protein shakes or EAAs\n• Increases strength, power, and muscle volume',
      usage_instructions: 'Mix 1 scoop (3g) with 200ml of water, juice, or your post-workout shake. Consume daily.'
    },
    {
      name: 'Creatine HCL Max Absorption',
      description: 'Premium Creatine Hydrochloride. Offers superior water solubility and bioavailability compared to standard creatine, requiring smaller doses.',
      price: 1499,
      discounted_price: 1299,
      brand: 'Titan Sports',
      weight: '60 Servings',
      stock: 70,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• High-solubility Creatine HCL\n• No loading phase required\n• Zero bloating or water retention\n• High potency, micro-dosing formula',
      usage_instructions: 'Mix 1 scoop (750mg) with 150-200ml of water 15 minutes before training or with a meal.'
    },
    {
      name: 'Buffered Creatine Creapure®',
      description: 'Gold standard Creapure® branded German creatine monohydrate. The purest and safest creatine monohydrate available.',
      price: 1299,
      discounted_price: 1099,
      brand: 'BioNature',
      weight: '250g (83 Servings)',
      stock: 95,
      image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• Made with 100% Creapure® German material\n• Assured 99.99% pure HPLC-tested creatine\n• Helps boost muscle ATP synthesis\n• Tasteless and odorless',
      usage_instructions: 'Mix 1 scoop daily with 250ml water or fruit juice. Keep hydrated throughout the day.'
    },
    {
      name: 'Creatine + Glutamine Recovery Stack',
      description: 'Advanced dual strength and muscle protection formula combining micronized creatine with L-glutamine for high-demand recovery.',
      price: 1599,
      discounted_price: 1399,
      brand: 'Fuel Nutrition',
      weight: '300g (60 Servings)',
      stock: 60,
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 3g Creatine + 2g L-Glutamine per serving\n• Simultaneously boosts power output and speeds recovery\n• Hydrates muscle cells and improves definition\n• Great for high-intensity athletes',
      usage_instructions: 'Mix 1 scoop with 250ml of cold water or your favorite beverage and consume post-workout.'
    },
    {
      name: 'Tri-Creatine Malate Energy',
      description: 'Three creatine molecules bound to malic acid. Promotes explosive energy via ATP production without bloating or water weight.',
      price: 1399,
      discounted_price: 1199,
      brand: 'Titan Sports',
      weight: '300g (60 Servings)',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• Creatine bound to malic acid for advanced Krebs cycle energy\n• Zero water retention or bloating\n• Dramatically improves aerobic and anaerobic endurance\n• Smooth mixing and highly soluble',
      usage_instructions: 'Take 1 scoop daily with water or carbohydrate-rich juice, ideally pre-workout.'
    }
  ],
  'Mass Gainer': [
    {
      name: 'Monster Bulk Extreme Gainer',
      description: 'High-calorie weight gainer loaded with premium complex carbohydrates, multi-source proteins, vitamins, and minerals.',
      price: 3499,
      discounted_price: 2999,
      brand: 'Titan Sports',
      weight: '6 lbs (2.72 kg)',
      stock: 35,
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 1200+ quality calories per serving\n• 50g of whey and casein blend protein\n• 250g of clean complex carbs\n• Added creatine and digestive enzymes',
      usage_instructions: 'Mix 2 scoops in 500-600ml of whole milk or water. Drink between meals or post-workout. Beginners can start with 1 scoop.'
    },
    {
      name: 'Lean Gainer Clean Mass',
      description: 'A 1:1 or 2:1 carbohydrate-to-protein ratio gainer designed to help you add clean lean muscle mass without gaining excess fat.',
      price: 3799,
      discounted_price: 3399,
      brand: 'Fuel Nutrition',
      weight: '4.4 lbs (2 kg)',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 40g Protein and 80g Oats/Sweet Potato Carbs\n• Promotes clean lean bulking\n• Rich in dietary fiber for optimal digestion\n• Zero maltodextrin or cheap sugars',
      usage_instructions: 'Mix 1.5 scoops with 400ml of cold water or milk. Consume twice daily for best results.'
    },
    {
      name: 'Real Food Wholefood Gainer',
      description: 'Mass gainer containing carbohydrate sources exclusively from real foods like oats, sweet potatoes, yams, and blueberries.',
      price: 3999,
      discounted_price: 3599,
      brand: 'BioNature',
      weight: '5 lbs (2.27 kg)',
      stock: 25,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• Real food carbohydrate sources only\n• 30g egg white and beef protein isolate\n• Sustained energy levels without insulin spikes\n• Loaded with natural micronutrients',
      usage_instructions: 'Blend 2 scoops in 400ml of water or nut milk. Great as a breakfast shake or meal replacement.'
    },
    {
      name: 'Mass Fusion Caloric Dense Shake',
      description: 'Super caloric dense formula for hardgainers who struggle to put on weight. Packs dense calories with minimal bloat.',
      price: 3299,
      discounted_price: 2899,
      brand: 'Titan Sports',
      weight: '6 lbs (2.72 kg)',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• Specifically formulated for "hard gainers"\n• 60g protein matrix with slow and fast release\n• 10g BCAAs to kickstart growth\n• High absorption vitamins and minerals',
      usage_instructions: 'Mix 2 scoops with 500ml milk and blend with a ... shake.'
    },
    {
      name: 'Plant-Based Vegan Mass Gainer',
      description: 'High calorie plant-based weight gainer featuring pea, hemp, and quinoa protein, combined with organic oat carbohydrates.',
      price: 3699,
      discounted_price: 3299,
      brand: 'BioNature',
      weight: '4.4 lbs (2 kg)',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
      key_benefits: '• 100% Plant-based mass gainer\n• 35g premium vegan protein blend\n• 90g organic clean carbohydrate sources\n• Dairy-free, soy-free, and vegan certified',
      usage_instructions: 'Blend 2 scoops in 450ml of cold water or plant-based milk. Consume between meals.'
    }
  ]
};

async function seed() {
  try {
    await connectDB();
    console.log('Clearing existing categories and products...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Seeding categories...');
    const createdCategories = [];
    for (const cat of categoriesData) {
      const id = newUuid();
      const newCat = new Category({
        _id: id,
        name: cat.name,
        image: cat.image
      });
      await newCat.save();
      createdCategories.push(newCat);
      console.log(`Created Category: ${cat.name}`);
    }

    console.log('Seeding products...');
    for (const cat of createdCategories) {
      const productsList = productsData[cat.name] || [];
      for (const prod of productsList) {
        const newProd = new Product({
          _id: newUuid(),
          name: prod.name,
          description: prod.description,
          price: prod.price,
          discounted_price: prod.discounted_price,
          category_id: cat._id,
          image: prod.image,
          brand: prod.brand,
          key_benefits: prod.key_benefits,
          usage_instructions: prod.usage_instructions,
          weight: prod.weight,
          stock: prod.stock
        });
        await newProd.save();
        console.log(`  Created Product: ${prod.name} in Category: ${cat.name}`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
