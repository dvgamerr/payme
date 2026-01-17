import { asc, eq } from 'drizzle-orm'
import { db, schema } from '../../../lib/db.js'
import { requireAuth, authResponse } from '../../../lib/middleware.js'

const { fixedExpenses } = schema

export async function GET({ cookies }) {
  try {
    const user = await requireAuth(cookies)
    const expenses = await db
      .select({
        id: fixedExpenses.id,
        user_id: fixedExpenses.userId,
        label: fixedExpenses.label,
        amount: fixedExpenses.amount,
        frequency: fixedExpenses.frequency,
      })
      .from(fixedExpenses)
      .where(eq(fixedExpenses.userId, user.id))
      .orderBy(asc(fixedExpenses.label))

    return new Response(JSON.stringify(expenses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('List fixed expenses error:', error)
    return new Response(JSON.stringify({ error: 'Failed to list fixed expenses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST({ request, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const body = await request.json()
    const { label, amount, frequency = 'monthly' } = body

    if (!label || amount === undefined) {
      return new Response(JSON.stringify({ error: 'Label and amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const rows = await db
      .insert(fixedExpenses)
      .values({ userId: user.id, label, amount, frequency })
      .returning({ id: fixedExpenses.id })

    const expense = {
      id: rows[0]?.id,
      user_id: user.id,
      label,
      amount,
      frequency,
    }

    return new Response(JSON.stringify(expense), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Create fixed expense error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create fixed expense' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
