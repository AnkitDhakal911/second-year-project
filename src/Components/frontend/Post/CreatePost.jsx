import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          axios.get('http://localhost:8266/api/categories'),
          axios.get('http://localhost:8266/api/tags'),
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
    const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
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
        'http://localhost:8266/api/categories',
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
        'http://localhost:8266/api/tags',
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
      await axios.post('http://localhost:8266/api/posts', formData, {
        headers: { 'x-auth-token': token },
      });
      navigate('/');
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Content:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="6"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Category:</label>
          <div className="flex space-x-2">
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add new category"
                className="p-2 border rounded"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
          {categoryError && <p className="text-red-500 mt-2">{categoryError}</p>}
        </div>
        <div>
          <label className="block font-medium">Tags:</label>
          <div className="flex space-x-2">
            <select
              name="tags"
              multiple
              value={formData.tags}
              onChange={handleTagChange}
              className="w-full p-2 border rounded"
            >
              {tags.map(tag => (
                <option key={tag._id} value={tag._id}>
                  {tag.tagName}
                </option>
              ))}
            </select>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
                className="p-2 border rounded"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
          {tagError && <p className="text-red-500 mt-2">{tagError}</p>}
        </div>
        <div>
          <label className="block font-medium">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        {formData.status === 'scheduled' && (
          <div>
            <label className="block font-medium">Published Date:</label>
            <input
              type="datetime-local"
              name="publishedDate"
              value={formData.publishedDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        <button
          type="submit"
          className="bg-orange-700 text-white py-2 px-4 rounded hover:bg-orange-800"
        >
          Create Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost;