/**
 * GET /api/stats
 * Get statistics: category comparisons and monthly trends
 */
import { db } from '../../../lib/db.js';
import { requireAuth, authResponse } from '../../../lib/middleware.js';

export async function GET({ cookies }) {
  try {
    const user = requireAuth(cookies);

    // Get current month/year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Get previous month
    let prevYear = currentYear;
    let prevMonth = currentMonth - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }

    // Category comparisons (current vs previous month)
    const categoryStmt = db.prepare(`
      SELECT
        bc.id as category_id,
        bc.label as category_label,
        COALESCE(current_spent.amount, 0) as current_month_spent,
        COALESCE(prev_spent.amount, 0) as previous_month_spent,
        COALESCE(current_spent.amount, 0) - COALESCE(prev_spent.amount, 0) as change_amount,
        CASE
          WHEN COALESCE(prev_spent.amount, 0) = 0 THEN NULL
          ELSE ((COALESCE(current_spent.amount, 0) - COALESCE(prev_spent.amount, 0)) / prev_spent.amount) * 100
        END as change_percent
      FROM budget_categories bc
      LEFT JOIN (
        SELECT i.category_id, SUM(i.amount) as amount
        FROM items i
        JOIN months m ON m.id = i.month_id
        WHERE m.user_id = ? AND m.year = ? AND m.month = ?
        GROUP BY i.category_id
      ) current_spent ON current_spent.category_id = bc.id
      LEFT JOIN (
        SELECT i.category_id, SUM(i.amount) as amount
        FROM items i
        JOIN months m ON m.id = i.month_id
        WHERE m.user_id = ? AND m.year = ? AND m.month = ?
        GROUP BY i.category_id
      ) prev_spent ON prev_spent.category_id = bc.id
      WHERE bc.user_id = ?
      ORDER BY bc.label
    `);

    const category_comparisons = categoryStmt.all(
      user.id,
      currentYear,
      currentMonth,
      user.id,
      prevYear,
      prevMonth,
      user.id
    );

    // Monthly trends (last 12 months)
    const trendsStmt = db.prepare(`
      SELECT
        m.year,
        m.month,
        COALESCE(SUM(ie.amount), 0) as total_income,
        COALESCE(SUM(i.amount), 0) as total_spent,
        COALESCE(SUM(fe.amount), 0) as total_fixed,
        COALESCE(SUM(ie.amount), 0) - COALESCE(SUM(i.amount), 0) - COALESCE(SUM(fe.amount), 0) as net
      FROM months m
      LEFT JOIN income_entries ie ON ie.month_id = m.id
      LEFT JOIN items i ON i.month_id = m.id
      LEFT JOIN fixed_expenses fe ON fe.user_id = m.user_id
      WHERE m.user_id = ?
      GROUP BY m.id, m.year, m.month
      ORDER BY m.year DESC, m.month DESC
      LIMIT 12
    `);

    const monthly_trends = trendsStmt.all(user.id);

    // Calculate averages
    const avgStmt = db.prepare(`
      SELECT
        AVG(monthly_spending) as average_monthly_spending,
        AVG(monthly_income) as average_monthly_income
      FROM (
        SELECT
          m.id,
          COALESCE(SUM(i.amount), 0) as monthly_spending,
          COALESCE(SUM(ie.amount), 0) as monthly_income
        FROM months m
        LEFT JOIN items i ON i.month_id = m.id
        LEFT JOIN income_entries ie ON ie.month_id = m.id
        WHERE m.user_id = ?
        GROUP BY m.id
        LIMIT 12
      )
    `);

    const averages = avgStmt.get(user.id);

    return new Response(
      JSON.stringify({
        category_comparisons,
        monthly_trends,
        average_monthly_spending: averages?.average_monthly_spending || 0,
        average_monthly_income: averages?.average_monthly_income || 0,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return authResponse();
    }
    console.error('Get stats error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
