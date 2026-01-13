/**
 * GET /api/fixed-expenses
 * List all fixed expenses for user
 *
 * POST /api/fixed-expenses
 * Create new fixed expense
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function GET({ cookies }) {
  try {
    const user = requireAuth(cookies);

    const stmt = db.prepare(`
      SELECT id, user_id, label, amount
      FROM fixed_expenses
      WHERE user_id = ?
      ORDER BY label
    `);

    const expenses = stmt.all(user.id);

    return new Response(JSON.stringify(expenses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('List fixed expenses error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list fixed expenses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST({ request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const body = await request.json();
    const { label, amount } = body;

    if (!label || amount === undefined) {
      return new Response(JSON.stringify({ error: 'Label and amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare(`
      INSERT INTO fixed_expenses (user_id, label, amount)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(user.id, label, amount);

    const expense = {
      id: result.lastInsertRowid,
      user_id: user.id,
      label,
      amount,
    };

    return new Response(JSON.stringify(expense), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Create fixed expense error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create fixed expense' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
