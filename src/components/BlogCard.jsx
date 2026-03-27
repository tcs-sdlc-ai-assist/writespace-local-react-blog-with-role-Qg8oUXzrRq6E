import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { canEditPost } from '../utils/rbac.js';
import Avatar from './Avatar.jsx';

function truncate(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogCard({ post }) {
  const { session } = useAuth();

  const showEdit = canEditPost(session, post);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar role={post.authorId === '00000000-0000-0000-0000-000000000001' ? 'admin' : 'viewer'} />
            <span className="text-sm font-medium text-gray-700">
              {post.authorName || 'Unknown'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(post.createdAt)}
          </span>
        </div>

        <Link to={`/blogs/${post.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors mb-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-4">
          {truncate(post.content)}
        </p>

        <div className="flex items-center justify-between">
          <Link
            to={`/blogs/${post.id}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Read more →
          </Link>

          {showEdit && (
            <Link
              to={`/blogs/${post.id}/edit`}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              aria-label="Edit post"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}