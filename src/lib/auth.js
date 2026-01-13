/**
 * Authentication utilities
 * JWT-based session management with cookie storage
 */
import bcrypt from 'bcrypt';
import { db } from './db.js';

const SALT_ROUNDS = 10;
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Generate random session ID
 */
function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Create new session for user
 */
export function createSession(userId) {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();

  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `);

  stmt.run(sessionId, userId, expiresAt);

  return { sessionId, expiresAt };
}

/**
 * Get user from session ID
 */
export function getUserFromSession(sessionId) {
  if (!sessionId) return null;

  const stmt = db.prepare(`
    SELECT users.id, users.username, users.savings, users.retirement_savings
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ?
      AND sessions.expires_at > datetime('now')
  `);

  return stmt.get(sessionId);
}

/**
 * Delete session (logout)
 */
export function deleteSession(sessionId) {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(sessionId);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions() {
  const stmt = db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')");
  const result = stmt.run();
  if (result.changes > 0) {
    console.log(`🧹 Cleaned up ${result.changes} expired sessions`);
  }
}

/**
 * Register new user
 */
export async function registerUser(username, password) {
  const passwordHash = await hashPassword(password);

  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash)
    VALUES (?, ?)
  `);

  try {
    const result = stmt.run(username, passwordHash);
    return { id: result.lastInsertRowid, username };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Username already exists');
    }
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(username, password) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash
    FROM users
    WHERE username = ?
  `);

  const user = stmt.get(username);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return { id: user.id, username: user.username };
}

// Run cleanup every 6 hours
setInterval(cleanupExpiredSessions, 6 * 60 * 60 * 1000);
