/**
 * PUT /api/fixed-expenses/[id]
 * Update fixed expense
 *
 * DELETE /api/fixed-expenses/[id]
 * Delete fixed expense
 */
import { eq } from 'drizzle-orm';
import { db, schema } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

const { fixedExpenses } = schema;

export async function PUT({ params, request, cookies }) {
  try {
    const user = await requireAuth(cookies);
    const id = parseInt(params.id);
    const body = await request.json();
    const { label, amount } = body;

    const checkRows = await db
      .select({ user_id: fixedExpenses.userId })
      .from(fixedExpenses)
      .where(eq(fixedExpenses.id, id))
      .limit(1);
    const expense = checkRows[0];

    if (!expense || expense.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Fixed expense not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates = {};

    if (label !== undefined) {
      updates.label = label;
    }
    if (amount !== undefined) {
      updates.amount = amount;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.update(fixedExpenses).set(updates).where(eq(fixedExpenses.id, id));

    const resultRows = await db
      .select({
        id: fixedExpenses.id,
        user_id: fixedExpenses.userId,
        label: fixedExpenses.label,
        amount: fixedExpenses.amount,
      })
      .from(fixedExpenses)
      .where(eq(fixedExpenses.id, id))
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
    console.error('Update fixed expense error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update fixed expense' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE({ params, cookies }) {
  try {
    const user = await requireAuth(cookies);
    const id = parseInt(params.id);

    const checkRows = await db
      .select({ user_id: fixedExpenses.userId })
      .from(fixedExpenses)
      .where(eq(fixedExpenses.id, id))
      .limit(1);
    const expense = checkRows[0];

    if (!expense || expense.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Fixed expense not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.delete(fixedExpenses).where(eq(fixedExpenses.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Delete fixed expense error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete fixed expense' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
