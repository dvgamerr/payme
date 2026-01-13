/**
 * GET /api/months/[id]
 * Get specific month with full summary
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

function getMonthSummary(monthId, userId) {
  const monthStmt = db.prepare('SELECT * FROM months WHERE id = ? AND user_id = ?');
  const month = monthStmt.get(monthId, userId);

  if (!month) return null;

  month.is_closed = Boolean(month.is_closed);

  const incomeStmt = db.prepare('SELECT * FROM income_entries WHERE month_id = ?');
  const income_entries = incomeStmt.all(monthId);

  const fixedStmt = db.prepare('SELECT * FROM fixed_expenses WHERE user_id = ?');
  const fixed_expenses = fixedStmt.all(userId);

  const budgetsStmt = db.prepare(`
    SELECT
      mb.id, mb.month_id, mb.category_id,
      bc.label as category_label,
      mb.allocated_amount,
      COALESCE(SUM(i.amount), 0) as spent_amount
    FROM monthly_budgets mb
    JOIN budget_categories bc ON bc.id = mb.category_id
    LEFT JOIN items i ON i.category_id = mb.category_id AND i.month_id = mb.month_id
    WHERE mb.month_id = ?
    GROUP BY mb.id
  `);
  const budgets = budgetsStmt.all(monthId);

  const itemsStmt = db.prepare(`
    SELECT i.*, bc.label as category_label
    FROM items i
    JOIN budget_categories bc ON bc.id = i.category_id
    WHERE i.month_id = ?
    ORDER BY i.spent_on DESC
  `);
  const items = itemsStmt.all(monthId);

  const total_income = income_entries.reduce((sum, e) => sum + e.amount, 0);
  const total_fixed = fixed_expenses.reduce((sum, e) => sum + e.amount, 0);
  const total_budgeted = budgets.reduce((sum, b) => sum + b.allocated_amount, 0);
  const total_spent = items.reduce((sum, i) => sum + i.amount, 0);
  const remaining = total_income - total_fixed - total_spent;

  return {
    month,
    income_entries,
    fixed_expenses,
    budgets,
    items,
    total_income,
    total_fixed,
    total_budgeted,
    total_spent,
    remaining,
  };
}

export async function GET({ params, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.id);

    const summary = getMonthSummary(monthId, user.id);

    if (!summary) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Get month error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get month' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
