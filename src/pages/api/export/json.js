/**
 * GET /api/export/json
 * Export all user data as JSON
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function GET({ cookies }) {
  try {
    const user = requireAuth(cookies);

    // Get user savings
    const userStmt = db.prepare('SELECT savings, retirement_savings FROM users WHERE id = ?');
    const userData = userStmt.get(user.id);

    // Get fixed expenses
    const fixedStmt = db.prepare('SELECT label, amount FROM fixed_expenses WHERE user_id = ?');
    const fixed_expenses = fixedStmt.all(user.id);

    // Get categories
    const catStmt = db.prepare(
      'SELECT label, default_amount FROM budget_categories WHERE user_id = ?'
    );
    const categories = catStmt.all(user.id);

    // Get all months with data
    const monthsStmt = db.prepare(`
      SELECT id, year, month, is_closed FROM months WHERE user_id = ? ORDER BY year, month
    `);
    const monthsData = monthsStmt.all(user.id);

    const months = [];

    for (const month of monthsData) {
      // Income entries
      const incomeStmt = db.prepare('SELECT label, amount FROM income_entries WHERE month_id = ?');
      const income_entries = incomeStmt.all(month.id);

      // Budgets
      const budgetsStmt = db.prepare(`
        SELECT bc.label as category_label, mb.allocated_amount
        FROM monthly_budgets mb
        JOIN budget_categories bc ON bc.id = mb.category_id
        WHERE mb.month_id = ?
      `);
      const budgets = budgetsStmt.all(month.id);

      // Items
      const itemsStmt = db.prepare(`
        SELECT bc.label as category_label, i.description, i.amount, i.spent_on
        FROM items i
        JOIN budget_categories bc ON bc.id = i.category_id
        WHERE i.month_id = ?
      `);
      const items = itemsStmt.all(month.id);

      months.push({
        year: month.year,
        month: month.month,
        is_closed: Boolean(month.is_closed),
        income_entries,
        budgets,
        items,
      });
    }

    const exportData = {
      version: 1,
      savings: userData?.savings || 0,
      retirement_savings: userData?.retirement_savings || 0,
      fixed_expenses,
      categories,
      months,
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="payme-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Export JSON error:', error);
    return new Response(JSON.stringify({ error: 'Failed to export data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
