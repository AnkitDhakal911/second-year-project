import express from 'express';
import { check, validationResult } from 'express-validator';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Signup Route
router.post('/signup', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 4+ characters').isLength({ min: 4 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    console.log('Hit /api/auth/signup'); // Debug log
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    
    if (user) return res.status(400).json({ msg: 'User already exists' });
    
    // Store the password in plaintext (no hashing)
    user = new User({ name, email, password, role: role || 'editor' });
    console.log('Creating user with role (authRoutes):', user.role); // Debug log
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login Route
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    // Compare the provided password directly with the stored password (plaintext)
    const isMatch = password === user.password;
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Current User Route
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
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

export default router;