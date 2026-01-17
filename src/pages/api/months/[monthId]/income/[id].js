import { and, eq } from 'drizzle-orm'
import { db, schema } from '../../../../../lib/db.js'
import { requireAuth, authResponse } from '../../../../../lib/middleware.js'

const { incomeEntries, months } = schema

export async function PUT({ params, request, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const monthId = parseInt(params.monthId)
    const id = parseInt(params.id)
    const body = await request.json()
    const { label, amount } = body

    // Verify income belongs to user's month
    const checkRows = await db
      .select({ id: incomeEntries.id })
      .from(incomeEntries)
      .innerJoin(months, eq(months.id, incomeEntries.monthId))
      .where(
        and(
          eq(incomeEntries.id, id),
          eq(incomeEntries.monthId, monthId),
          eq(months.userId, user.id)
        )
      )
      .limit(1)
    const income = checkRows[0]

    if (!income) {
      return new Response(JSON.stringify({ error: 'Income not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const updates = {}

    if (label !== undefined) {
      updates.label = label
    }
    if (amount !== undefined) {
      updates.amount = amount
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.update(incomeEntries).set(updates).where(eq(incomeEntries.id, id))

    const resultRows = await db
      .select({
        id: incomeEntries.id,
        month_id: incomeEntries.monthId,
        label: incomeEntries.label,
        amount: incomeEntries.amount,
      })
      .from(incomeEntries)
      .where(eq(incomeEntries.id, id))
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
    console.error('Update income error:', error)
    return new Response(JSON.stringify({ error: 'Failed to update income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function DELETE({ params, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const monthId = parseInt(params.monthId)
    const id = parseInt(params.id)

    const checkRows = await db
      .select({ id: incomeEntries.id })
      .from(incomeEntries)
      .innerJoin(months, eq(months.id, incomeEntries.monthId))
      .where(
        and(
          eq(incomeEntries.id, id),
          eq(incomeEntries.monthId, monthId),
          eq(months.userId, user.id)
        )
      )
      .limit(1)
    const income = checkRows[0]

    if (!income) {
      return new Response(JSON.stringify({ error: 'Income not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.delete(incomeEntries).where(eq(incomeEntries.id, id))

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Delete income error:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
