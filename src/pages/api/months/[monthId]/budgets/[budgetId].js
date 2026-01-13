/**
 * PUT /api/months/[monthId]/budgets/[budgetId]
 * Update budget allocation amount
 */
import { db } from '../../../../../lib/db.js';
import { requireAuth, authResponse } from '../../../../../lib/middleware.js';

export async function PUT({ params, request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.monthId);
    const budgetId = parseInt(params.budgetId);
    const body = await request.json();
    const { allocated_amount } = body;

    if (allocated_amount === undefined) {
      return new Response(JSON.stringify({ error: 'allocated_amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify budget belongs to user's month
    const checkStmt = db.prepare(`
      SELECT mb.id FROM monthly_budgets mb
      JOIN months m ON m.id = mb.month_id
      WHERE mb.id = ? AND mb.month_id = ? AND m.user_id = ?
    `);
    const budget = checkStmt.get(budgetId, monthId, user.id);

    if (!budget) {
      return new Response(JSON.stringify({ error: 'Budget not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare('UPDATE monthly_budgets SET allocated_amount = ? WHERE id = ?');
    stmt.run(allocated_amount, budgetId);

    const resultStmt = db.prepare('SELECT * FROM monthly_budgets WHERE id = ?');
    const updated = resultStmt.get(budgetId);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Update budget error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update budget' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
