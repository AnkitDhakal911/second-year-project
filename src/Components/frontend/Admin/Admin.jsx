import React, { useEffect } from 'react';
import { useAuth } from '../Context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom';

function Admin() {
  const { user } = useAuth(); // Get the current user from AuthContext
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    // Redirect if user is not an admin
    if (!user || user.role !== 'admin') {
      navigate('/'); // Redirect to home or login page
    }
  }, [user]); // Run this effect whenever the user changes

  if (!user || user.role !== 'admin') {
    return null; // Don't render anything if not an admin
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">User Management</h2>
          {/* Add admin-specific functionality here */}
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Content Moderation</h2>
          {/* Add admin-specific functionality here */}
        </div>
      </div>
    </div>
  );
}

export default Admin;

