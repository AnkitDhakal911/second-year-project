import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function User() {
  const { token, loading, user: currentUser } = useAuth(); // Renamed user to currentUser to match naming
  const navigate = useNavigate();
  const { userid } = useParams(); // Changed from id to userid to match the route parameter
  const [user, setUser] = useState(null); // Changed userProfile to user to match component naming
  const [error, setError] = useState('');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const BACKEND_URL = 'http://localhost:8266';

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const fetchUser = async () => {
    if (!token) {
      console.log('No token found, redirecting to login');
      setError('Please log in to view this profile.');
      navigate('/login');
      return;
    }

    console.log('Token being used:', token);

    try {
      // Fetch the user's profile data
      const userRes = await axios.get(`${BACKEND_URL}/api/users/${userid}`, {
        headers: { 'x-auth-token': token },
      });
      console.log('Fetched user profile:', userRes.data);
      setUser(userRes.data);
      setFollowers(userRes.data.followers || []);
      setFollowing(userRes.data.following || []);

      // Fetch isFollowing status
      try {
        const isFollowingRes = await axios.get(`${BACKEND_URL}/api/users/isFollowing/${userid}`, {
          headers: { 'x-auth-token': token },
        });
        console.log('Is following:', isFollowingRes.data);
        setIsFollowing(isFollowingRes.data.isFollowing);
      } catch (isFollowingErr) {
        console.error('Error fetching isFollowing:', isFollowingErr.response?.data || isFollowingErr.message);
        if (isFollowingErr.response?.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
          return;
        }
        // Default to false if the request fails
        setIsFollowing(false);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching user profile:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        console.log('401 Unauthorized error, redirecting to login');
        setError('Session expired. Please log in again.');
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else if (err.response?.status === 404) {
        setError('User not found.');
      } else {
        setError('Error fetching user profile. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchUser();
    }
  }, [token, userid, navigate, loading]); // Updated dependency from id to userid

  const handleFollow = async () => {
    if (!token || !currentUser) {
      setError('Please log in to follow this user.');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/users/follow/${userid}`, {}, {
        headers: { 'x-auth-token': token },
      });
      setIsFollowing(true);
      // Add the logged-in user to the followers list
      setFollowers((prev) => [...prev, { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture }]);
      // Refresh the user profile to ensure consistency
      await fetchUser();
    } catch (err) {
      console.error('Error following user:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else {
        setError('Error following user. Please try again.');
      }
    }
  };

  const handleUnfollow = async () => {
    if (!token || !currentUser) {
      setError('Please log in to unfollow this user.');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/users/unfollow/${userid}`, {}, {
        headers: { 'x-auth-token': token },
      });
      setIsFollowing(false);
      // Remove the logged-in user from the followers list
      setFollowers((prev) => prev.filter((follower) => follower._id !== currentUser._id));
      // Refresh the user profile to ensure consistency
      await fetchUser();
    } catch (err) {
      console.error('Error unfollowing user:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else {
        setError('Error unfollowing user. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">{error || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
              Discover more about {user.name}
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

        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <motion.img
              src={
                user.profilePicture
                  ? `${BACKEND_URL}${user.profilePicture}`
                  : '/default-profile.png'
              }
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-teal-300 shadow-md"
              onError={(e) => {
                console.log('Error loading user profile picture:', e);
                console.log('Attempted URL:', `${BACKEND_URL}${user.profilePicture}`);
                e.target.src = '/default-profile.png';
                e.target.alt = 'Failed to load profile picture';
              }}
              variants={cardVariants}
            />

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
              <p className="text-gray-600 mt-2">
                <span className="font-medium text-teal-600">Bio:</span>{' '}
                {user.bio || 'No bio set'}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div>
                  <span className="font-medium text-teal-600">Followers:</span>{' '}
                  {followers.length}
                </div>
                <div>
                  <span className="font-medium text-teal-600">Following:</span>{' '}
                  {following.length}
                </div>
              </div>

              <motion.div
                className="mt-6"
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
              >
                {currentUser._id !== userid && ( // Only show the follow/unfollow button if the user is not viewing their own profile
                  <button
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    className={`py-2 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                      isFollowing
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </motion.div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="bg-gray-50 rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Followers</h3>
              {followers.length > 0 ? (
                <ul className="space-y-4">
                  {followers.map((follower) => (
                    <motion.li
                      key={follower._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-4"
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
                          e.target.alt = 'Failed to load profile picture';
                        }}
                      />
                      <Link
                        to={`/user/${follower._id}`}
                        className="text-teal-600 font-medium hover:underline"
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

            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="bg-gray-50 rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Following</h3>
              {following.length > 0 ? (
                <ul className="space-y-4">
                  {following.map((followed) => (
                    <motion.li
                      key={followed._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-4"
                    >
                      <img
                        src={
                          followed.profilePicture
                            ? `${BACKEND_URL}${followed.profilePicture}`
                            : '/default-profile.png'
                        }
                        alt={followed.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-teal-300"
                        onError={(e) => {
                          console.log('Error loading following profile picture:', e);
                          e.target.src = '/default-profile.png';
                          e.target.alt = 'Failed to load profile picture';
                        }}
                      />
                      <Link
                        to={`/user/${followed._id}`}
                        className="text-teal-600 font-medium hover:underline"
                      >
                        {followed.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center">Not following anyone yet</p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default User;