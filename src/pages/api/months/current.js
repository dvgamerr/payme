/**
 * GET /api/months/current
 * Get or create current month with full summary
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

function getMonthSummary(monthId, userId) {
  // Get month
  const monthStmt = db.prepare('SELECT * FROM months WHERE id = ? AND user_id = ?');
  const month = monthStmt.get(monthId, userId);

  if (!month) return null;

  month.is_closed = Boolean(month.is_closed);

  // Get income entries
  const incomeStmt = db.prepare('SELECT * FROM income_entries WHERE month_id = ?');
  const income_entries = incomeStmt.all(monthId);

  // Get fixed expenses
  const fixedStmt = db.prepare('SELECT * FROM fixed_expenses WHERE user_id = ?');
  const fixed_expenses = fixedStmt.all(userId);

  // Get budgets with categories and spent amounts
  const budgetsStmt = db.prepare(`
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
  `);
  const budgets = budgetsStmt.all(monthId);

  // Get items with category labels
  const itemsStmt = db.prepare(`
    SELECT i.*, bc.label as category_label
    FROM items i
    JOIN budget_categories bc ON bc.id = i.category_id
    WHERE i.month_id = ?
    ORDER BY i.spent_on DESC
  `);
  const items = itemsStmt.all(monthId);

  // Calculate totals
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

export async function GET({ cookies }) {
  try {
    const user = requireAuth(cookies);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    // Try to get existing month
    let monthStmt = db.prepare(`
      SELECT id FROM months WHERE user_id = ? AND year = ? AND month = ?
    `);
    let result = monthStmt.get(user.id, year, month);

    // Create month if doesn't exist
    if (!result) {
      const insertStmt = db.prepare(`
        INSERT INTO months (user_id, year, month)
        VALUES (?, ?, ?)
      `);
      const insertResult = insertStmt.run(user.id, year, month);
      result = { id: insertResult.lastInsertRowid };

      // Create monthly budgets from category defaults
      const categoriesStmt = db.prepare(
        'SELECT id, default_amount FROM budget_categories WHERE user_id = ?'
      );
      const categories = categoriesStmt.all(user.id);

      const budgetInsert = db.prepare(`
        INSERT INTO monthly_budgets (month_id, category_id, allocated_amount)
        VALUES (?, ?, ?)
      `);

      for (const category of categories) {
        budgetInsert.run(result.id, category.id, category.default_amount);
      }
    }

    const summary = getMonthSummary(result.id, user.id);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Get current month error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get current month' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
