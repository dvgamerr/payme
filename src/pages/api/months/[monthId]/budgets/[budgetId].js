import { and, eq } from 'drizzle-orm'
import { db, schema } from '../../../../../lib/db.js'
import { requireAuth, authResponse } from '../../../../../lib/middleware.js'

const { monthlyBudgets, months } = schema

export async function PUT({ params, request, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const monthId = parseInt(params.monthId)
    const budgetId = parseInt(params.budgetId)
    const body = await request.json()
    const { allocated_amount } = body

    if (allocated_amount === undefined) {
      return new Response(JSON.stringify({ error: 'allocated_amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify budget belongs to user's month
    const checkRows = await db
      .select({ id: monthlyBudgets.id })
      .from(monthlyBudgets)
      .innerJoin(months, eq(months.id, monthlyBudgets.monthId))
      .where(
        and(
          eq(monthlyBudgets.id, budgetId),
          eq(monthlyBudgets.monthId, monthId),
          eq(months.userId, user.id)
        )
      )
      .limit(1)
    const budget = checkRows[0]

    if (!budget) {
      return new Response(JSON.stringify({ error: 'Budget not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db
      .update(monthlyBudgets)
      .set({ allocatedAmount: allocated_amount })
      .where(eq(monthlyBudgets.id, budgetId))

    const resultRows = await db
      .select({
        id: monthlyBudgets.id,
        month_id: monthlyBudgets.monthId,
        category_id: monthlyBudgets.categoryId,
        allocated_amount: monthlyBudgets.allocatedAmount,
      })
      .from(monthlyBudgets)
      .where(eq(monthlyBudgets.id, budgetId))
      .limit(1)
    const updated = resultRows[0]

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Update budget error:', error)
    return new Response(JSON.stringify({ error: 'Failed to update budget' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
