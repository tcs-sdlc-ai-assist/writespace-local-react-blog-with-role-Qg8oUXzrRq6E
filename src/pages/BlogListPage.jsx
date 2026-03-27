import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getPosts } from '../utils/storage.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import BlogCard from '../components/BlogCard.jsx';

export default function BlogListPage() {
  const { session } = useAuth();

  const allPosts = getPosts();
  const sortedPosts = [...allPosts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
              <p className="text-sm text-gray-600 mt-1">
                Browse the latest posts from the community
              </p>
            </div>
            {session && (
              <Link
                to="/blogs/new"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Post
              </Link>
            )}
          </div>

          {sortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No posts yet</p>
              <p className="text-gray-400 text-sm mb-6">
                Be the first to share something with the community!
              </p>
              {session && (
                <Link
                  to="/blogs/new"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Your First Post
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}