import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

export default function Navbar() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/');
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMobile}>
            <span className="text-xl font-bold text-indigo-600">WriteSpace</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Link
                  to="/blogs"
                  className="text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
                >
                  Blogs
                </Link>
                {session.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 ml-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <Avatar role={session.role} />
                  <span className="text-sm font-medium text-gray-700">
                    {session.displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            {session ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Avatar role={session.role} />
                  <span className="text-sm font-medium text-gray-700">
                    {session.displayName}
                  </span>
                </div>
                <Link
                  to="/blogs"
                  className="block text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
                  onClick={closeMobile}
                >
                  Blogs
                </Link>
                {session.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
                    onClick={closeMobile}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
                  onClick={closeMobile}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={closeMobile}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}