/**
 * PUT /api/categories/[id]
 * Update budget category
 *
 * DELETE /api/categories/[id]
 * Delete budget category
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function PUT({ params, request, cookies }) {
  try {
    const user = requireAuth(cookies);
    const id = parseInt(params.id);
    const body = await request.json();
    const { label, default_amount } = body;

    // Verify category belongs to user
    const checkStmt = db.prepare('SELECT user_id FROM budget_categories WHERE id = ?');
    const category = checkStmt.get(id);

    if (!category || category.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
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
    if (default_amount !== undefined) {
      updates.push('default_amount = ?');
      params_arr.push(default_amount);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    params_arr.push(id);
    const stmt = db.prepare(`UPDATE budget_categories SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params_arr);

    const resultStmt = db.prepare('SELECT * FROM budget_categories WHERE id = ?');
    const updated = resultStmt.get(id);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Update category error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE({ params, cookies }) {
  try {
    const user = requireAuth(cookies);
    const id = parseInt(params.id);

    // Verify category belongs to user
    const checkStmt = db.prepare('SELECT user_id FROM budget_categories WHERE id = ?');
    const category = checkStmt.get(id);

    if (!category || category.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = db.prepare('DELETE FROM budget_categories WHERE id = ?');
    stmt.run(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Delete category error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
