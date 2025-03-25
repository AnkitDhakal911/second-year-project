import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

function Home() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [newComments, setNewComments] = useState({});
  const [showComments, setShowComments] = useState({});

  // Backend base URL
  const BACKEND_URL = 'http://localhost:8266';

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/posts`);
      console.log('Fetched posts in Home.jsx:', res.data);
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching posts in Home.jsx:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
        return;
      }
      setError('Error fetching posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [logout, location.state]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/posts/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setPosts(posts.filter((post) => post._id !== id));
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
      const res = await axios.post(
        `${BACKEND_URL}/api/posts/${postId}/like`,
        {},
        {
          headers: { 'x-auth-token': token },
        }
      );
      setPosts(posts.map((post) => (post._id === postId ? res.data : post)));
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
        `${BACKEND_URL}/api/posts/${postId}/comment`,
        { content },
        { headers: { 'x-auth-token': token } }
      );
      setPosts(posts.map((post) => (post._id === postId ? res.data : post)));
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
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-5xl mx-auto">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="relative bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl shadow-lg p-8 mb-10 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-opacity-20 bg-black"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
              Blog Posts
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
              Discover and share stories from our community.
            </p>
          </div>
        </motion.section>

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

        {user && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="text-center mb-8"
          >
            <Link
              to="/create-post"
              className="inline-block bg-teal-500 text-white py-3 px-6 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 shadow-md"
            >
              Create New Post
            </Link>
          </motion.div>
        )}

        {posts.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-gray-500 text-center"
          >
            No posts available.
          </motion.p>
        ) : (
          posts.map((post, index) => {
            const authorId =
              typeof post.authorId === 'object' ? post.authorId._id : post.authorId;
            const canEdit =
              user && ((authorId && authorId.toString() === user.id) || user.role === 'admin');
            const isLiked = user && post.likes.includes(user.id);
            const areCommentsVisible = showComments[post._id] || false;

            // Add debugging log for each post's author data
            console.log(`Post ${post._id} author data:`, post.authorId);

            return (
              <motion.div
                key={post._id}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={
                      post.authorId?.profilePicture
                        ? `${BACKEND_URL}${post.authorId.profilePicture}`
                        : '/default-profile.png'
                    }
                    alt={post.authorId?.name || 'Unknown'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-300"
                    onError={(e) => {
                      console.log('Error loading author profile picture:', e);
                      e.target.src = '/default-profile.png';
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      <Link
                        to={`/post/${post._id}`}
                        className="text-teal-500 hover:text-teal-700 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-500">
                      By {post.authorId?.name || 'Unknown Author'} •{' '}
                      {new Date(post.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  {post.content.substring(0, 100)}...
                  <Link
                    to={`/post/${post._id}`}
                    className="text-teal-500 hover:text-teal-700 transition-colors duration-200 ml-1"
                  >
                    Read more
                  </Link>
                </p>
                <div className="text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-semibold text-teal-600">Category:</span>{' '}
                    {post.categoryId ? post.categoryId.categoryName : 'Uncategorized'}
                  </p>
                  <p>
                    <span className="font-semibold text-teal-600">Tags:</span>{' '}
                    {post.tags && Array.isArray(post.tags)
                      ? post.tags.map((tag) => tag.tagName).join(', ')
                      : 'No tags'}
                  </p>
                </div>
                <div className="flex items-center justify-between mb-4">
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
                      onClick={() => toggleComments(post._id)}
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
                      {post.comments.length} Comments {areCommentsVisible ? '(Hide)' : '(See)'}
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
                    <div className="space-x-2">
                      <Link
                        to={`/post/${post._id}`}
                        className="text-teal-500 hover:text-teal-700 transition-colors duration-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-500 hover:text-red-600 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                {user && (
                  <motion.button
                    onClick={() => handleLike(post._id)}
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
                {areCommentsVisible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Comments</h3>
                    {post.comments.length > 0 ? (
                      <ul className="space-y-3">
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
                              onError={(e) => (e.target.src = '/default-profile.png')}
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
                          </motion.li>
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
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 shadow-sm"
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
              </motion.div>
            );
          })
        )}
      </main>
    </div>
  );
}

export default Home;