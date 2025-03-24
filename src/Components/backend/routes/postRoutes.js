import express from 'express';
import Post from '../models/post.js';
import { authMiddleware, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a new post (authenticated users only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, categoryId, tags, status, publishedDate } = req.body;
    const post = new Post({
      authorId: req.user.id,
      title,
      content,
      categoryId,
      tags,
      status,
      publishedDate: status === 'scheduled' ? publishedDate : status === 'published' ? Date.now() : null,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Get all published posts (public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('authorId', 'name')
      .populate('categoryId', 'categoryName');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get a single post by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name')
      .populate('categoryId', 'categoryName');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update a post (author or admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    // Check if user is the author or an admin
    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Delete a post (author or admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    // Check if user is the author or an admin
    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;