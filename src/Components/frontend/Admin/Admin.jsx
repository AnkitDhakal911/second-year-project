import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  // Animation variants for fade-in effect
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      fetchPosts();
    }
  }, [user, navigate]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:8266/api/posts', {
        headers: { 'x-auth-token': token },
      });
      setPosts(res.data);
    } catch (err) {
      setError('Error fetching posts');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8266/api/posts/${postId}`, {
          headers: { 'x-auth-token': token },
        });
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        setError(err.response?.data?.msg || 'Error deleting post');
      }
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
              Admin Dashboard
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
              Manage posts with ease and maintain control over your platform.
            </p>
          </div>
        </motion.section>

        {/* Post Management Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Post Management</h2>
          {error && (
            <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4">{error}</p>
          )}
          
          {posts.length > 0 ? (
            <ul className="space-y-4">
              {posts.map(post => (
                <li
                  key={post._id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">{post.title}</span>
                    <span className="text-gray-600 text-sm">
                      {post.authorId.name} •{' '}
                      <span
                        className={`${
                          post.status === 'published'
                            ? 'text-green-500'
                            : 'text-yellow-500'
                        } font-semibold`}
                      >
                        {post.status}
                      </span>
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate(`/post/${post._id}`)}
                      className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 shadow-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No posts available</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Admin;