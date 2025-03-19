import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './config/db.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import User from './models/user.js'; // Import the User model

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  console.log('Login request received:', { email: trimmedEmail });  // Debug log

  try {
    // Check if user exists
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log('User not found:', trimmedEmail); // Debug log
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

     // Check password (direct comparison)
     if (trimmedPassword !== user.password) {
      console.log('Invalid password for user:', trimmedEmail); // Debug log
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login successful for user:', trimmedEmail); // Debug log
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message); // Debug log
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  console.log('Signup request received:', { name, email: trimmedEmail }); // Debug log

  try {
    // Check if user already exists
    let user = await User.findOne({ email: trimmedEmail });
    if (user) {
      console.log('User already exists:', trimmedEmail); // Debug log
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({ name, email: trimmedEmail, password: trimmedPassword });


    // Save user to database
    await user.save();
    console.log('User created successfully:', trimmedEmail); // Debug log

    // Generate JWT token
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Signup error:', err.message); // Debug log
    res.status(500).send('Server error');
  }
});

// Start the server
const PORT = process.env.PORT || 8266;

const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Server startup error:', err.message);
    process.exit(1); // Exit the process if there's an error
  }
};

startServer();