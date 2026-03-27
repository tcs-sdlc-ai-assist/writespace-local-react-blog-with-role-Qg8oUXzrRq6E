export function requireRole(session, role) {
  if (!session || !session.role) return false;
  if (role === 'viewer') return true;
  return session.role === role;
}

export function canEditPost(session, post) {
  if (!session || !post) return false;
  if (session.role === 'admin') return true;
  return session.userId === post.authorId;
}