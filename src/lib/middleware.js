/**
 * Authentication middleware helper
 * Extract user from session cookie
 */
import { getUserFromSession } from './auth.js';

export async function requireAuth(cookies) {
  const sessionId = cookies.get('session_id')?.value;
  const user = await getUserFromSession(sessionId);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export function authResponse(error) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
