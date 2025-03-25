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
    const populatedPost = await Post.findById(post._id)
      .populate('authorId', 'name profilePicture')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName')
      .populate('comments.userId', 'name profilePicture');
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Get all published posts (public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('authorId', 'name profilePicture')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName')
      .populate('comments.userId', 'name profilePicture');
    
    // Add debugging logs
    console.log('Fetched posts:', posts);
    const validPosts = posts.filter(post => {
      if (!post.authorId) {
        console.log('Post with missing authorId:', post);
        return false;
      }
      if (!post.authorId.profilePicture) {
        console.log('Author missing profilePicture:', post.authorId);
      }
      return true;
    });
    
    res.json(validPosts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get a single post by ID (public) and increment views
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name profilePicture')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName')
      .populate('comments.userId', 'name profilePicture');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (!post.authorId) return res.status(404).json({ msg: 'Post author not found' });

    // Increment views
    post.views += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update a post (author or admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('authorId', 'name profilePicture')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName')
      .populate('comments.userId', 'name profilePicture');
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ msg: 'Error updating post', error: err.message });
  }
});

// Delete a post (author or admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting post', error: err.message });
  }
});

// Like a post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(userId => userId.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    const updatedPost = await Post.findById(req.params.id)
      .populate('authorId', 'name profilePicture')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName')
      .populate('comments.userId', 'name profilePicture');
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add a comment to a post
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ msg: 'Comment content is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const newComment = {
      userId: req.user.id,
      content,
      createdAt: new Date(),
    };
    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('authorId', 'name profilePicture')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName')
      .populate('comments.userId', 'name profilePicture');
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a comment (author of comment or admin only)
router.delete('/:postId/comment/:commentId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
    await post.save();

    const updatedPost = await Post.findById(req.params.postId)
      .populate('authorId', 'name profilePicture')
      .populate('categoryId', 'categoryName')
      .populate('tags', 'tagName')
      .populate('comments.userId', 'name profilePicture');
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;