/**
 * GET /api/export/json
 * Export all user data as JSON
 */
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

const { budgetCategories, fixedExpenses, incomeEntries, items, monthlyBudgets, months, users } =
  schema;

export async function GET({ cookies }) {
  try {
    const user = await requireAuth(cookies);

    // Get user savings
    const userRows = await db
      .select({
        savings: users.savings,
        retirement_savings: users.retirementSavings,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    const userData = userRows[0];

    // Get fixed expenses
    const fixed_expenses = await db
      .select({ label: fixedExpenses.label, amount: fixedExpenses.amount })
      .from(fixedExpenses)
      .where(eq(fixedExpenses.userId, user.id));

    // Get categories
    const categories = await db
      .select({
        label: budgetCategories.label,
        default_amount: budgetCategories.defaultAmount,
      })
      .from(budgetCategories)
      .where(eq(budgetCategories.userId, user.id));

    // Get all months with data
    const monthsData = await db
      .select({
        id: months.id,
        year: months.year,
        month: months.month,
        is_closed: months.isClosed,
      })
      .from(months)
      .where(eq(months.userId, user.id))
      .orderBy(asc(months.year), asc(months.month));

    const months = [];

    for (const month of monthsData) {
      // Income entries
      const income_entries = await db
        .select({ label: incomeEntries.label, amount: incomeEntries.amount })
        .from(incomeEntries)
        .where(eq(incomeEntries.monthId, month.id));

      // Budgets
      const budgets = await db
        .select({
          category_label: budgetCategories.label,
          allocated_amount: monthlyBudgets.allocatedAmount,
        })
        .from(monthlyBudgets)
        .innerJoin(budgetCategories, eq(budgetCategories.id, monthlyBudgets.categoryId))
        .where(eq(monthlyBudgets.monthId, month.id));

      // Items
      const itemsRows = await db
        .select({
          category_label: budgetCategories.label,
          description: items.description,
          amount: items.amount,
          spent_on: items.spentOn,
        })
        .from(items)
        .innerJoin(budgetCategories, eq(budgetCategories.id, items.categoryId))
        .where(eq(items.monthId, month.id));

      months.push({
        year: month.year,
        month: month.month,
        is_closed: Boolean(month.is_closed),
        income_entries,
        budgets,
        items: itemsRows,
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
