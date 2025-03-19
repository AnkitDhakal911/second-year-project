// Components/frontend/Context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:8266/api/auth/me', {
          headers: { 'x-auth-token': token },
        });
        setUser(res.data);
      } catch (err) {
        logout();
      }
    };

    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:8266/api/auth/login', { email, password });
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await axios.post('http://localhost:8266/api/auth/signup', { name, email, password });
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.msg || 'Signup failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}