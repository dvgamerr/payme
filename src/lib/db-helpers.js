/**
 * Database Helper Functions
 * Reusable database operations and query helpers
 */

import { eq } from 'drizzle-orm'
import logger from './logger.js'
import { db, schema } from './db.js'

const { months, budgetCategories } = schema

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
