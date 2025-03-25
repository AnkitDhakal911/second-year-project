// src/Components/frontend/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

function Home() {
  const { user, token, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [newComments, setNewComments] = useState({});
  const [showComments, setShowComments] = useState({}); // Track which posts' comments are visible

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:8266/api/posts');
        console.log('Fetched posts:', res.data);
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching posts:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          logout();
          window.location.href = '/login';
          return;
        }
        setError('Error fetching posts');
      }
    };
    fetchPosts();
  }, [logout]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8266/api/posts/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setPosts(posts.filter(post => post._id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
        return;
      }
      setError(err.response?.data?.msg || 'Error deleting post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:8266/api/posts/${postId}/like`, {}, {
        headers: { 'x-auth-token': token },
      });
      setPosts(posts.map(post => (post._id === postId ? res.data : post)));
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
        return;
      }
      setError(err.response?.data?.msg || 'Error liking post');
    }
  };

  const handleComment = async (postId, e) => {
    e.preventDefault();
    const content = newComments[postId]?.trim();
    if (!content) return;

    try {
      const res = await axios.post(
        `http://localhost:8266/api/posts/${postId}/comment`,
        { content },
        { headers: { 'x-auth-token': token } }
      );
      setPosts(posts.map(post => (post._id === postId ? res.data : post)));
      setNewComments({ ...newComments, [postId]: '' });
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
        return;
      }
      setError(err.response?.data?.msg || 'Error adding comment');
    }
  };

  const handleCommentChange = (postId, value) => {
    setNewComments({ ...newComments, [postId]: value });
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Blog Posts</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {user && (
          <Link
            to="/create-post"
            className="block w-fit mx-auto bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition mb-8"
          >
            Create New Post
          </Link>
        )}
        {posts.length === 0 ? (
          <p className="text-gray-600 text-center">No posts available.</p>
        ) : (
          posts.map(post => {
            const authorId = typeof post.authorId === 'object' ? post.authorId._id : post.authorId;
            const canEdit = user && ((authorId && authorId.toString() === user.id) || user.role === 'admin');
            const isLiked = user && post.likes.includes(user.id);
            const areCommentsVisible = showComments[post._id] || false;

            return (
              <div
                key={post._id}
                className="bg-white shadow-lg rounded-lg p-6 mb-6 hover:shadow-xl transition"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={post.authorId?.profilePicture || '/default-profile.png'}
                    alt={post.authorId?.name || 'Unknown'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      <Link to={`/post/${post._id}`} className="text-orange-600 hover:underline">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-500">
                      By {post.authorId ? post.authorId.name : 'Unknown'} •{' '}
                      {new Date(post.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  {post.content.substring(0, 100)}...
                  <Link to={`/post/${post._id}`} className="text-orange-600 hover:underline ml-1">
                    Read more
                  </Link>
                </p>
                <div className="text-sm text-gray-600 mb-4">
                  <p>
                    <strong>Category:</strong>{' '}
                    {post.categoryId ? post.categoryId.categoryName : 'Uncategorized'}
                  </p>
                  <p>
                    <strong>Tags:</strong>{' '}
                    {post.tags && Array.isArray(post.tags)
                      ? post.tags.map(tag => tag.tagName).join(', ')
                      : 'No tags'}
                  </p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4 text-gray-600">
                    <span>❤️ {post.likes.length} Likes</span>
                    <button
                      onClick={() => toggleComments(post._id)}
                      className="text-gray-600 hover:underline"
                    >
                      💬 {post.comments.length} Comments{' '}
                      {areCommentsVisible ? '(Hide)' : '(See)'}
                    </button>
                    <span>👀 {post.views} Views</span>
                  </div>
                  {canEdit && (
                    <div className="space-x-2">
                      <Link
                        to={`/post/${post._id}`}
                        className="text-orange-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                {user && (
                  <button
                    onClick={() => handleLike(post._id)}
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
                {areCommentsVisible && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Comments</h3>
                    {post.comments.length > 0 ? (
                      <ul className="space-y-3">
                        {post.comments.map(comment => (
                          <li key={comment._id} className="flex items-start space-x-3">
                            <img
                              src={comment.userId?.profilePicture || '/default-profile.png'}
                              alt={comment.userId?.name || 'Unknown'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {comment.userId?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-600">{comment.content}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 text-sm">No comments yet.</p>
                    )}
                    {user && (
                      <form
                        onSubmit={(e) => handleComment(post._id, e)}
                        className="mt-4 flex items-center space-x-2"
                      >
                        <input
                          type="text"
                          value={newComments[post._id] || ''}
                          onChange={(e) => handleCommentChange(post._id, e.target.value)}
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
            );
          })
        )}
      </main>
    </div>
  );
}

export default Home;