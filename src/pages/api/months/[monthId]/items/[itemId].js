/**
 * PUT /api/months/[monthId]/items/[itemId]
 * Update spending item
 *
 * DELETE /api/months/[monthId]/items/[itemId]
 * Delete spending item
 */
import { db } from '../../../../../lib/db.js';
import { requireAuth, authResponse } from '../../../../../lib/middleware.js';

export async function PUT({ params, request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.monthId);
    const itemId = parseInt(params.itemId);
    const body = await request.json();
    const { category_id, description, amount, spent_on } = body;

    // Verify item belongs to user's month
    const checkStmt = db.prepare(`
      SELECT i.id FROM items i
      JOIN months m ON m.id = i.month_id
      WHERE i.id = ? AND i.month_id = ? AND m.user_id = ?
    `);
    const item = checkStmt.get(itemId, monthId, user.id);

    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If updating category, verify it belongs to user
    if (category_id !== undefined) {
      const catStmt = db.prepare('SELECT user_id FROM budget_categories WHERE id = ?');
      const category = catStmt.get(category_id);

      if (!category || category.user_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Category not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const updates = [];
    const params_arr = [];

    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params_arr.push(category_id);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params_arr.push(description);
    }
    if (amount !== undefined) {
      updates.push('amount = ?');
      params_arr.push(amount);
    }
    if (spent_on !== undefined) {
      updates.push('spent_on = ?');
      params_arr.push(spent_on);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    params_arr.push(itemId);
    const stmt = db.prepare(`UPDATE items SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params_arr);

    const resultStmt = db.prepare('SELECT * FROM items WHERE id = ?');
    const updated = resultStmt.get(itemId);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Update item error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE({ params, cookies }) {
  try {
    const user = requireAuth(cookies);
    const monthId = parseInt(params.monthId);
    const itemId = parseInt(params.itemId);

    const checkStmt = db.prepare(`
      SELECT i.id FROM items i
      JOIN months m ON m.id = i.month_id
      WHERE i.id = ? AND i.month_id = ? AND m.user_id = ?
    `);
    const item = checkStmt.get(itemId, monthId, user.id);

    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare('DELETE FROM items WHERE id = ?');
    stmt.run(itemId);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Delete item error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
