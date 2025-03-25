// src/Components/frontend/Post/Post.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, catRes, tagRes] = await Promise.all([
          axios.get(`http://localhost:8266/api/posts/${id}`),
          axios.get('http://localhost:8266/api/categories'),
          axios.get('http://localhost:8266/api/tags'),
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
          tags: postRes.data.tags?.map(tag => tag._id) || [],
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
      if (err.response?.status === 401) logout();
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
      if (err.response?.status === 401) logout();
      setTagError(err.response?.data?.msg || 'Error adding tag');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const updatedPost = { ...formData };
      const res = await axios.put(`http://localhost:8266/api/posts/${id}`, updatedPost, {
        headers: { 'x-auth-token': token },
      });
      setPost(res.data);
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 401) logout();
      setError(err.response?.data?.msg || 'Error updating post');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8266/api/posts/${id}`, {
        headers: { 'x-auth-token': token },
      });
      navigate('/');
    } catch (err) {
      if (err.response?.status === 401) logout();
      setError(err.response?.data?.msg || 'Error deleting post');
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`http://localhost:8266/api/posts/${id}/like`, {}, {
        headers: { 'x-auth-token': token },
      });
      // Merge the new data with the existing post to preserve populated fields
      setPost(prevPost => ({
        ...prevPost,
        likes: res.data.likes,
      }));
    } catch (err) {
      if (err.response?.status === 401) logout();
      setError(err.response?.data?.msg || 'Error liking post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:8266/api/posts/${id}/comment`,
        { content: comment },
        { headers: { 'x-auth-token': token } }
      );
      // Merge the new comments with the existing post to preserve populated fields
      setPost(prevPost => ({
        ...prevPost,
        comments: res.data.comments,
      }));
      setComment('');
      setShowComments(true);
    } catch (err) {
      if (err.response?.status === 401) logout();
      setError(err.response?.data?.msg || 'Error adding comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(`http://localhost:8266/api/posts/${id}/comment/${commentId}`, {
        headers: { 'x-auth-token': token },
      });
      // Merge the new comments with the existing post to preserve populated fields
      setPost(prevPost => ({
        ...prevPost,
        comments: res.data.comments,
      }));
    } catch (err) {
      if (err.response?.status === 401) logout();
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
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-6">
        {isEditing ? (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Post</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700">Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Content:</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="6"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Category:</label>
                <div className="flex space-x-2">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {categoryError && <p className="text-red-500 mt-2">{categoryError}</p>}
              </div>
              <div>
                <label className="block font-medium text-gray-700">Tags:</label>
                <div className="flex space-x-2">
                  <select
                    name="tags"
                    multiple
                    value={formData.tags}
                    onChange={handleTagChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {tagError && <p className="text-red-500 mt-2">{tagError}</p>}
              </div>
              <div>
                <label className="block font-medium text-gray-700">Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {formData.status === 'scheduled' && (
                <div>
                  <label className="block font-medium text-gray-700">Published Date:</label>
                  <input
                    type="datetime-local"
                    name="publishedDate"
                    value={formData.publishedDate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={post.authorId?.profilePicture || '/default-profile.png'}
                alt={post.authorId?.name || 'Unknown'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
                <p className="text-sm text-gray-500">
                  By {post.authorId?.name || 'Unknown'} •{' '}
                  {new Date(post.createdDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <div className="text-sm text-gray-600 mb-4">
              <p>
                <strong>Category:</strong>{' '}
                {post.categoryId?.categoryName || 'Uncategorized'}
              </p>
              <p>
                <strong>Tags:</strong>{' '}
                {post.tags && Array.isArray(post.tags)
                  ? post.tags.map(tag => tag.tagName).join(', ')
                  : 'No tags'}
              </p>
              <p><strong>Status:</strong> {post.status}</p>
              {post.publishedDate && (
                <p>
                  <strong>Published:</strong>{' '}
                  {new Date(post.publishedDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-4 text-gray-600">
                <span>❤️ {post.likes.length} Likes</span>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-gray-600 hover:underline"
                >
                  💬 {post.comments.length} Comments{' '}
                  {showComments ? '(Hide)' : '(See)'}
                </button>
                <span>👀 {post.views} Views</span>
              </div>
              {canEdit && (
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-orange-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            {user && (
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition ${
                  isLiked
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <span>{isLiked ? 'Unlike' : 'Like'}</span>
                <span>❤️</span>
              </button>
            )}
            {showComments && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Comments</h2>
                {post.comments.length > 0 ? (
                  <ul className="space-y-4">
                    {post.comments.map(comment => (
                      <li key={comment._id} className="flex items-start space-x-3">
                        <img
                          src={comment.userId?.profilePicture || '/default-profile.png'}
                          alt={comment.userId?.name || 'Unknown'}
                          className="w-8 h-8 rounded-full object-cover"
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
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-600 hover:underline mt-1 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm">No comments yet.</p>
                )}
                {user && (
                  <form onSubmit={handleComment} className="mt-4 flex items-center space-x-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition"
                    >
                      Comment
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </main>
    </div>
  );
}

export default Post;