import { desc, eq, and } from 'drizzle-orm'
import { db, schema } from '../../../lib/db.js'
import { requireAuth } from '../../../lib/middleware.js'
import { handleApiRequest, jsonSuccess, parseIntParam } from '../../../lib/api-utils.js'
import { copyFixedExpensesToMonth } from '../../../lib/db-helpers.js'

const { months, budgetCategories } = schema

export const GET = async ({ cookies, url }) => {
  return handleApiRequest(async () => {
    const user = await requireAuth(cookies)
    const year = parseIntParam(url.searchParams.get('year'), 'year')
    const month = parseIntParam(url.searchParams.get('month'), 'month')

    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12')
    }
    // If year and month provided, get or create that specific month

    const userId = user.id
    if (year && month) {
      // Try to find existing month
      const existingMonth = await db
        .select()
        .from(months)
        .where(and(eq(months.userId, userId), eq(months.year, year), eq(months.month, month)))
        .get()

      if (existingMonth) {
        return jsonSuccess({ month: existingMonth })
      }

      // Create new month
      const newMonth = await db
        .insert(months)
        .values({
          userId,
          year,
          month,
          isClosed: 0,
        })
        .returning()
        .get()

      return jsonSuccess({ month: newMonth }, 201)
    }

    // Otherwise, list all months
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
      .where(eq(months.userId, userId))
      .orderBy(desc(months.year), desc(months.month))

    const result = rows.map((m) => ({
      ...m,
      is_closed: Boolean(m.is_closed),
    }))

    return jsonSuccess(result)
  })
}
