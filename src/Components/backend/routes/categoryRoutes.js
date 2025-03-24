import express from 'express';
import Category from '../models/category.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ msg: 'Server error fetching categories' });
  }
});

// Create a category (allow editors and admins)
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('User trying to create category:', req.user);
    if (req.user.role !== 'editor' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    const { categoryName } = req.body;
    console.log('Creating category:', categoryName);
    let category = await Category.findOne({ categoryName });
    if (category) {
      return res.status(200).json(category);
    }
    category = new Category({ categoryName });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(400).json({ msg: err.message });
  }
});

export default router;