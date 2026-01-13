/**
 * PUT /api/categories/[id]
 * Update budget category
 *
 * DELETE /api/categories/[id]
 * Delete budget category
 */
import { eq } from 'drizzle-orm';
import { db, schema } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

const { budgetCategories } = schema;

export async function PUT({ params, request, cookies }) {
  try {
    const user = await requireAuth(cookies);
    const id = parseInt(params.id);
    const body = await request.json();
    const { label, default_amount } = body;

    // Verify category belongs to user
    const checkRows = await db
      .select({ user_id: budgetCategories.userId })
      .from(budgetCategories)
      .where(eq(budgetCategories.id, id))
      .limit(1);
    const category = checkRows[0];

    if (!category || category.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates = {};

    if (label !== undefined) {
      updates.label = label;
    }
    if (default_amount !== undefined) {
      updates.defaultAmount = default_amount;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.update(budgetCategories).set(updates).where(eq(budgetCategories.id, id));

    const resultRows = await db
      .select({
        id: budgetCategories.id,
        user_id: budgetCategories.userId,
        label: budgetCategories.label,
        default_amount: budgetCategories.defaultAmount,
      })
      .from(budgetCategories)
      .where(eq(budgetCategories.id, id))
      .limit(1);
    const updated = resultRows[0];

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Update category error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE({ params, cookies }) {
  try {
    const user = await requireAuth(cookies);
    const id = parseInt(params.id);

    // Verify category belongs to user
    const checkRows = await db
      .select({ user_id: budgetCategories.userId })
      .from(budgetCategories)
      .where(eq(budgetCategories.id, id))
      .limit(1);
    const category = checkRows[0];

    if (!category || category.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.delete(budgetCategories).where(eq(budgetCategories.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Delete category error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
