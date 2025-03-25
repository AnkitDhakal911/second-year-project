import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

function Contact() {
  // Animation variants for fade-in effect
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
              We’d love to hear from you! Fill out the form below to start a conversation with us.
            </p>
          </div>
        </motion.section>

        {/* Contact Information and Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Details</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Reach out to us using the information below or fill out the form to send us a message directly.
            </p>

            <div className="space-y-6">
              <div className="flex items-center text-gray-600 group">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-teal-500 group-hover:text-teal-600 transition-colors duration-200"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="ml-4 text-md tracking-wide font-semibold text-gray-700">
                  Acme Inc, Street, State, Postal Code
                </div>
              </div>

              <div className="flex items-center text-gray-600 group">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-teal-500 group-hover:text-teal-600 transition-colors duration-200"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div className="ml-4 text-md tracking-wide font-semibold text-gray-700">
                  +44 1234567890
                </div>
              </div>

              <div className="flex items-center text-gray-600 group">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-teal-500 group-hover:text-teal-600 transition-colors duration-200"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div className="ml-4 text-md tracking-wide font-semibold text-gray-700">
                  info@acme.org
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <form className="space-y-6">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Full Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="tel" className="text-gray-700 font-medium mb-2">
                  Telephone Number
                </label>
                <input
                  type="tel"
                  name="tel"
                  id="tel"
                  placeholder="Telephone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 text-white py-3 px-6 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 shadow-md"
              >
                Submit
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Contact;