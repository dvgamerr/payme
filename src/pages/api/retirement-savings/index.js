import { eq } from 'drizzle-orm'
import { db, schema } from '../../../lib/db.js'
import { requireAuth, authResponse } from '../../../lib/middleware.js'

const { users } = schema

export async function GET({ cookies }) {
  try {
    const user = await requireAuth(cookies)
    const rows = await db
      .select({ retirement_savings: users.retirementSavings })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
    const result = rows[0]

    return new Response(JSON.stringify({ retirement_savings: result?.retirement_savings || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Get retirement savings error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get retirement savings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PUT({ request, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const body = await request.json()
    const { retirement_savings } = body

    if (retirement_savings === undefined) {
      return new Response(JSON.stringify({ error: 'Retirement savings amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db
      .update(users)
      .set({ retirementSavings: retirement_savings })
      .where(eq(users.id, user.id))

    return new Response(JSON.stringify({ retirement_savings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Update retirement savings error:', error)
    return new Response(JSON.stringify({ error: 'Failed to update retirement savings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
