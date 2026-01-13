/**
 * POST /api/months/[id]/close
 * Close a month (lock editing)
 */
import { db } from '../../../../lib/db.js';
import { requireAuth, authResponse } from '../../../../lib/middleware.js';

export async function POST({ params, cookies }) {
  try {
    const user = requireAuth(cookies);
    const id = parseInt(params.id);

    // Verify month belongs to user
    const monthStmt = db.prepare('SELECT * FROM months WHERE id = ? AND user_id = ?');
    const month = monthStmt.get(id, user.id);

    if (!month) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (month.is_closed) {
      return new Response(JSON.stringify({ error: 'Month already closed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if it's the last day of the month
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (
      month.year !== currentYear ||
      month.month !== currentMonth ||
      currentDay !== lastDayOfMonth
    ) {
      return new Response(
        JSON.stringify({
          error: 'Can only close month on the last day of the current calendar month',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Close the month
    const updateStmt = db.prepare(`
      UPDATE months 
      SET is_closed = 1, closed_at = datetime('now')
      WHERE id = ?
    `);
    updateStmt.run(id);

    // Get updated month
    const updatedMonth = monthStmt.get(id, user.id);
    updatedMonth.is_closed = Boolean(updatedMonth.is_closed);

    return new Response(JSON.stringify(updatedMonth), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Close month error:', error);
    return new Response(JSON.stringify({ error: 'Failed to close month' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
