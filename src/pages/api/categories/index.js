import { asc, eq } from 'drizzle-orm'
import { db, schema } from '../../../lib/db.js'
import { requireAuth, authResponse } from '../../../lib/middleware.js'

const { budgetCategories } = schema

export async function GET({ cookies }) {
  try {
    const user = await requireAuth(cookies)
    const categories = await db
      .select({
        id: budgetCategories.id,
        user_id: budgetCategories.userId,
        label: budgetCategories.label,
        default_amount: budgetCategories.defaultAmount,
      })
      .from(budgetCategories)
      .where(eq(budgetCategories.userId, user.id))
      .orderBy(asc(budgetCategories.label))

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('List categories error:', error)
    return new Response(JSON.stringify({ error: 'Failed to list categories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST({ request, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const body = await request.json()
    const { label, default_amount } = body

    if (!label || default_amount === undefined) {
      return new Response(JSON.stringify({ error: 'Label and default_amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const rows = await db
      .insert(budgetCategories)
      .values({ userId: user.id, label, defaultAmount: default_amount })
      .returning({ id: budgetCategories.id })

    const category = {
      id: rows[0]?.id,
      user_id: user.id,
      label,
      default_amount,
    }

    return new Response(JSON.stringify(category), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Create category error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
