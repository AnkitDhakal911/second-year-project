import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function Search() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  // Backend base URL
  const BACKEND_URL = 'http://localhost:8266';

  // Animation variants
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

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('query') || '';
    setQuery(searchQuery);
    if (searchQuery) {
      handleSearch({ preventDefault: () => {} }); // Trigger search on mount
    }
  }, [location.search]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await axios.get(`${BACKEND_URL}/api/users/search?query=${query}`, {
        headers: { 'x-auth-token': token },
      });
      setResults(res.data);
      setError('');
      navigate(`/search?query=${encodeURIComponent(query)}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Error searching users');
      setResults([]);
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
              Search Users
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
              Find users by their name or email
            </p>
          </div>
        </motion.section>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearch}
          className="mb-10 flex flex-col sm:flex-row sm:items-center sm:space-x-4"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <motion.input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
            variants={inputVariants}
          />
          <motion.button
            type="submit"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            className="mt-4 sm:mt-0 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-md"
          >
            Search
          </motion.button>
        </motion.form>

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

        {/* Search Results */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl"
        >
          {results.length > 0 ? (
            <ul className="space-y-6">
              {results.map((user) => (
                <motion.li
                  key={user._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200"
                >
                  <img
                    src={
                      user.profilePicture
                        ? `${BACKEND_URL}${user.profilePicture}`
                        : '/default-profile.png'
                    }
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-300"
                    onError={(e) => {
                      console.log('Error loading user profile picture:', e);
                      e.target.src = '/default-profile.png';
                    }}
                  />
                  <div>
                    <Link
                      to={`/user/${user._id}`}
                      className="text-teal-600 font-semibold hover:underline"
                    >
                      {user.name}
                    </Link>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center">No users found</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Search;