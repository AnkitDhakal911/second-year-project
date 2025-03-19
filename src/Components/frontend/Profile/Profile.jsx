import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const { user, setUser, token, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || ''
  });
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch user suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        console.log('Token being used for suggestions:', token);
        const res = await axios.get('http://localhost:8266/api/users/suggestions', {
          headers: { 'x-auth-token': token }
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
  }, [token]);

  // Fetch the current user's updated data after follow/unfollow
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`http://localhost:8266/api/users/${user._id}`, {
        headers: { 'x-auth-token': token }
      });
      console.log('Fetched user data:', res.data);
      console.log('Updated following array:', res.data.following);
      setUser(res.data);
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
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:8266/api/users/${user._id}`, formData, {
        headers: { 'x-auth-token': token }
      });
      console.log('Profile update response:', res.data);
      setUser(res.data);
      setError('');
    } catch (err) {
      console.error('Update profile error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error updating profile');
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
      const res = await axios.get(`http://localhost:8266/api/users/search?query=${searchQuery}`, {
        headers: { 'x-auth-token': token }
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
      await axios.post(`http://localhost:8266/api/users/follow/${userId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      // Update suggestions and search results
      setSuggestions(suggestions.filter(s => s._id !== userId));
      setSearchResults(searchResults.map(r => 
        r._id === userId ? { ...r, isFollowing: true } : r
      ));
      // Fetch the updated user data from the backend
      await fetchCurrentUser();
    } catch (err) {
      console.error('Error following user:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error following user. Please try again.');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.post(`http://localhost:8266/api/users/unfollow/${userId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      // Update search results
      setSearchResults(searchResults.map(r => 
        r._id === userId ? { ...r, isFollowing: false } : r
      ));
      // Fetch the updated user data from the backend
      const updatedUser = await fetchCurrentUser();
      if (updatedUser) {
        console.log('After unfollow, user.following:', updatedUser.following);
      }
      // Fetch updated suggestions
      const res = await axios.get('http://localhost:8266/api/users/suggestions', {
        headers: { 'x-auth-token': token }
      });
      setSuggestions(res.data);
    } catch (err) {
      console.error('Error unfollowing user:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error unfollowing user. Please try again.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Display */}
        <div className="flex-1">
          <img
            src={user.profilePicture || '/default-profile.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Bio:</strong> {user.bio || 'No bio set'}</p>
          <p><strong>Followers:</strong> {Array.isArray(user.followers) ? user.followers.length : 0}</p>
          <p><strong>Following:</strong> {Array.isArray(user.following) ? user.following.length : 0}</p>
          {/* Followers List */}
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Followers</h2>
            <ul className="list-disc pl-5">
              {Array.isArray(user.followers) && user.followers.length > 0 ? (
                user.followers.map(follower => (
                  <li key={follower._id}>
                    <Link to={`/user/${follower._id}`} className="text-blue-500 hover:underline">
                      {follower.name}
                    </Link>
                  </li>
                ))
              ) : (
                <p>No followers yet</p>
              )}
            </ul>
          </div>
          {/* Following List */}
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Following</h2>
            <ul className="list-disc pl-5">
              {user.following && user.following.length > 0 ? (
                user.following.map(following => (
                  <li key={following._id}>
                    <Link to={`/user/${following._id}`} className="text-blue-500 hover:underline">
                      {following.name}
                    </Link>
                  </li>
                ))
              ) : (
                <p>Not following anyone</p>
              )}
            </ul>
          </div>
          {/* Who to Follow Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Who to Follow</h2>
              <div className="flex items-center gap-2">
                {isSearching && (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="py-1 px-2 rounded-l border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-orange-700 text-white py-1 px-2 rounded-r hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSearch}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </form>
                )}
                {!isSearching && (
                  <button
                    onClick={() => setIsSearching(true)}
                    className="bg-orange-700 text-white py-1 px-2 rounded hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                  </button>
                )}
              </div>
            </div>
            <ul className="space-y-4">
              {(isSearching ? searchResults : suggestions).length > 0 ? (
                (isSearching ? searchResults : suggestions).map(suggestedUser => (
                  <li key={suggestedUser._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={suggestedUser.profilePicture || '/default-profile.png'}
                        alt={suggestedUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <Link to={`/user/${suggestedUser._id}`} className="text-blue-500 hover:underline">
                        {suggestedUser.name}
                      </Link>
                    </div>
                    {user._id !== suggestedUser._id && (
                      <button
                        onClick={() =>
                          suggestedUser.isFollowing
                            ? handleUnfollow(suggestedUser._id)
                            : handleFollow(suggestedUser._id)
                        }
                        className={`py-1 px-3 rounded ${
                          suggestedUser.isFollowing ? 'bg-gray-500' : 'bg-orange-700'
                        } text-white hover:${
                          suggestedUser.isFollowing ? 'bg-gray-600' : 'bg-orange-800'
                        }`}
                      >
                        {suggestedUser.isFollowing ? 'Unfollow' : 'Follow'}
                      </button>
                    )}
                  </li>
                ))
              ) : (
                <p>{isSearching ? 'No users found' : 'No suggestions available'}</p>
              )}
            </ul>
          </div>
        </div>
        {/* Edit Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="4"
              />
            </div>
            <div>
              <label className="block font-medium">Profile Picture URL:</label>
              <input
                type="text"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-700 text-white py-2 px-4 rounded hover:bg-orange-800"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;