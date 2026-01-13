/**
 * GET /api/categories
 * List all budget categories for user
 *
 * POST /api/categories
 * Create new budget category
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function GET({ cookies }) {
  try {
    const user = requireAuth(cookies);

    const stmt = db.prepare(`
      SELECT id, user_id, label, default_amount
      FROM budget_categories
      WHERE user_id = ?
      ORDER BY label
    `);

    const categories = stmt.all(user.id);

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('List categories error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list categories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST({ request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const body = await request.json();
    const { label, default_amount } = body;

    if (!label || default_amount === undefined) {
      return new Response(JSON.stringify({ error: 'Label and default_amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare(`
      INSERT INTO budget_categories (user_id, label, default_amount)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(user.id, label, default_amount);

    const category = {
      id: result.lastInsertRowid,
      user_id: user.id,
      label,
      default_amount,
    };

    return new Response(JSON.stringify(category), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Create category error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
