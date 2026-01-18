/**
 * Database Helper Functions
 * Reusable database operations and query helpers
 */

import { and, asc, desc, eq, sql } from 'drizzle-orm'
import logger from './logger.js'
import { db, schema } from './db.js'

const { budgetCategories, fixedExpenses, incomeEntries, items, monthlyBudgets, months } = schema

/**
 * Get comprehensive month summary with all related data
 */
export const getMonthSummary = async (monthId, userId) => {
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
      frequency: fixedExpenses.frequency,
      currency: fixedExpenses.currency,
      exchange_rate: fixedExpenses.exchangeRate,
      display_order: fixedExpenses.displayOrder,
    })
    .from(fixedExpenses)
    .where(eq(fixedExpenses.userId, userId))
    .orderBy(asc(fixedExpenses.displayOrder))

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
    .orderBy(desc(items.spentOn), desc(items.id))

  const total_income = income_entries.reduce((sum, e) => sum + e.amount, 0)
  const total_fixed = fixed_expenses.reduce((sum, e) => {
    const monthlyAmount = e.frequency === 'yearly' ? e.amount / 12 : e.amount
    const exchangeRate = e.exchange_rate || 1
    return sum + monthlyAmount * exchangeRate
  }, 0)
  const total_budgeted = budgets.reduce((sum, b) => sum + b.allocated_amount, 0)
  const total_spent = itemsRows.reduce((sum, i) => sum + i.amount, 0)
  const remaining = total_income + total_fixed - total_spent

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

/**
 * Get month by ID and verify ownership
 */
export const getMonthByIdForUser = async (monthId, userId) => {
  const rows = await db
    .select({
      id: months.id,
      user_id: months.userId,
      year: months.year,
      month: months.month,
      is_closed: months.isClosed,
      closed_at: months.closedAt,
    })
    .from(months)
    .where(eq(months.id, monthId))
    .limit(1)

  const month = rows[0]

  if (!month) {
    throw new Error('Month not found')
  }

  if (month.user_id !== userId) {
    throw new Error('Month not found')
  }

  return month
}

/**
 * Get category by ID and verify ownership
 */
export const getCategoryByIdForUser = async (categoryId, userId) => {
  const rows = await db
    .select({
      id: budgetCategories.id,
      user_id: budgetCategories.userId,
      label: budgetCategories.label,
      default_amount: budgetCategories.defaultAmount,
    })
    .from(budgetCategories)
    .where(eq(budgetCategories.id, categoryId))
    .limit(1)

  const category = rows[0]

  if (!category) {
    throw new Error('Category not found')
  }

  if (category.user_id !== userId) {
    throw new Error('Category not found')
  }

  return category
}

/**
 * Execute database operation with transaction support
 */
export const withTransaction = async (callback) => {
  try {
    const result = await callback(db)
    return result
  } catch (error) {
    // SQLite auto-rollback on error
    logger.error({ err: error }, 'Database transaction error')
    throw error
  }
}

/**
 * Get next display order for user's items
 */
export const getNextDisplayOrder = async (table, userId) => {
  const { desc } = await import('drizzle-orm')

  const rows = await db
    .select({ maxOrder: table.displayOrder })
    .from(table)
    .where(eq(table.userId, userId))
    .orderBy(desc(table.displayOrder))
    .limit(1)

  return rows[0]?.maxOrder ? rows[0].maxOrder + 1 : 0
}

/**
 * Check if resource exists and belongs to user
 */
export const verifyResourceOwnership = async (
  table,
  resourceId,
  userId,
  resourceName = 'Resource'
) => {
  const rows = await db
    .select({ id: table.id, user_id: table.userId })
    .from(table)
    .where(eq(table.id, resourceId))
    .limit(1)

  const resource = rows[0]

  if (!resource) {
    throw new Error(`${resourceName} not found`)
  }

  if (resource.user_id !== userId) {
    throw new Error(`${resourceName} not found`)
  }

  return resource
}
