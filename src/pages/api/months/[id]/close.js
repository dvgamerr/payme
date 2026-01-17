import { and, eq } from 'drizzle-orm'
import { db, nowSql, schema } from '../../../../lib/db.js'
import { requireAuth, authResponse } from '../../../../lib/middleware.js'

const { months } = schema

export async function POST({ params, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const id = parseInt(params.id)

    // Verify month belongs to user
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
      .where(and(eq(months.id, id), eq(months.userId, user.id)))
      .limit(1)
    const month = monthRows[0]

    if (!month) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (month.is_closed) {
      return new Response(JSON.stringify({ error: 'Month already closed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if it's the last day of the month
    const now = new Date()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    if (
      month.year !== currentYear ||
      month.month !== currentMonth ||
      currentDay !== lastDayOfMonth
    ) {
      return new Response(
        JSON.stringify({
          error: 'Can only close month on the last day of the current calendar month',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Close the month
    await db.update(months).set({ isClosed: true, closedAt: nowSql }).where(eq(months.id, id))

    // Get updated month
    const updatedRows = await db
      .select({
        id: months.id,
        user_id: months.userId,
        year: months.year,
        month: months.month,
        is_closed: months.isClosed,
        closed_at: months.closedAt,
      })
      .from(months)
      .where(and(eq(months.id, id), eq(months.userId, user.id)))
      .limit(1)
    const updatedMonth = updatedRows[0]
    updatedMonth.is_closed = Boolean(updatedMonth.is_closed)

    return new Response(JSON.stringify(updatedMonth), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Close month error:', error)
    return new Response(JSON.stringify({ error: 'Failed to close month' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
