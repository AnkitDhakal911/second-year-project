import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function CreatePost() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [],
    status: 'draft',
    publishedDate: '',
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [tagError, setTagError] = useState('');

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
        const [catRes, tagRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/categories`),
          axios.get(`${BACKEND_URL}/api/tags`),
        ]);
        setCategories(catRes.data || []);
        setTags(tagRes.data || []);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        setCategories([]);
        setTags([]);
      }
    };
    fetchData();
  }, [logout, navigate]);

  // Redirect if user is not logged in or is a "reader"
  if (!user || user.role === 'reader') {
    navigate('/');
    return null;
  }

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
      console.error('Error adding category:', err.response?.data || err.message);
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
      console.error('Error adding tag:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setTagError(err.response?.data?.msg || 'Error adding tag');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${BACKEND_URL}/api/posts`, formData, {
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
      setError(err.response?.data?.msg || 'Error creating post');
    }
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
              Create a New Post
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
              Share your thoughts, ideas, and stories with the world.
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

        {/* Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <motion.div variants={inputVariants}>
              <label className="block font-medium text-gray-700 mb-2">Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                required
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
                required
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

            {/* Submit Button */}
            <motion.button
              type="submit"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 shadow-md"
            >
              Create Post
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default CreatePost;