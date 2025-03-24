import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; // Import auth routes
import userRoutes from './routes/userRoutes.js'; // Import user routes
import postRoutes from './routes/postRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js'; 
import tagRoutes from './routes/tagRoutes.js';

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
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/tags', tagRoutes);

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