// src/backend/routes/userRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/user.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

console.log('Registering user routes...'); // Debug log

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in the uploads/ folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g., 123456789-profile.jpg
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Update user profile (including profile picture)
router.put('/:id', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const updatedData = {
      name: req.body.name || user.name,
      bio: req.body.bio || user.bio,
    };

    // If a file was uploaded, update the profilePicture field
    if (req.file) {
      updatedData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    )
      .populate('followers', 'name profilePicture')
      .populate('following', 'name profilePicture');

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: err.message || 'Error updating profile' });
  }
});

// Get user suggestions
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ msg: 'User not found' });

    const suggestions = await User.find({
      _id: { $ne: req.user.id, $nin: currentUser.following },
    })
      .select('name profilePicture')
      .limit(5);

    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Search users
router.get('/search', authMiddleware, async (req, res) => {
  console.log('Search route hit:', req.query); // Debug log
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ msg: 'Search query is required' });

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name email profilePicture')
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user by ID
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'name profilePicture')
      .populate('following', 'name profilePicture');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Follow a user
router.post('/follow/:userId', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);
    if (!userToFollow || !currentUser) return res.status(404).json({ msg: 'User not found' });
    if (currentUser.following.includes(userToFollow._id))
      return res.status(400).json({ msg: 'Already following this user' });

    currentUser.following.push(userToFollow._id);
    await currentUser.save();
    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();

    res.json({ msg: 'User followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Unfollow a user
router.post('/unfollow/:userId', authMiddleware, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);
    if (!userToUnfollow || !currentUser) return res.status(404).json({ msg: 'User not found' });

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();

    res.json({ msg: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Check if the logged-in user is following the target user
router.get('/isFollowing/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.userId);
    if (!currentUser || !targetUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUser._id.toString()
    );
    res.json({ isFollowing });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update user role (admin only)
router.put('/:id/role', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    const { role } = req.body;
    if (!['editor', 'reader', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.role = role;
    await user.save();
    res.json({ msg: 'User role updated successfully', user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;