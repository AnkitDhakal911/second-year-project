import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

function Post() {
  const { id } = useParams();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [tagError, setTagError] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Backend base URL
  const BACKEND_URL = 'http://localhost:8266';

  // Animation variants for fade-in and slide-up effect
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, catRes, tagRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/posts/${id}`),
          axios.get(`${BACKEND_URL}/api/categories`),
          axios.get(`${BACKEND_URL}/api/tags`),
        ]);
        console.log('Fetched post:', postRes.data);
        console.log('Logged-in user:', user);
        setPost(postRes.data);
        setCategories(catRes.data || []);
        setTags(tagRes.data || []);

        const publishedDate = postRes.data.publishedDate
          ? new Date(postRes.data.publishedDate).toISOString().slice(0, 16)
          : '';

        setFormData({
          title: postRes.data.title || '',
          content: postRes.data.content || '',
          categoryId: postRes.data.categoryId?._id || '',
          tags: postRes.data.tags?.map((tag) => tag._id) || [],
          status: postRes.data.status || 'draft',
          publishedDate: publishedDate,
        });
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        setError('Post not found');
      }
    };
    fetchData();
  }, [id, logout, navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagChange = (e) => {
    const selectedTags = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, tags: selectedTags });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setCategoryError('Category name cannot be empty');
      return;
    }
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/categories`,
        { categoryName: newCategory.trim() },
        { headers: { 'x-auth-token': token } }
      );
      setCategories([...categories, res.data]);
      setFormData({ ...formData, categoryId: res.data._id });
      setNewCategory('');
      setCategoryError('');
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setCategoryError(err.response?.data?.msg || 'Error adding category');
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) {
      setTagError('Tag name cannot be empty');
      return;
    }
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/tags`,
        { tagName: newTag.trim() },
        { headers: { 'x-auth-token': token } }
      );
      setTags([...tags, res.data]);
      setFormData({ ...formData, tags: [...formData.tags, res.data._id] });
      setNewTag('');
      setTagError('');
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setTagError(err.response?.data?.msg || 'Error adding tag');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const updatedPost = { ...formData };
      const res = await axios.put(`${BACKEND_URL}/api/posts/${id}`, updatedPost, {
        headers: { 'x-auth-token': token },
      });
      setPost(res.data);
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.msg || 'Error updating post');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/posts/${id}`, {
        headers: { 'x-auth-token': token },
      });
      // Navigate to Home page with a state flag to trigger a re-fetch
      navigate('/', { state: { refreshPosts: true } });
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.msg || 'Error deleting post');
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/posts/${id}/like`,
        {},
        {
          headers: { 'x-auth-token': token },
        }
      );
      setPost((prevPost) => ({
        ...prevPost,
        likes: res.data.likes,
      }));
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.msg || 'Error liking post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/posts/${id}/comment`,
        { content: comment },
        { headers: { 'x-auth-token': token } }
      );
      setPost((prevPost) => ({
        ...prevPost,
        comments: res.data.comments,
      }));
      setComment('');
      setShowComments(true);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.msg || 'Error adding comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/posts/${id}/comment/${commentId}`,
        {
          headers: { 'x-auth-token': token },
        }
      );
      setPost((prevPost) => ({
        ...prevPost,
        comments: res.data.comments,
      }));
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.msg || 'Error deleting comment');
    }
  };

  if (!post || !formData) return <div className="p-8 text-gray-600 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;

  const authorId = typeof post.authorId === 'object' ? post.authorId._id : post.authorId;
  const canEdit = user && ((authorId && authorId.toString() === user.id) || user.role === 'admin');
  const isLiked = user && post.likes.includes(user.id);

  const canDeleteComment = (commentUserId) => {
    if (!user) {
      console.log('User not defined');
      return false;
    }
    if (!commentUserId) {
      console.log('Comment user ID not defined');
      return false;
    }
    const commentUserIdStr = typeof commentUserId === 'object' ? commentUserId._id : commentUserId;
    console.log('Current user ID:', user.id);
    console.log('Comment user ID:', commentUserIdStr);
    console.log('User role:', user.role);
    const canDelete = commentUserIdStr === user.id || user.role === 'admin';
    console.log('Can delete comment:', canDelete);
    return canDelete;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="relative bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl shadow-lg p-8 mb-10 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-opacity-20 bg-black"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
              By {post.authorId?.name || 'Unknown Author'} •{' '}
              {new Date(post.createdDate).toLocaleDateString()}
            </p>
          </div>
        </motion.section>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-red-500 mb-6 text-center bg-red-50 py-2 px-4 rounded-lg shadow-sm"
          >
            {error}
          </motion.p>
        )}

        {/* Post Content or Edit Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl"
        >
          {isEditing ? (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Post</h2>
              <form onSubmit={handleEdit} className="space-y-6">
                {/* Title */}
                <motion.div variants={inputVariants}>
                  <label className="block font-medium text-gray-700 mb-2">Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  />
                </motion.div>

                {/* Content */}
                <motion.div variants={inputVariants}>
                  <label className="block font-medium text-gray-700 mb-2">Content:</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    rows="6"
                  />
                </motion.div>

                {/* Category */}
                <motion.div variants={inputVariants}>
                  <label className="block font-medium text-gray-700 mb-2">Category:</label>
                  <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add new category"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      />
                      <motion.button
                        type="button"
                        onClick={handleAddCategory}
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-md"
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>
                  {categoryError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-red-500 mt-2"
                    >
                      {categoryError}
                    </motion.p>
                  )}
                </motion.div>

                {/* Tags */}
                <motion.div variants={inputVariants}>
                  <label className="block font-medium text-gray-700 mb-2">Tags:</label>
                  <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <select
                      name="tags"
                      multiple
                      value={formData.tags}
                      onChange={handleTagChange}
                      className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    >
                      {tags.map((tag) => (
                        <option key={tag._id} value={tag._id}>
                          {tag.tagName}
                        </option>
                      ))}
                    </select>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add new tag"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      />
                      <motion.button
                        type="button"
                        onClick={handleAddTag}
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-md"
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>
                  {tagError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-red-500 mt-2"
                    >
                      {tagError}
                    </motion.p>
                  )}
                </motion.div>

                {/* Status */}
                <motion.div variants={inputVariants}>
                  <label className="block font-medium text-gray-700 mb-2">Status:</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </motion.div>

                {/* Published Date (if scheduled) */}
                {formData.status === 'scheduled' && (
                  <motion.div variants={inputVariants}>
                    <label className="block font-medium text-gray-700 mb-2">Published Date:</label>
                    <input
                      type="datetime-local"
                      name="publishedDate"
                      value={formData.publishedDate}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </motion.div>
                )}

                {/* Save and Cancel Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    type="submit"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 shadow-md"
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 shadow-md"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={
                    post.authorId?.profilePicture
                      ? `${BACKEND_URL}${post.authorId.profilePicture}`
                      : '/default-profile.png'
                  }
                  alt={post.authorId?.name || 'Unknown'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-teal-300"
                  onError={(e) => {
                    console.log('Error loading author profile picture:', e);
                    e.target.src = '/default-profile.png';
                  }}
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
                  <p className="text-sm text-gray-500">
                    By {post.authorId?.name || 'Unknown'} •{' '}
                    {new Date(post.createdDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">{post.content}</p>
              <div className="text-sm text-gray-600 mb-6">
                <p>
                  <span className="font-semibold text-teal-600">Category:</span>{' '}
                  {post.categoryId?.categoryName || 'Uncategorized'}
                </p>
                <p>
                  <span className="font-semibold text-teal-600">Tags:</span>{' '}
                  {post.tags && Array.isArray(post.tags)
                    ? post.tags.map((tag) => tag.tagName).join(', ')
                    : 'No tags'}
                </p>
                <p>
                  <span className="font-semibold text-teal-600">Status:</span> {post.status}
                </p>
                {post.publishedDate && (
                  <p>
                    <span className="font-semibold text-teal-600">Published:</span>{' '}
                    {new Date(post.publishedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      ></path>
                    </svg>
                    {post.likes.length} Likes
                  </span>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-1 text-gray-600 hover:text-teal-500 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      ></path>
                    </svg>
                    {post.comments.length} Comments {showComments ? '(Hide)' : '(See)'}
                  </button>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                    {post.views} Views
                  </span>
                </div>
                {canEdit && (
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      className="text-teal-600 hover:text-teal-700 transition-colors duration-200"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={handleDelete}
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      className="text-red-600 hover:text-red-700 transition-colors duration-200"
                    >
                      Delete
                    </motion.button>
                  </div>
                )}
              </div>
              {user && (
                <motion.button
                  onClick={handleLike}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 shadow-md ${
                    isLiked
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-teal-500 text-white hover:bg-teal-600'
                  }`}
                >
                  <span>{isLiked ? 'Unlike' : 'Like'}</span>
                  <svg
                    className="w-5 h-5"
                    fill={isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                </motion.button>
              )}
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
                  {post.comments.length > 0 ? (
                    <ul className="space-y-4">
                      {post.comments.map((comment) => (
                        <motion.li
                          key={comment._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-start space-x-3"
                        >
                          <img
                            src={
                              comment.userId?.profilePicture
                                ? `${BACKEND_URL}${comment.userId.profilePicture}`
                                : '/default-profile.png'
                            }
                            alt={comment.userId?.name || 'Unknown'}
                            className="w-8 h-8 rounded-full object-cover border-2 border-teal-300"
                            onError={(e) => {
                              console.log('Error loading commenter profile picture:', e);
                              e.target.src = '/default-profile.png';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {comment.userId?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">{comment.content}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                            {canDeleteComment(comment.userId) && (
                              <motion.button
                                onClick={() => handleDeleteComment(comment._id)}
                                variants={buttonVariants}
                                initial="rest"
                                whileHover="hover"
                                className="text-red-600 hover:text-red-700 transition-colors duration-200 mt-1 text-sm"
                              >
                                Delete
                              </motion.button>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 text-sm">No comments yet.</p>
                  )}
                  {user && (
                    <form
                      onSubmit={handleComment}
                      className="mt-6 flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 shadow-sm"
                      />
                      <motion.button
                        type="submit"
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 shadow-md"
                      >
                        Comment
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Post;