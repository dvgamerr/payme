/**
 * GET /api/months/[monthId]/income
 * List income entries for a month
 *
 * POST /api/months/[monthId]/income
 * Create income entry
 */
import { db } from '../../../../lib/db.js';
import { requireAuth, authResponse } from '../../../../lib/middleware.js';

export async function GET({ params, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.monthId);

    // Verify month belongs to user
    const monthStmt = db.prepare('SELECT user_id FROM months WHERE id = ?');
    const month = monthStmt.get(monthId);

    if (!month || month.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare('SELECT * FROM income_entries WHERE month_id = ? ORDER BY id');
    const entries = stmt.all(monthId);

    return new Response(JSON.stringify(entries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('List income error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST({ params, request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.monthId);
    const body = await request.json();
    const { label, amount } = body;

    if (!label || amount === undefined) {
      return new Response(JSON.stringify({ error: 'Label and amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify month belongs to user
    const monthStmt = db.prepare('SELECT user_id FROM months WHERE id = ?');
    const month = monthStmt.get(monthId);

    if (!month || month.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare(`
      INSERT INTO income_entries (month_id, label, amount)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(monthId, label, amount);

    const entry = {
      id: result.lastInsertRowid,
      month_id: monthId,
      label,
      amount,
    };

    return new Response(JSON.stringify(entry), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Create income error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
