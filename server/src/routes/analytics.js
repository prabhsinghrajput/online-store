import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    const products = await Product.find();
    const categories = await Category.find();

    const categoriesById = new Map(categories.map(c => [c._id, c]));

    const populatedProducts = products.map(p => {
      const copy = { ...p };
      if (p.category_id && categoriesById.has(p.category_id)) {
        copy.category = categoriesById.get(p.category_id);
      }
      return copy;
    });

    res.json({ orders: orders || [], products: populatedProducts || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
