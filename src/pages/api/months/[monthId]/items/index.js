/**
 * GET /api/months/[monthId]/items
 * List spending items for a month
 *
 * POST /api/months/[monthId]/items
 * Create spending item
 */
import { desc, eq } from 'drizzle-orm';
import { db, schema } from '../../../../../lib/db.js';
import { requireAuth, authResponse } from '../../../../../lib/middleware.js';

const { budgetCategories, items, months } = schema;

export async function GET({ params, cookies }) {
  try {
    const user = await requireAuth(cookies);
    const monthId = parseInt(params.monthId);

    // Verify month belongs to user
    const monthRows = await db
      .select({ user_id: months.userId })
      .from(months)
      .where(eq(months.id, monthId))
      .limit(1);
    const month = monthRows[0];

    if (!month || month.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const itemsRows = await db
      .select({
        id: items.id,
        month_id: items.monthId,
        category_id: items.categoryId,
        description: items.description,
        amount: items.amount,
        spent_on: items.spentOn,
        category_label: budgetCategories.label,
      })
      .from(items)
      .innerJoin(budgetCategories, eq(budgetCategories.id, items.categoryId))
      .where(eq(items.monthId, monthId))
      .orderBy(desc(items.spentOn), desc(items.id));

    return new Response(JSON.stringify(itemsRows), {
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
    const user = await requireAuth(cookies);
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
    const monthRows = await db
      .select({ user_id: months.userId })
      .from(months)
      .where(eq(months.id, monthId))
      .limit(1);
    const month = monthRows[0];

    if (!month || month.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Month not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify category belongs to user
    const categoryRows = await db
      .select({ user_id: budgetCategories.userId })
      .from(budgetCategories)
      .where(eq(budgetCategories.id, category_id))
      .limit(1);
    const category = categoryRows[0];

    if (!category || category.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rows = await db
      .insert(items)
      .values({
        monthId,
        categoryId: category_id,
        description,
        amount,
        spentOn: spent_on,
      })
      .returning({ id: items.id });

    const item = {
      id: rows[0]?.id,
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
