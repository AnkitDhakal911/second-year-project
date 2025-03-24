import express from 'express';
import Tag from '../models/tag.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all tags (public)
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ msg: 'Server error fetching tags' });
  }
});

// Create a tag (allow editors and admins)
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('User trying to create tag:', req.user);
    if (req.user.role !== 'editor' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    const { tagName } = req.body;
    console.log('Creating tag:', tagName);
    let tag = await Tag.findOne({ tagName });
    if (tag) {
      return res.status(200).json(tag);
    }
    tag = new Tag({ tagName });
    await tag.save();
    res.status(201).json(tag);
  } catch (err) {
    console.error('Error creating tag:', err);
    res.status(400).json({ msg: err.message });
  }
});

export default router;