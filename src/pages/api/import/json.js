/**
 * POST /api/import/json
 * Import user data from JSON export
 */
import { eq, inArray } from 'drizzle-orm';
import { db, schema } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

const { budgetCategories, fixedExpenses, incomeEntries, items, monthlyBudgets, months, users } =
  schema;

export async function POST({ request, cookies }) {
  try {
    const user = await requireAuth(cookies);
    const data = await request.json();

    if (!data.version || !data.fixed_expenses || !data.categories || !data.months) {
      return new Response(JSON.stringify({ error: 'Invalid import data format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.transaction(async (tx) => {
      const userUpdates = {};
      if (data.savings !== undefined) {
        userUpdates.savings = data.savings;
      }
      if (data.retirement_savings !== undefined) {
        userUpdates.retirementSavings = data.retirement_savings;
      }
      if (Object.keys(userUpdates).length > 0) {
        await tx.update(users).set(userUpdates).where(eq(users.id, user.id));
      }

      const monthRows = await tx
        .select({ id: months.id })
        .from(months)
        .where(eq(months.userId, user.id));
      const monthIds = monthRows.map((row) => row.id);

      if (monthIds.length > 0) {
        await tx.delete(items).where(inArray(items.monthId, monthIds));
        await tx.delete(incomeEntries).where(inArray(incomeEntries.monthId, monthIds));
        await tx.delete(monthlyBudgets).where(inArray(monthlyBudgets.monthId, monthIds));
      }

      await tx.delete(months).where(eq(months.userId, user.id));
      await tx.delete(budgetCategories).where(eq(budgetCategories.userId, user.id));
      await tx.delete(fixedExpenses).where(eq(fixedExpenses.userId, user.id));

      if (data.fixed_expenses.length > 0) {
        await tx.insert(fixedExpenses).values(
          data.fixed_expenses.map((expense) => ({
            userId: user.id,
            label: expense.label,
            amount: expense.amount,
          }))
        );
      }

      const categoryMap = new Map();
      if (data.categories.length > 0) {
        const insertedCategories = await tx
          .insert(budgetCategories)
          .values(
            data.categories.map((category) => ({
              userId: user.id,
              label: category.label,
              defaultAmount: category.default_amount,
            }))
          )
          .returning({ id: budgetCategories.id, label: budgetCategories.label });

        for (const category of insertedCategories) {
          categoryMap.set(category.label, category.id);
        }
      }

      for (const monthData of data.months) {
        const insertedMonth = await tx
          .insert(months)
          .values({
            userId: user.id,
            year: monthData.year,
            month: monthData.month,
            isClosed: Boolean(monthData.is_closed),
          })
          .returning({ id: months.id });
        const monthId = insertedMonth[0]?.id;

        if (!monthId) {
          continue;
        }

        if (monthData.income_entries?.length) {
          await tx.insert(incomeEntries).values(
            monthData.income_entries.map((income) => ({
              monthId,
              label: income.label,
              amount: income.amount,
            }))
          );
        }

        if (monthData.budgets?.length) {
          const budgetRows = monthData.budgets
            .map((budget) => ({
              categoryId: categoryMap.get(budget.category_label),
              allocatedAmount: budget.allocated_amount,
            }))
            .filter((budget) => budget.categoryId);

          if (budgetRows.length > 0) {
            await tx.insert(monthlyBudgets).values(
              budgetRows.map((budget) => ({
                monthId,
                categoryId: budget.categoryId,
                allocatedAmount: budget.allocatedAmount,
              }))
            );
          }
        }

        if (monthData.items?.length) {
          const itemRows = monthData.items
            .map((item) => ({
              categoryId: categoryMap.get(item.category_label),
              description: item.description,
              amount: item.amount,
              spentOn: item.spent_on,
            }))
            .filter((item) => item.categoryId);

          if (itemRows.length > 0) {
            await tx.insert(items).values(
              itemRows.map((item) => ({
                monthId,
                categoryId: item.categoryId,
                description: item.description,
                amount: item.amount,
                spentOn: item.spentOn,
              }))
            );
          }
        }
      }
    });

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
