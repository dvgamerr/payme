/**
 * POST /api/auth/logout
 * Logout current user
 */
import { deleteSession } from '../../../lib/auth.js';

export async function POST({ cookies }) {
  const sessionId = cookies.get('session_id')?.value;

  if (sessionId) {
    deleteSession(sessionId);
  }

  cookies.delete('session_id', { path: '/' });

  return new Response(null, { status: 204 });
}
