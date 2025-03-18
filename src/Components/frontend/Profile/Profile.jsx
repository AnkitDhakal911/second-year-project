import React, { useEffect } from 'react';
import { useAuth } from '../Context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user } = useAuth(); // Get the current user from AuthContext
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      navigate('/login'); // Redirect to login page
    }
  }, [user]); // Run this effect whenever the user changes

  if (!user) {
    return null; // Don't render anything if not logged in
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
      <div className="space-y-2">
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        {/* Add more profile details here */}
      </div>
    </div>
  );
}

export default Profile;