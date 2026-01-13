/**
 * GET /api/retirement-savings
 * Get current retirement savings
 *
 * PUT /api/retirement-savings
 * Update retirement savings amount
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function GET({ cookies }) {
  try {
    const user = requireAuth(cookies);

    const stmt = db.prepare('SELECT retirement_savings FROM users WHERE id = ?');
    const result = stmt.get(user.id);

    return new Response(JSON.stringify({ retirement_savings: result?.retirement_savings || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Get retirement savings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get retirement savings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT({ request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const body = await request.json();
    const { retirement_savings } = body;

    if (retirement_savings === undefined) {
      return new Response(JSON.stringify({ error: 'Retirement savings amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare('UPDATE users SET retirement_savings = ? WHERE id = ?');
    stmt.run(retirement_savings, user.id);

    return new Response(JSON.stringify({ retirement_savings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Update retirement savings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update retirement savings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
