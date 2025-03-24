import mongoose from 'mongoose';

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
  }], // Array of Tag ObjectIds
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
});

const Post = mongoose.model('Post', postSchema);

export default Post;