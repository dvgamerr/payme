import { desc, eq } from 'drizzle-orm'
import { db, schema } from '../../../lib/db.js'
import { requireAuth, authResponse } from '../../../lib/middleware.js'

const { months } = schema

export async function GET({ cookies }) {
  try {
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

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('List months error:', error)
    return new Response(JSON.stringify({ error: 'Failed to list months' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
