import { and, desc, eq, sql } from 'drizzle-orm'
import { db, schema } from '../../../lib/db.js'
import { requireAuth, authResponse } from '../../../lib/middleware.js'

const { budgetCategories, fixedExpenses, incomeEntries, items, monthlyBudgets, months } = schema

async function getMonthSummary(monthId, userId) {
  const monthRows = await db
    .select({
      id: months.id,
      user_id: months.userId,
      year: months.year,
      month: months.month,
      is_closed: months.isClosed,
      closed_at: months.closedAt,
    })
    .from(months)
    .where(and(eq(months.id, monthId), eq(months.userId, userId)))
    .limit(1)

  const month = monthRows[0]
  if (!month) return null

  month.is_closed = Boolean(month.is_closed)

  const income_entries = await db
    .select({
      id: incomeEntries.id,
      month_id: incomeEntries.monthId,
      label: incomeEntries.label,
      amount: incomeEntries.amount,
    })
    .from(incomeEntries)
    .where(eq(incomeEntries.monthId, monthId))

  const fixed_expenses = await db
    .select({
      id: fixedExpenses.id,
      user_id: fixedExpenses.userId,
      label: fixedExpenses.label,
      amount: fixedExpenses.amount,
    })
    .from(fixedExpenses)
    .where(eq(fixedExpenses.userId, userId))

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

  const itemsRows = await db
    .select({
      id: items.id,
      month_id: items.monthId,
      category_id: items.categoryId,
      description: items.description,
      amount: items.amount,
      spent_on: items.spentOn,
      category_label: budgetCategories.label,
    })
    .from(items)
    .innerJoin(budgetCategories, eq(budgetCategories.id, items.categoryId))
    .where(eq(items.monthId, monthId))
    .orderBy(desc(items.spentOn))

  const total_income = income_entries.reduce((sum, e) => sum + e.amount, 0)
  const total_fixed = fixed_expenses.reduce((sum, e) => sum + e.amount, 0)
  const total_budgeted = budgets.reduce((sum, b) => sum + b.allocated_amount, 0)
  const total_spent = itemsRows.reduce((sum, i) => sum + i.amount, 0)
  const remaining = total_income - total_fixed - total_spent

  return {
    month,
    income_entries,
    fixed_expenses,
    budgets,
    items: itemsRows,
    total_income,
    total_fixed,
    total_budgeted,
    total_spent,
    remaining,
  }
}

export async function GET({ params, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const monthId = parseInt(params.id)

    const summary = await getMonthSummary(monthId, user.id)

    if (!summary) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Get month error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get month' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
