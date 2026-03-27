import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getUsers, saveUser, deleteUser } from '../utils/storage.js';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Avatar from '../components/Avatar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const HARD_CODED_ADMIN_ID = '00000000-0000-0000-0000-000000000001';

export default function UserManagementPage() {
  const { session } = useAuth();

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const allUsers = getUsers();

  const sortedUsers = [...allUsers].sort(
    (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
  );

  function canDeleteUser(user) {
    if (user.id === HARD_CODED_ADMIN_ID) return false;
    if (user.id === session.userId) return false;
    return true;
  }

  function getDeleteTooltip(user) {
    if (user.id === HARD_CODED_ADMIN_ID) return 'Cannot delete the default admin account';
    if (user.id === session.userId) return 'Cannot delete your own account';
    return '';
  }

  function handleDeleteClick(user) {
    setConfirmTarget(user);
  }

  function handleConfirmDelete() {
    if (confirmTarget) {
      deleteUser(confirmTarget.id);
      setConfirmTarget(null);
      setRefreshKey((k) => k + 1);
    }
  }

  function handleCancelDelete() {
    setConfirmTarget(null);
  }

  function validate() {
    const errors = {};

    if (!displayName.trim()) {
      errors.displayName = 'Display name is required';
    } else if (displayName.trim().length > 32) {
      errors.displayName = 'Display name must be 32 characters or less';
    }

    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.trim().length > 24) {
      errors.username = 'Username must be 24 characters or less';
    } else {
      const existing = allUsers.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (existing) {
        errors.username = 'Username already exists';
      }
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleCreateSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    const newUser = {
      id: uuidv4(),
      username: username.trim(),
      displayName: displayName.trim(),
      password: password,
      role: role,
      createdAt: Date.now(),
    };

    const saved = saveUser(newUser);
    if (!saved) {
      setError('Failed to save user. localStorage may be unavailable.');
      return;
    }

    setDisplayName('');
    setUsername('');
    setPassword('');
    setRole('viewer');
    setFieldErrors({});
    setError('');
    setShowCreateForm(false);
    setRefreshKey((k) => k + 1);
  }

  function handleCancelCreate() {
    setDisplayName('');
    setUsername('');
    setPassword('');
    setRole('viewer');
    setFieldErrors({});
    setError('');
    setShowCreateForm(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage all users on the platform
              </p>
            </div>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
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
                Create User
              </button>
            )}
          </div>

          {/* Create User Form */}
          {showCreateForm && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Create New User
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        if (fieldErrors.displayName) {
                          setFieldErrors((prev) => ({ ...prev, displayName: '' }));
                        }
                        if (error) setError('');
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        fieldErrors.displayName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter display name"
                    />
                    {fieldErrors.displayName && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.displayName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (fieldErrors.username) {
                          setFieldErrors((prev) => ({ ...prev, username: '' }));
                        }
                        if (error) setError('');
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        fieldErrors.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Choose a username"
                    />
                    {fieldErrors.username && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: '' }));
                        }
                        if (error) setError('');
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Create a password"
                    />
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelCreate}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table (Desktop) */}
          {sortedUsers.length > 0 ? (
            <>
              <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        User
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Username
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Role
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Created
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar role={user.role} />
                            <span className="text-sm font-medium text-gray-900">
                              {user.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {user.username}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.role === 'admin' ? 'Admin' : 'Viewer'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block group">
                            <button
                              onClick={() => handleDeleteClick(user)}
                              disabled={!canDeleteUser(user)}
                              className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                                canDeleteUser(user)
                                  ? 'text-gray-500 hover:text-red-600'
                                  : 'text-gray-300 cursor-not-allowed'
                              }`}
                              aria-label="Delete user"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                            {!canDeleteUser(user) && (
                              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {getDeleteTooltip(user)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Users Cards (Mobile) */}
              <div className="md:hidden space-y-4">
                {sortedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar role={user.role} />
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {user.displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'Viewer'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Joined {formatDate(user.createdAt)}
                      </span>
                      <div className="relative inline-block group">
                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={!canDeleteUser(user)}
                          className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                            canDeleteUser(user)
                              ? 'text-gray-500 hover:text-red-600'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          aria-label="Delete user"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                        {!canDeleteUser(user) && (
                          <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {getDeleteTooltip(user)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No users found</p>
              <p className="text-gray-400 text-sm mb-6">
                Create the first user for your platform!
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First User
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmTarget && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete "${confirmTarget.displayName}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      <Footer />
    </div>
  );
}