import { eq } from 'drizzle-orm'
import { db, schema } from '../../../lib/db.js'
import { requireAuth, authResponse } from '../../../lib/middleware.js'

const { fixedExpenses } = schema

export async function PUT({ request, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const body = await request.json()
    const { order } = body

    if (!Array.isArray(order) || order.length === 0) {
      return new Response(JSON.stringify({ error: 'Order array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userExpenses = await db
      .select({ id: fixedExpenses.id })
      .from(fixedExpenses)
      .where(eq(fixedExpenses.userId, user.id))

    const userExpenseIds = new Set(userExpenses.map((e) => e.id))
    const allValid = order.every((id) => userExpenseIds.has(id))

    if (!allValid) {
      return new Response(JSON.stringify({ error: 'Invalid expense IDs' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    for (let i = 0; i < order.length; i++) {
      await db.update(fixedExpenses).set({ displayOrder: i }).where(eq(fixedExpenses.id, order[i]))
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Reorder fixed expenses error:', error)
    return new Response(JSON.stringify({ error: 'Failed to reorder fixed expenses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
