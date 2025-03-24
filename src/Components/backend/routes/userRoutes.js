import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/user.js';

const router = express.Router();

console.log('Registering user routes...'); // Debug log

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

// Update user profile
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (req.user.id !== user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;
    await user.save();

    const updatedUser = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'name profilePicture')
      .populate('following', 'name profilePicture');
    res.json(updatedUser);
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