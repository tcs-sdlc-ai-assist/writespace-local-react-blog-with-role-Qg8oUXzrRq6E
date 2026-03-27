import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext.jsx';
import { getPostById, savePost } from '../utils/storage.js';
import { canEditPost } from '../utils/rbac.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;

export default function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    const post = getPostById(id);

    if (!post) {
      navigate('/blogs', { replace: true });
      return;
    }

    if (!canEditPost(session, post)) {
      navigate('/blogs', { replace: true });
      return;
    }

    setTitle(post.title || '');
    setContent(post.content || '');
    setLoading(false);
  }, [id, isEditMode, session, navigate]);

  function validate() {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.trim().length > TITLE_MAX) {
      errors.title = `Title must be ${TITLE_MAX} characters or less`;
    }

    if (!content.trim()) {
      errors.content = 'Content is required';
    } else if (content.trim().length > CONTENT_MAX) {
      errors.content = `Content must be ${CONTENT_MAX} characters or less`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    if (isEditMode) {
      const existingPost = getPostById(id);

      if (!existingPost) {
        setError('Post not found');
        return;
      }

      if (!canEditPost(session, existingPost)) {
        setError('You do not have permission to edit this post');
        return;
      }

      const updated = {
        ...existingPost,
        title: title.trim(),
        content: content.trim(),
      };

      const saved = savePost(updated);
      if (!saved) {
        setError('Failed to save post. localStorage may be unavailable.');
        return;
      }

      navigate(`/blogs/${id}`, { replace: true });
    } else {
      const newPost = {
        id: uuidv4(),
        title: title.trim(),
        content: content.trim(),
        authorId: session.userId,
        authorName: session.displayName,
        createdAt: Date.now(),
      };

      const saved = savePost(newPost);
      if (!saved) {
        setError('Failed to save post. localStorage may be unavailable.');
        return;
      }

      navigate(`/blogs/${newPost.id}`, { replace: true });
    }
  }

  function handleCancel() {
    navigate(-1);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode
                ? 'Update your post below'
                : 'Share your thoughts with the community'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <span
                    className={`text-xs ${
                      title.length > TITLE_MAX ? 'text-red-600' : 'text-gray-400'
                    }`}
                  >
                    {title.length}/{TITLE_MAX}
                  </span>
                </div>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) {
                      setFieldErrors((prev) => ({ ...prev, title: '' }));
                    }
                    if (error) setError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    fieldErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your post title"
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Content
                  </label>
                  <span
                    className={`text-xs ${
                      content.length > CONTENT_MAX ? 'text-red-600' : 'text-gray-400'
                    }`}
                  >
                    {content.length}/{CONTENT_MAX}
                  </span>
                </div>
                <textarea
                  id="content"
                  rows={12}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (fieldErrors.content) {
                      setFieldErrors((prev) => ({ ...prev, content: '' }));
                    }
                    if (error) setError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-vertical ${
                    fieldErrors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Write your post content here..."
                />
                {fieldErrors.content && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.content}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isEditMode ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}