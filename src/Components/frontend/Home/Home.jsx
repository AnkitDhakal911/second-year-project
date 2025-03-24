import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

function Home() {
  const { user, token, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:8266/api/posts');
        console.log('Fetched posts:', res.data); // Debug: Log the API response
        setPosts(Array.isArray(res.data) ? res.data : []); // Ensure posts is an array
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user && (
        <Link
          to="/create-post"
          className="bg-orange-700 text-white py-2 px-4 rounded hover:bg-orange-800 mb-4 inline-block"
        >
          Create New Post
        </Link>
      )}
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map(post => {
          // Check if post.authorId exists before accessing its properties
          const canEdit = user && post.authorId && (post.authorId._id === user.id || user.role === 'admin');
          return (
            <div key={post._id} className="mb-6 p-4 border rounded">
              <h2 className="text-2xl font-semibold">
                <Link to={`/posts/${post._id}`} className="text-orange-700 hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-700">{post.content.substring(0, 100)}...</p>
              <p><strong>Author:</strong> {post.authorId ? post.authorId.name : 'Unknown'}</p>
              <p><strong>Category:</strong> {post.categoryId ? post.categoryId.categoryName : 'Uncategorized'}</p>
              <p><strong>Tags:</strong> {post.tags && Array.isArray(post.tags) ? post.tags.map(tag => tag.tagName).join(', ') : 'No tags'}</p>
              <p><strong>Created:</strong> {new Date(post.createdDate).toLocaleDateString()}</p>
              {canEdit && (
                <div className="mt-2">
                  <Link
                    to={`/posts/${post._id}`}
                    className="text-orange-700 hover:underline mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Home;