import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function About() {
  // Animation variants for fade-in effect
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-5xl mx-auto">
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
              About Us
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
              Discover a platform where ideas come to life. Share your stories, connect with a community, and inspire others through the power of words.
            </p>
          </div>
        </motion.section>

        {/* Main Content */}
        <div className="space-y-10">
          {/* Introduction */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Our Blogging Platform</h2>
            <p className="text-gray-600 leading-relaxed">
              Our platform is a space where you can create, share, and discover ideas through blog posts. Whether you’re a writer, a reader, or someone who loves engaging with a community, we’ve built this platform to connect people through the power of words.
            </p>
          </motion.section>

          {/* Mission and Vision */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to provide a user-friendly platform for sharing knowledge, stories, and ideas. We aim to foster a community where everyone’s voice can be heard, and where meaningful conversations can take place through comments, likes, and shared interests.
            </p>
          </motion.section>

          {/* About the Creator */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">About the Creator</h2>
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <img
                  src="/default-profile.png"
                  alt="Creator"
                  className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 shadow-md transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <p className="text-gray-600 leading-relaxed">
                  Hi, I’m Ankit, a passionate developer who loves building tools that bring people together. I created this platform to make it easy for anyone to share their thoughts and connect with others who share their interests.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Key Features */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-3">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-teal-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Create and publish blog posts with ease.
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-teal-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Categorize your posts and add tags to reach the right audience.
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-teal-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Engage with the community through comments and likes.
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-teal-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Discover content tailored to your interests.
              </li>
            </ul>
          </motion.section>

          {/* Call to Action */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 text-center"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join Our Community</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Ready to share your ideas with the world? Start creating your first post today and become part of a vibrant community of writers and readers!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-post"
                className="bg-teal-500 text-white py-3 px-6 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 shadow-md"
              >
                Create a Post
              </Link>
              <Link
                to="/"
                className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 shadow-md"
              >
                Learn More
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

export default About;