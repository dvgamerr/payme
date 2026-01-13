/**
 * POST /api/import/json
 * Import user data from JSON export
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function POST({ request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const data = await request.json();

    if (!data.version || !data.fixed_expenses || !data.categories || !data.months) {
      return new Response(JSON.stringify({ error: 'Invalid import data format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Begin transaction
    const transaction = db.transaction(() => {
      // Update user savings
      if (data.savings !== undefined || data.retirement_savings !== undefined) {
        const updateUser = db.prepare(`
          UPDATE users 
          SET savings = COALESCE(?, savings), 
              retirement_savings = COALESCE(?, retirement_savings)
          WHERE id = ?
        `);
        updateUser.run(data.savings, data.retirement_savings, user.id);
      }

      // Clear existing data
      db.prepare(
        'DELETE FROM items WHERE month_id IN (SELECT id FROM months WHERE user_id = ?)'
      ).run(user.id);
      db.prepare(
        'DELETE FROM income_entries WHERE month_id IN (SELECT id FROM months WHERE user_id = ?)'
      ).run(user.id);
      db.prepare(
        'DELETE FROM monthly_budgets WHERE month_id IN (SELECT id FROM months WHERE user_id = ?)'
      ).run(user.id);
      db.prepare('DELETE FROM months WHERE user_id = ?').run(user.id);
      db.prepare('DELETE FROM budget_categories WHERE user_id = ?').run(user.id);
      db.prepare('DELETE FROM fixed_expenses WHERE user_id = ?').run(user.id);

      // Import fixed expenses
      const insertFixed = db.prepare(
        'INSERT INTO fixed_expenses (user_id, label, amount) VALUES (?, ?, ?)'
      );
      for (const expense of data.fixed_expenses) {
        insertFixed.run(user.id, expense.label, expense.amount);
      }

      // Import categories and build label->id map
      const categoryMap = {};
      const insertCategory = db.prepare(
        'INSERT INTO budget_categories (user_id, label, default_amount) VALUES (?, ?, ?)'
      );
      for (const category of data.categories) {
        const result = insertCategory.run(user.id, category.label, category.default_amount);
        categoryMap[category.label] = result.lastInsertRowid;
      }

      // Import months with all related data
      const insertMonth = db.prepare(
        'INSERT INTO months (user_id, year, month, is_closed) VALUES (?, ?, ?, ?)'
      );
      const insertIncome = db.prepare(
        'INSERT INTO income_entries (month_id, label, amount) VALUES (?, ?, ?)'
      );
      const insertBudget = db.prepare(
        'INSERT INTO monthly_budgets (month_id, category_id, allocated_amount) VALUES (?, ?, ?)'
      );
      const insertItem = db.prepare(
        'INSERT INTO items (month_id, category_id, description, amount, spent_on) VALUES (?, ?, ?, ?, ?)'
      );

      for (const monthData of data.months) {
        const monthResult = insertMonth.run(
          user.id,
          monthData.year,
          monthData.month,
          monthData.is_closed ? 1 : 0
        );
        const monthId = monthResult.lastInsertRowid;

        // Import income entries
        for (const income of monthData.income_entries || []) {
          insertIncome.run(monthId, income.label, income.amount);
        }

        // Import budgets
        for (const budget of monthData.budgets || []) {
          const categoryId = categoryMap[budget.category_label];
          if (categoryId) {
            insertBudget.run(monthId, categoryId, budget.allocated_amount);
          }
        }

        // Import items
        for (const item of monthData.items || []) {
          const categoryId = categoryMap[item.category_label];
          if (categoryId) {
            insertItem.run(monthId, categoryId, item.description, item.amount, item.spent_on);
          }
        }
      }
    });

    // Execute transaction
    transaction();

    return new Response(JSON.stringify({ message: 'Data imported successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Import JSON error:', error);
    return new Response(JSON.stringify({ error: 'Failed to import data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
