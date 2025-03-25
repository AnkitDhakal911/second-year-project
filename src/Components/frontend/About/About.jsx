// src/Components/frontend/About/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">About Us</h1>

          {/* Introduction */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Our Blogging Platform</h2>
            <p className="text-gray-700">
              Our platform is a space where you can create, share, and discover ideas through blog posts. Whether you’re a writer, a reader, or someone who loves engaging with a community, we’ve built this platform to connect people through the power of words.
            </p>
          </section>

          {/* Mission and Vision */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Our Mission</h2>
            <p className="text-gray-700">
              Our mission is to provide a user-friendly platform for sharing knowledge, stories, and ideas. We aim to foster a community where everyone’s voice can be heard, and where meaningful conversations can take place through comments, likes, and shared interests.
            </p>
          </section>

          {/* About the Creator */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">About the Creator</h2>
            <div className="flex items-center space-x-4">
              <img
                src="/default-profile.png"
                alt="Creator"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-gray-700">
                  Hi, I’m Ankit, a passionate developer who loves building tools that bring people together. I created this platform to make it easy for anyone to share their thoughts and connect with others who share their interests.
                </p>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Create and publish blog posts with ease.</li>
              <li>Categorize your posts and add tags to reach the right audience.</li>
              <li>Engage with the community through comments and likes.</li>
              <li>Discover content tailored to your interests.</li>
            </ul>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Join Our Community</h2>
            <p className="text-gray-700 mb-4">
              Ready to share your ideas with the world? Start creating your first post today!
            </p>
            <Link
              to="/create-post"
              className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition"
            >
              Create a Post
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

export default About;