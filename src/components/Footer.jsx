import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-600">WriteSpace</span>
            <span className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} WriteSpace. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/blogs"
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Blogs
            </Link>
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}