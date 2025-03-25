import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Logo from '../assets/logo.png';
import { motion } from 'framer-motion';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Backend base URL
  const BACKEND_URL = 'http://localhost:8266';

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="shadow sticky z-50 top-0">
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={navVariants}
          className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl"
        >
          {/* Logo, Profile Picture, and Welcome Message */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <img src={Logo} alt="Logo" className="mr-3 h-12" />
            </Link>
            {user && (
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <motion.img
                    src={
                      user.profilePicture
                        ? `${BACKEND_URL}${user.profilePicture}`
                        : '/default-profile.png'
                    }
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-teal-300"
                    onError={(e) => {
                      console.log('Error loading user profile picture:', e);
                      e.target.src = '/default-profile.png';
                    }}
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                  />
                </Link>
                <span className="text-gray-700 font-medium hidden sm:block">
                  Welcome, {user.name}
                </span>
              </div>
            )}
          </div>

          {/* Right Side: Search and Buttons */}
          <div className="flex items-center lg:order-2 space-x-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 px-4 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 shadow-sm"
              />
              <motion.button
                type="submit"
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                className="bg-blue-500 text-white py-2 px-3 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-md"
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
            </form>

            {/* Logout/Login/Signup Buttons */}
            {user ? (
              <motion.button
                onClick={handleLogout}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 focus:outline-none shadow-md"
              >
                Logout
              </motion.button>
            ) : (
              <>
                <motion.div variants={buttonVariants} initial="rest" whileHover="hover">
                  <NavLink
                    to="login"
                    className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none shadow-md"
                  >
                    Log in
                  </NavLink>
                </motion.div>
                <motion.div variants={buttonVariants} initial="rest" whileHover="hover">
                  <NavLink
                    to="signup"
                    className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 focus:outline-none shadow-md"
                  >
                    Sign Up
                  </NavLink>
                </motion.div>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={toggleMenu}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div
            className={`${isOpen ? 'block' : 'hidden'} justify-between items-center w-full lg:flex lg:w-auto lg:order-1`}
            id="mobile-menu-2"
          >
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              <motion.li variants={navVariants}>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-teal-600' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-teal-600 lg:p-0`
                  }
                >
                  Home
                </NavLink>
              </motion.li>
              <motion.li variants={navVariants}>
                <NavLink
                  to="about"
                  className={({ isActive }) =>
                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-teal-600' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-teal-600 lg:p-0`
                  }
                >
                  About
                </NavLink>
              </motion.li>
              <motion.li variants={navVariants}>
                <NavLink
                  to="contact"
                  className={({ isActive }) =>
                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-teal-600' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-teal-600 lg:p-0`
                  }
                >
                  Contact
                </NavLink>
              </motion.li>
              {user && (
                <>
                  <motion.li variants={navVariants}>
                    <NavLink
                      to="profile"
                      className={({ isActive }) =>
                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-teal-600' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-teal-600 lg:p-0`
                      }
                    >
                      Profile
                    </NavLink>
                  </motion.li>
                  {(user.role === 'editor' || user.role === 'admin') && (
                    <motion.li variants={navVariants}>
                      <NavLink
                        to="create-post"
                        className={({ isActive }) =>
                          `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-teal-600' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-teal-600 lg:p-0`
                        }
                      >
                        Create Post
                      </NavLink>
                    </motion.li>
                  )}
                  {user.role === 'admin' && (
                    <motion.li variants={navVariants}>
                      <NavLink
                        to="admin"
                        className={({ isActive }) =>
                          `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-teal-600' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-teal-600 lg:p-0`
                        }
                      >
                        Admin Dashboard
                      </NavLink>
                    </motion.li>
                  )}
                </>
              )}
            </ul>
          </div>
        </motion.div>
      </nav>
    </header>
  );
}

export default Header;