import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' }, // URL to the profile picture
  bio: { type: String, default: '' }, // User bio
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of follower IDs
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of following IDs
  role: { type: String, enum: ['reader', 'editor', 'admin'], default: 'editor' }, // Change default to 'editor'
}, { timestamps: true }); // Add timestamps to automatically manage createdAt and updatedAt

const User = mongoose.model('User', userSchema);

export default User;