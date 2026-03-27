import React from 'react';

export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-500 text-white text-sm">
        👑
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm">
      📖
    </span>
  );
}

export default function Avatar({ role }) {
  return getAvatar(role);
}