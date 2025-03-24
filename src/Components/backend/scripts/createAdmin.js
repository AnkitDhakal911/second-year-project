import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

// Debug log to check if MONGODB_URI is loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the .env file');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Function to create an admin user
const createAdmin = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Check if an admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create a new admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // Store password in plaintext (as per your current setup)
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully:', adminUser.email);

    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createAdmin();