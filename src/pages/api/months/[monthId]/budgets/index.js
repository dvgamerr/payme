/**
 * GET /api/months/[monthId]/budgets
 * List monthly budget allocations
 */
import { db } from '../../../../lib/db.js';
import { requireAuth, authResponse } from '../../../../lib/middleware.js';

export async function GET({ params, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.monthId);

    // Verify month belongs to user
    const monthStmt = db.prepare('SELECT user_id FROM months WHERE id = ?');
    const month = monthStmt.get(monthId);

    if (!month || month.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare(`
      SELECT
        mb.id,
        mb.month_id,
        mb.category_id,
        bc.label as category_label,
        mb.allocated_amount,
        COALESCE(SUM(i.amount), 0) as spent_amount
      FROM monthly_budgets mb
      JOIN budget_categories bc ON bc.id = mb.category_id
      LEFT JOIN items i ON i.category_id = mb.category_id AND i.month_id = mb.month_id
      WHERE mb.month_id = ?
      GROUP BY mb.id, mb.month_id, mb.category_id, bc.label, mb.allocated_amount
      ORDER BY bc.label
    `);

    const budgets = stmt.all(monthId);

    return new Response(JSON.stringify(budgets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('List budgets error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list budgets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
