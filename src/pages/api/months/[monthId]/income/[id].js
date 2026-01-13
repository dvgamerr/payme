/**
 * PUT /api/months/[monthId]/income/[id]
 * Update income entry
 *
 * DELETE /api/months/[monthId]/income/[id]
 * Delete income entry
 */
import { db } from '../../../../../lib/db.js';
import { requireAuth, authResponse } from '../../../../../lib/middleware.js';

export async function PUT({ params, request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.monthId);
    const id = parseInt(params.id);
    const body = await request.json();
    const { label, amount } = body;

    // Verify income belongs to user's month
    const checkStmt = db.prepare(`
      SELECT ie.id FROM income_entries ie
      JOIN months m ON m.id = ie.month_id
      WHERE ie.id = ? AND ie.month_id = ? AND m.user_id = ?
    `);
    const income = checkStmt.get(id, monthId, user.id);

    if (!income) {
      return new Response(JSON.stringify({ error: 'Income not found' }), {
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
    const stmt = db.prepare(`UPDATE income_entries SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params_arr);

    const resultStmt = db.prepare('SELECT * FROM income_entries WHERE id = ?');
    const updated = resultStmt.get(id);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Update income error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE({ params, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.monthId);
    const id = parseInt(params.id);

    const checkStmt = db.prepare(`
      SELECT ie.id FROM income_entries ie
      JOIN months m ON m.id = ie.month_id
      WHERE ie.id = ? AND ie.month_id = ? AND m.user_id = ?
    `);
    const income = checkStmt.get(id, monthId, user.id);

    if (!income) {
      return new Response(JSON.stringify({ error: 'Income not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare('DELETE FROM income_entries WHERE id = ?');
    stmt.run(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Delete income error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
