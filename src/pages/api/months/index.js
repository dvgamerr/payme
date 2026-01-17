import { desc, eq } from 'drizzle-orm'
import { db, schema } from '../../../lib/db.js'
import { requireAuth } from '../../../lib/middleware.js'
import { handleApiRequest, jsonSuccess } from '../../../lib/api-utils.js'

const { months } = schema

export const GET = async ({ cookies }) => {
  return handleApiRequest(async () => {
    const user = await requireAuth(cookies)
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
      .where(eq(months.userId, user.id))
      .orderBy(desc(months.year), desc(months.month))

    const result = rows.map((m) => ({
      ...m,
      is_closed: Boolean(m.is_closed),
    }))

    return jsonSuccess(result)
  })
}
