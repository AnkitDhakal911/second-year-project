import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function Profile() {
  const { user, setUser, token, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profilePicture || '');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Backend base URL
  const BACKEND_URL = 'http://localhost:8266';

  // Animation variants for fade-in and slide-up effect
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Animation for profile picture hover
  const profilePictureVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  // Animation for buttons and cards
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Keep profilePicturePreview in sync with user.profilePicture
  useEffect(() => {
    if (user?.profilePicture && !profilePictureFile) {
      console.log('User profile picture:', user.profilePicture); // Debug log
      setProfilePicturePreview(user.profilePicture);
    }
  }, [user?.profilePicture, profilePictureFile]);

  // Clean up preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicturePreview);
      }
    };
  }, [profilePicturePreview]);

  // Fetch user suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        console.log('Token being used for suggestions:', token);
        const res = await axios.get(`${BACKEND_URL}/api/users/suggestions`, {
          headers: { 'x-auth-token': token },
        });
        setSuggestions(res.data);
      } catch (err) {
        console.error('Error fetching suggestions:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError('Error fetching suggestions. Please try again.');
        }
      }
    };
    if (token) fetchSuggestions();
  }, [token, navigate]);

  // Fetch the current user's updated data after follow/unfollow or profile update
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users/${user._id}`, {
        headers: { 'x-auth-token': token },
      });
      console.log('Fetched user data:', res.data);
      console.log('Updated following array:', res.data.following);
      setUser(res.data);
      if (!profilePictureFile) {
        setProfilePicturePreview(res.data.profilePicture || '');
      }
      return res.data;
    } catch (err) {
      console.error('Error fetching current user:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      }
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const filetypes = /jpeg|jpg|png/;
      const isValidType = filetypes.test(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) {
        setError('Only JPEG, JPG, and PNG files are allowed!');
        return;
      }
      if (!isValidSize) {
        setError('File size must be less than 5MB!');
        return;
      }
      setError('');
      if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicturePreview);
      }
      setProfilePictureFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
      console.log('Selected file preview URL:', previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      if (profilePictureFile) {
        data.append('profilePicture', profilePictureFile);
      }

      const res = await axios.put(`${BACKEND_URL}/api/users/${user._id}`, data, {
        headers: {
          'x-auth-token': token,
        },
      });
      console.log('Profile update response:', res.data);
      setUser(res.data);
      setError('');
      setProfilePictureFile(null);
      await fetchCurrentUser();
    } catch (err) {
      console.error('Update profile error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error updating profile');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(true);
      return;
    }

    try {
      console.log('Token being used for search:', token);
      const res = await axios.get(`${BACKEND_URL}/api/users/search?query=${searchQuery}`, {
        headers: { 'x-auth-token': token },
      });
      setSearchResults(res.data);
      setIsSearching(true);
    } catch (err) {
      console.error('Error searching users:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Search endpoint not found. Please contact support.');
      } else {
        setError('Error searching users. Please try again.');
      }
      setSearchResults([]);
      setIsSearching(true);
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleFollow = async (userId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/users/follow/${userId}`, {}, {
        headers: { 'x-auth-token': token },
      });
      setSuggestions(suggestions.filter((s) => s._id !== userId));
      setSearchResults(
        searchResults.map((r) => (r._id === userId ? { ...r, isFollowing: true } : r))
      );
      await fetchCurrentUser();
    } catch (err) {
      console.error('Error following user:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error following user. Please try again.');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/users/unfollow/${userId}`, {}, {
        headers: { 'x-auth-token': token },
      });
      setSearchResults(
        searchResults.map((r) => (r._id === userId ? { ...r, isFollowing: false } : r))
      );
      await fetchCurrentUser();
      const res = await axios.get(`${BACKEND_URL}/api/users/suggestions`, {
        headers: { 'x-auth-token': token },
      });
      setSuggestions(res.data);
    } catch (err) {
      console.error('Error unfollowing user:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error unfollowing user. Please try again.');
    }
  };

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
              {user.name}'s Profile
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
              Manage your profile, connect with others, and share your story with the world.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Display */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col items-center">
              <motion.div
                className="relative"
                variants={profilePictureVariants}
                initial="rest"
                whileHover="hover"
              >
                <img
                  src={
                    profilePicturePreview
                      ? profilePicturePreview.startsWith('blob:')
                        ? profilePicturePreview
                        : `${BACKEND_URL}${profilePicturePreview}`
                      : '/default-profile.png'
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-teal-500 shadow-md"
                  onError={(e) => {
                    console.log('Error loading profile picture:', e);
                    console.log('Attempted URL:', profilePicturePreview);
                    e.target.src = '/default-profile.png';
                  }}
                />
                <label className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white p-3 rounded-full cursor-pointer shadow-lg hover:bg-teal-600 transition-all duration-200">
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
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"
                    ></path>
                  </svg>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </motion.div>
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-gray-800">
                  <span className="text-teal-600 font-semibold">Name:</span> {user.name}
                </p>
                <p className="text-gray-600">
                  <span className="text-teal-600 font-semibold">Email:</span> {user.email}
                </p>
                <p className="text-gray-600">
                  <span className="text-teal-600 font-semibold">Bio:</span>{' '}
                  {user.bio || 'No bio set'}
                </p>
                <p className="text-gray-600">
                  <span className="text-teal-600 font-semibold">Followers:</span>{' '}
                  {Array.isArray(user.followers) ? user.followers.length : 0}
                </p>
                <p className="text-gray-600">
                  <span className="text-teal-600 font-semibold">Following:</span>{' '}
                  {Array.isArray(user.following) ? user.following.length : 0}
                </p>
              </div>
            </div>

            {/* Followers List */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="mt-8 bg-gray-50 rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Followers</h2>
              {Array.isArray(user.followers) && user.followers.length > 0 ? (
                <ul className="space-y-4">
                  {user.followers.map((follower) => (
                    <motion.li
                      key={follower._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-3"
                    >
                      <img
                        src={
                          follower.profilePicture
                            ? `${BACKEND_URL}${follower.profilePicture}`
                            : '/default-profile.png'
                        }
                        alt={follower.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-teal-300"
                        onError={(e) => {
                          console.log('Error loading follower profile picture:', e);
                          e.target.src = '/default-profile.png';
                        }}
                      />
                      <Link
                        to={`/user/${follower._id}`}
                        className="text-teal-600 font-medium hover:underline transition-colors duration-200"
                      >
                        {follower.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center">No followers yet</p>
              )}
            </motion.div>

            {/* Following List */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="mt-6 bg-gray-50 rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Following</h2>
              {user.following && user.following.length > 0 ? (
                <ul className="space-y-4">
                  {user.following.map((following) => (
                    <motion.li
                      key={following._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-3"
                    >
                      <img
                        src={
                          following.profilePicture
                            ? `${BACKEND_URL}${following.profilePicture}`
                            : '/default-profile.png'
                        }
                        alt={following.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-teal-300"
                        onError={(e) => {
                          console.log('Error loading following profile picture:', e);
                          e.target.src = '/default-profile.png';
                        }}
                      />
                      <Link
                        to={`/user/${following._id}`}
                        className="text-teal-600 font-medium hover:underline transition-colors duration-200"
                      >
                        {following.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center">Not following anyone</p>
              )}
            </motion.div>
          </motion.div>

          {/* Edit Form and Who to Follow */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl"
          >
            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6 mb-8">
              <div>
                <label className="block font-medium text-gray-700 mb-2">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">Bio:</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  rows="4"
                />
              </div>
              {profilePictureFile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-4"
                >
                  <p className="text-sm text-gray-600 mb-2">Selected Image Preview:</p>
                  <img
                    src={profilePicturePreview}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-teal-300 shadow-sm"
                  />
                </motion.div>
              )}
              <motion.button
                type="submit"
                disabled={isUploading}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                className={`w-full bg-teal-500 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 shadow-md ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? 'Uploading...' : 'Update Profile'}
              </motion.button>
            </form>

            {/* Who to Follow Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Who to Follow</h2>
                <div className="flex items-center gap-2">
                  {isSearching && (
                    <form onSubmit={handleSearch} className="flex items-center">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="py-2 px-4 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 shadow-sm"
                        autoFocus
                      />
                      <motion.button
                        type="submit"
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        className="bg-blue-500 text-white py-2 px-4 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-md"
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          ></path>
                        </svg>
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleCancelSearch}
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        className="ml-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        Cancel
                      </motion.button>
                    </form>
                  )}
                  {!isSearching && (
                    <motion.button
                      onClick={() => setIsSearching(true)}
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      className="bg-blue-500 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-md"
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>
              <ul className="space-y-4">
                {(isSearching ? searchResults : suggestions).length > 0 ? (
                  (isSearching ? searchResults : suggestions).map((suggestedUser) => (
                    <motion.li
                      key={suggestedUser._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            suggestedUser.profilePicture
                              ? `${BACKEND_URL}${suggestedUser.profilePicture}`
                              : '/default-profile.png'
                          }
                          alt={suggestedUser.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-teal-300"
                          onError={(e) => {
                            console.log('Error loading suggested user profile picture:', e);
                            e.target.src = '/default-profile.png';
                          }}
                        />
                        <Link
                          to={`/user/${suggestedUser._id}`}
                          className="text-teal-600 font-medium hover:underline transition-colors duration-200"
                        >
                          {suggestedUser.name}
                        </Link>
                      </div>
                      {user._id !== suggestedUser._id && (
                        <motion.button
                          onClick={() =>
                            suggestedUser.isFollowing
                              ? handleUnfollow(suggestedUser._id)
                              : handleFollow(suggestedUser._id)
                          }
                          variants={buttonVariants}
                          initial="rest"
                          whileHover="hover"
                          className={`py-2 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                            suggestedUser.isFollowing
                              ? 'bg-gray-500 hover:bg-gray-600'
                              : 'bg-teal-500 hover:bg-teal-600'
                          }`}
                        >
                          {suggestedUser.isFollowing ? 'Unfollow' : 'Follow'}
                        </motion.button>
                      )}
                    </motion.li>
                  ))
                ) : (
                  <p className="text-gray-600 text-center">
                    {isSearching ? 'No users found' : 'No suggestions available'}
                  </p>
                )}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Profile;