/**
 * GET /api/months/[monthId]/items
 * List spending items for a month
 *
 * POST /api/months/[monthId]/items
 * Create spending item
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

    const stmt = db.prepare(`
      SELECT i.*, bc.label as category_label
      FROM items i
      JOIN budget_categories bc ON bc.id = i.category_id
      WHERE i.month_id = ?
      ORDER BY i.spent_on DESC, i.id DESC
    `);
    const items = stmt.all(monthId);

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('List items error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list items' }), {
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
    const { category_id, description, amount, spent_on } = body;

    if (!category_id || !description || amount === undefined || !spent_on) {
      return new Response(
        JSON.stringify({ error: 'category_id, description, amount, and spent_on required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    // Verify category belongs to user
    const catStmt = db.prepare('SELECT user_id FROM budget_categories WHERE id = ?');
    const category = catStmt.get(category_id);

    if (!category || category.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare(`
      INSERT INTO items (month_id, category_id, description, amount, spent_on)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(monthId, category_id, description, amount, spent_on);

    const item = {
      id: result.lastInsertRowid,
      month_id: monthId,
      category_id,
      description,
      amount,
      spent_on,
    };

    return new Response(JSON.stringify(item), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Create item error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
