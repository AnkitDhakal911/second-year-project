import React from 'react';
import Logo from '../assets/logo.png';

function Home() {
  return (
    <div className="flex justify-between">
      {/* Main Feed */}
      <main className="w-3/5 p-4">
        <section className="mb-6">
          <h2 className="text-3xl font-bold mb-4">Latest Posts</h2>
          {/* Dummy Blog Post */}
          <div className="border p-4 rounded mb-4">
            <h3 className="text-xl font-semibold mb-2">Blog Post Title</h3>
            <p className="text-gray-700 mb-2">This is a brief description of the blog post. It gives a quick overview of the content...</p>
            <div className="flex items-center justify-between text-gray-500">
              <span>Author: Ankit Dhakal</span>
              <div className="flex space-x-2">
                <button>Like</button>
                <button>Comment</button>
                <button>Share</button>
              </div>
            </div>
          </div>
          {/* Additional blog posts can be added here */}
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="w-2/5 p-4 bg-gray-100">
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">What's Trending</h2>
          <ul>
            <li className="mb-2">#TrendingTopic1</li>
            <li className="mb-2">#TrendingTopic2</li>
            <li className="mb-2">#TrendingTopic3</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Who to Follow</h2>
          <ul>
            <li className="mb-2">User1</li>
            <li className="mb-2">User2</li>
            <li className="mb-2">User3</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Subscribe to Premium</h2>
          <button className="bg-blue-500 text-white py-2 px-4 rounded">Subscribe</button>
        </section>
      </aside>
    </div>
  );
}

export default Home;
