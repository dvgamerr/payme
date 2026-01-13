/**
 * GET /api/savings
 * Get current savings
 *
 * PUT /api/savings
 * Update savings amount
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function GET({ cookies }) {
  try {
    const user = requireAuth(cookies);

    const stmt = db.prepare('SELECT savings FROM users WHERE id = ?');
    const result = stmt.get(user.id);

    return new Response(JSON.stringify({ savings: result?.savings || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Get savings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get savings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT({ request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const body = await request.json();
    const { savings } = body;

    if (savings === undefined) {
      return new Response(JSON.stringify({ error: 'Savings amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare('UPDATE users SET savings = ? WHERE id = ?');
    stmt.run(savings, user.id);

    return new Response(JSON.stringify({ savings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Update savings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update savings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
