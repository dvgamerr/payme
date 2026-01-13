/**
 * GET /api/auth/me
 * Get current authenticated user
 */
import { getUserFromSession } from '../../../lib/auth.js';

export async function GET({ cookies }) {
  const sessionId = cookies.get('session_id')?.value;
  const user = getUserFromSession(sessionId);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ id: user.id, username: user.username }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
