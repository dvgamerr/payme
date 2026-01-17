import { and, asc, eq, sql } from 'drizzle-orm'
import { db, schema } from '../../../../../lib/db.js'
import { requireAuth, authResponse } from '../../../../../lib/middleware.js'

const { budgetCategories, items, monthlyBudgets, months } = schema

export async function GET({ params, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const monthId = parseInt(params.monthId)

    // Verify month belongs to user
    const monthRows = await db
      .select({ user_id: months.userId })
      .from(months)
      .where(eq(months.id, monthId))
      .limit(1)
    const month = monthRows[0]

    if (!month || month.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const budgets = await db
      .select({
        id: monthlyBudgets.id,
        month_id: monthlyBudgets.monthId,
        category_id: monthlyBudgets.categoryId,
        category_label: budgetCategories.label,
        allocated_amount: monthlyBudgets.allocatedAmount,
        spent_amount: sql`COALESCE(SUM(${items.amount}), 0)`,
      })
      .from(monthlyBudgets)
      .innerJoin(budgetCategories, eq(budgetCategories.id, monthlyBudgets.categoryId))
      .leftJoin(
        items,
        and(
          eq(items.categoryId, monthlyBudgets.categoryId),
          eq(items.monthId, monthlyBudgets.monthId)
        )
      )
      .where(eq(monthlyBudgets.monthId, monthId))
      .groupBy(
        monthlyBudgets.id,
        monthlyBudgets.monthId,
        monthlyBudgets.categoryId,
        budgetCategories.label,
        monthlyBudgets.allocatedAmount
      )
      .orderBy(asc(budgetCategories.label))

    return new Response(JSON.stringify(budgets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('List budgets error:', error)
    return new Response(JSON.stringify({ error: 'Failed to list budgets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
