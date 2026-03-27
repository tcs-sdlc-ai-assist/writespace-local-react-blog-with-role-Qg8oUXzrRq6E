import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  users: 'ws_users_v1',
  posts: 'ws_posts_v1',
  session: 'ws_session_v1',
};

const HARD_CODED_ADMIN = {
  id: '00000000-0000-0000-0000-000000000001',
  username: 'admin',
  displayName: 'Admin',
  password: 'admin',
  role: 'admin',
  createdAt: Date.now(),
};

function isLocalStorageAvailable() {
  try {
    const testKey = '__ws_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function readKey(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function seedAdmin(users) {
  const hasAdmin = users.some(
    (u) => u.username.toLowerCase() === 'admin'
  );
  if (!hasAdmin) {
    users.push({ ...HARD_CODED_ADMIN, createdAt: Date.now() });
    writeKey(KEYS.users, users);
  }
  return users;
}

// --- Users ---

export function getUsers() {
  if (!isLocalStorageAvailable()) return [];
  let users = readKey(KEYS.users);
  if (!Array.isArray(users)) {
    users = [];
  }
  users = seedAdmin(users);
  return users;
}

export function getUserById(id) {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function getUserByUsername(username) {
  const users = getUsers();
  return (
    users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    ) || null
  );
}

export function saveUser(user) {
  if (!isLocalStorageAvailable()) return false;
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    const newUser = {
      id: user.id || uuidv4(),
      username: user.username,
      displayName: user.displayName,
      password: user.password,
      role: user.role || 'viewer',
      createdAt: user.createdAt || Date.now(),
    };
    users.push(newUser);
  }
  return writeKey(KEYS.users, users);
}

export function deleteUser(id) {
  if (!isLocalStorageAvailable()) return false;
  if (id === HARD_CODED_ADMIN.id) return false;
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  return writeKey(KEYS.users, filtered);
}

// --- Posts ---

export function getPosts() {
  if (!isLocalStorageAvailable()) return [];
  const posts = readKey(KEYS.posts);
  if (!Array.isArray(posts)) {
    writeKey(KEYS.posts, []);
    return [];
  }
  return posts;
}

export function getPostById(id) {
  const posts = getPosts();
  return posts.find((p) => p.id === id) || null;
}

export function savePost(post) {
  if (!isLocalStorageAvailable()) return false;
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === post.id);
  if (index >= 0) {
    posts[index] = { ...posts[index], ...post, updatedAt: Date.now() };
  } else {
    const newPost = {
      id: post.id || uuidv4(),
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.authorName,
      createdAt: post.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    posts.push(newPost);
  }
  return writeKey(KEYS.posts, posts);
}

export function deletePost(id) {
  if (!isLocalStorageAvailable()) return false;
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  return writeKey(KEYS.posts, filtered);
}

// --- Session ---

export function getSession() {
  if (!isLocalStorageAvailable()) return null;
  const session = readKey(KEYS.session);
  if (!session) return null;
  if (session.expiresAt && Date.now() > session.expiresAt) {
    clearSession();
    return null;
  }
  return session;
}

export function setSession(session) {
  if (!isLocalStorageAvailable()) return false;
  const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  const sessionData = {
    userId: session.userId,
    username: session.username,
    role: session.role,
    displayName: session.displayName,
    expiresAt: session.expiresAt || Date.now() + SESSION_DURATION,
  };
  return writeKey(KEYS.session, sessionData);
}

export function clearSession() {
  try {
    localStorage.removeItem(KEYS.session);
    return true;
  } catch {
    return false;
  }
}