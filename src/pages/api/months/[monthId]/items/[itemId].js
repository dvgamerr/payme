import { and, eq } from 'drizzle-orm'
import { db, schema } from '../../../../../lib/db.js'
import { requireAuth, authResponse } from '../../../../../lib/middleware.js'

const { budgetCategories, items, months } = schema

export async function PUT({ params, request, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const monthId = parseInt(params.monthId)
    const itemId = parseInt(params.itemId)
    const body = await request.json()
    const { category_id, description, amount, spent_on } = body

    // Verify item belongs to user's month
    const checkRows = await db
      .select({ id: items.id })
      .from(items)
      .innerJoin(months, eq(months.id, items.monthId))
      .where(and(eq(items.id, itemId), eq(items.monthId, monthId), eq(months.userId, user.id)))
      .limit(1)
    const item = checkRows[0]

    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // If updating category, verify it belongs to user
    if (category_id !== undefined) {
      const categoryRows = await db
        .select({ user_id: budgetCategories.userId })
        .from(budgetCategories)
        .where(eq(budgetCategories.id, category_id))
        .limit(1)
      const category = categoryRows[0]

      if (!category || category.user_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Category not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    const updates = {}

    if (category_id !== undefined) {
      updates.categoryId = category_id
    }
    if (description !== undefined) {
      updates.description = description
    }
    if (amount !== undefined) {
      updates.amount = amount
    }
    if (spent_on !== undefined) {
      updates.spentOn = spent_on
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.update(items).set(updates).where(eq(items.id, itemId))

    const resultRows = await db
      .select({
        id: items.id,
        month_id: items.monthId,
        category_id: items.categoryId,
        description: items.description,
        amount: items.amount,
        spent_on: items.spentOn,
      })
      .from(items)
      .where(eq(items.id, itemId))
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
    console.error('Update item error:', error)
    return new Response(JSON.stringify({ error: 'Failed to update item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function DELETE({ params, cookies }) {
  try {
    const user = await requireAuth(cookies)
    const monthId = parseInt(params.monthId)
    const itemId = parseInt(params.itemId)

    const checkRows = await db
      .select({ id: items.id })
      .from(items)
      .innerJoin(months, eq(months.id, items.monthId))
      .where(and(eq(items.id, itemId), eq(items.monthId, monthId), eq(months.userId, user.id)))
      .limit(1)
    const item = checkRows[0]

    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.delete(items).where(eq(items.id, itemId))

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse()
    }
    console.error('Delete item error:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
