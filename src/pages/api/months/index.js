/**
 * GET /api/months
 * List all months for current user
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function GET({ cookies }) {
  try {
    const user = requireAuth(cookies);

    const stmt = db.prepare(`
      SELECT id, user_id, year, month, is_closed, closed_at
      FROM months
      WHERE user_id = ?
      ORDER BY year DESC, month DESC
    `);

    const months = stmt.all(user.id).map((m) => ({
      ...m,
      is_closed: Boolean(m.is_closed),
    }));

    return new Response(JSON.stringify(months), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('List months error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list months' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
