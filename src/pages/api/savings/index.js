/**
 * GET /api/savings
 * Get current savings
 *
 * PUT /api/savings
 * Update savings amount
 */
import { eq } from 'drizzle-orm';
import { db, schema } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

const { users } = schema;

export async function GET({ cookies }) {
  try {
    const user = await requireAuth(cookies);
    const rows = await db
      .select({ savings: users.savings })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    const result = rows[0];

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
    const user = await requireAuth(cookies);
    const body = await request.json();
    const { savings } = body;

    if (savings === undefined) {
      return new Response(JSON.stringify({ error: 'Savings amount required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.update(users).set({ savings }).where(eq(users.id, user.id));

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
