import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    console.log('Form data being sent:', formData); // Debug log
    try {
      const response = await axios.post('http://localhost:8266/api/auth/signup', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Signup response:', response.data); // Debug log
      // Store the token in localStorage (since /api/auth/signup returns a token)
      localStorage.setItem('token', response.data.token);
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err.response?.data); // Debug log
      setError(err.response?.data?.msg || 'Error signing up');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-orange-700 text-white py-2 px-4 rounded hover:bg-orange-800"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;