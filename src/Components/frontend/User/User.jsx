import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

function User() {
  const { userid } = useParams();
  const { user: currentUser, token } = useAuth();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8266/api/users/${userid}`, {
          headers: { 'x-auth-token': token }
        });
        setUser(res.data);
        setIsFollowing(res.data.followers.some(f => f._id === currentUser._id));
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    if (currentUser) fetchUser();
  }, [userid, token, currentUser]);

  const handleFollow = async () => {
    try {
      await axios.post(`http://localhost:8266/api/users/follow/${userid}`, {}, {
        headers: { 'x-auth-token': token }
      });
      setIsFollowing(true);
      setUser(prev => ({ ...prev, followers: [...prev.followers, { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture }] }));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`http://localhost:8266/api/users/unfollow/${userid}`, {}, {
        headers: { 'x-auth-token': token }
      });
      setIsFollowing(false);
      setUser(prev => ({ ...prev, followers: prev.followers.filter(f => f._id !== currentUser._id) }));
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{user.name}'s Profile</h1>
      <div className="flex flex-col gap-4">
        <img
          src={user.profilePicture || '/default-profile.png'}
          alt={user.name}
          className="w-32 h-32 rounded-full object-cover"
        />
        <p><strong>Bio:</strong> {user.bio || 'No bio set'}</p>
        <p><strong>Followers:</strong> {user.followers.length}</p>
        <p><strong>Following:</strong> {user.following.length}</p>
        {currentUser._id !== userid && (
          <button
            onClick={isFollowing ? handleUnfollow : handleFollow}
            className={`py-2 px-4 rounded ${isFollowing ? 'bg-gray-500' : 'bg-orange-700'} text-white hover:${isFollowing ? 'bg-gray-600' : 'bg-orange-800'}`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
        {/* Optional: List followers and following */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Followers</h2>
          <ul className="list-disc pl-5">
            {user.followers.map(follower => (
              <li key={follower._id}>
                <Link to={`/user/${follower._id}`} className="text-blue-500 hover:underline">
                  {follower.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Following</h2>
          <ul className="list-disc pl-5">
            {user.following.map(following => (
              <li key={following._id}>
                <Link to={`/user/${following._id}`} className="text-blue-500 hover:underline">
                  {following.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default User;