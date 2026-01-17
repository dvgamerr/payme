import { asc, eq } from 'drizzle-orm'
import { db, schema } from '../../../../../lib/db.js'
import { requireAuth, authResponse } from '../../../../../lib/middleware.js'

const { incomeEntries, months } = schema

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

    const entries = await db
      .select({
        id: incomeEntries.id,
        month_id: incomeEntries.monthId,
        label: incomeEntries.label,
        amount: incomeEntries.amount,
      })
      .from(incomeEntries)
      .where(eq(incomeEntries.monthId, monthId))
      .orderBy(asc(incomeEntries.id))

    return new Response(JSON.stringify(entries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('List income error:', error)
    return new Response(JSON.stringify({ error: 'Failed to list income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST({ params, request, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const monthId = parseInt(params.monthId)
    const body = await request.json()
    const { label, amount } = body

    if (!label || amount === undefined) {
      return new Response(JSON.stringify({ error: 'Label and amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

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

    const rows = await db
      .insert(incomeEntries)
      .values({ monthId, label, amount })
      .returning({ id: incomeEntries.id })

    const entry = {
      id: rows[0]?.id,
      month_id: monthId,
      label,
      amount,
    }

    return new Response(JSON.stringify(entry), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Create income error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
