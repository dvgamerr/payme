/**
 * PUT /api/fixed-expenses/[id]
 * Update fixed expense
 *
 * DELETE /api/fixed-expenses/[id]
 * Delete fixed expense
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function PUT({ params, request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const id = parseInt(params.id);
    const body = await request.json();
    const { label, amount } = body;

    const checkStmt = db.prepare('SELECT user_id FROM fixed_expenses WHERE id = ?');
    const expense = checkStmt.get(id);

    if (!expense || expense.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Fixed expense not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates = [];
    const params_arr = [];

    if (label !== undefined) {
      updates.push('label = ?');
      params_arr.push(label);
    }
    if (amount !== undefined) {
      updates.push('amount = ?');
      params_arr.push(amount);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    params_arr.push(id);
    const stmt = db.prepare(`UPDATE fixed_expenses SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params_arr);

    const resultStmt = db.prepare('SELECT * FROM fixed_expenses WHERE id = ?');
    const updated = resultStmt.get(id);

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
    const user = requireAuth(cookies);
    const id = parseInt(params.id);

    const checkStmt = db.prepare('SELECT user_id FROM fixed_expenses WHERE id = ?');
    const expense = checkStmt.get(id);

    if (!expense || expense.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Fixed expense not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare('DELETE FROM fixed_expenses WHERE id = ?');
    stmt.run(id);

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
