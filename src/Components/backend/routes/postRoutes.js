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
      .populate('authorId', 'name') // Populate authorId with name
      .populate('categoryId', 'categoryName') // Populate categoryId with categoryName
      .populate('tags', 'tagName'); // Populate tags with tagName

    // Filter out posts where authorId is null (i.e., the referenced user doesn't exist)
    const validPosts = posts.filter(post => post.authorId);
    res.json(validPosts);
  } catch (err) {
    console.error('Error fetching posts:', err); // Log the error for debugging
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get a single post by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName'); // Populate tags
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (!post.authorId) return res.status(404).json({ msg: 'Post author not found' }); // Handle missing author
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

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('authorId', 'name')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName');
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