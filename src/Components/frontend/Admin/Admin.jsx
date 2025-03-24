import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Post Management</h2>
          {posts.length > 0 ? (
            <ul className="space-y-2">
              {posts.map(post => (
                <li key={post._id} className="flex justify-between items-center">
                  <span>{post.title} - {post.authorId.name} ({post.status})</span>
                  <div>
                    <button
                      onClick={() => navigate(`/post/${post._id}`)}
                      className="bg-orange-700 text-white py-1 px-3 rounded hover:bg-orange-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="bg-red-700 text-white py-1 px-3 rounded hover:bg-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;