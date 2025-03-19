import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Search() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

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
      const res = await axios.get(`http://localhost:8266/api/users/search?query=${query}`, {
        headers: { 'x-auth-token': token }
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search Users</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="py-2 px-4 rounded border border-gray-300 w-full md:w-1/2"
        />
        <button
          type="submit"
          className="ml-2 bg-orange-700 text-white py-2 px-4 rounded hover:bg-orange-800"
        >
          Search
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        {results.length > 0 ? (
          <ul className="space-y-4">
            {results.map(user => (
              <li key={user._id} className="flex items-center gap-4">
                <img
                  src={user.profilePicture || '/default-profile.png'}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <Link to={`/user/${user._id}`} className="text-blue-500 hover:underline">
                    {user.name}
                  </Link>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
}

export default Search;