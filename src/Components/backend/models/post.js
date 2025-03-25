// src/backend/models/post.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const postSchema = new mongoose.Schema({
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tag' 
  }],
  createdDate: { 
    type: Date, 
    default: Date.now 
  },
  publishedDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'scheduled'], 
    default: 'draft' 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // Array of user IDs who liked the post
  comments: [commentSchema], // Embedded comments
  views: { 
    type: Number, 
    default: 0 
  }, // View count
});

const Post = mongoose.model('Post', postSchema);

export default Post;