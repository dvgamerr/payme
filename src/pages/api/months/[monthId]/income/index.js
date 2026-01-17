import { asc, eq } from 'drizzle-orm'
import { db, schema } from '../../../../../lib/db.js'
import { requireAuth } from '../../../../../lib/middleware.js'
import {
  handleApiRequest,
  jsonSuccess,
  validateRequired,
  parseIntParam,
} from '../../../../../lib/api-utils.js'
import { getMonthByIdForUser } from '../../../../../lib/db-helpers.js'

const { incomeEntries } = schema

export const GET = async ({ params, cookies }) => {
  return handleApiRequest(async () => {
    const user = await requireAuth(cookies)
    const monthId = parseIntParam(params.monthId, 'month ID')

    await getMonthByIdForUser(monthId, user.id)

    const entries = await db
      .select({
        id: incomeEntries.id,
        month_id: incomeEntries.monthId,
        label: incomeEntries.label,
        amount: incomeEntries.amount,
      })
      .from(incomeEntries)
      .where(eq(incomeEntries.monthId, monthId))
      .orderBy(asc(incomeEntries.id))

    return jsonSuccess(entries)
  })
}

export const POST = async ({ params, request, cookies }) => {
  return handleApiRequest(async () => {
    const user = await requireAuth(cookies)
    const monthId = parseIntParam(params.monthId, 'month ID')
    const body = await request.json()
    const { label, amount } = body

    validateRequired(body, ['label', 'amount'])

    await getMonthByIdForUser(monthId, user.id)

    const rows = await db
      .insert(incomeEntries)
      .values({ monthId, label, amount })
      .returning({ id: incomeEntries.id })

    const entry = {
      id: rows[0]?.id,
      month_id: monthId,
      label,
      amount,
    }

    return jsonSuccess(entry, 201)
  })
}
