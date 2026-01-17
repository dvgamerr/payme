import { db, schema, nowSql } from '../../../lib/db.js'
import { eq } from 'drizzle-orm'

export async function GET({ locals }) {
  console.log('[Settings API] GET - locals.user:', locals.user)
  const userId = locals.user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    let settings = await db.query.userSettings.findFirst({
      where: eq(schema.userSettings.userId, userId),
    })

    // Create default settings if not exists
    if (!settings) {
      const [newSettings] = await db
        .insert(schema.userSettings)
        .values({
          userId,
          baseCurrency: 'THB',
          currencySymbol: '฿',
        })
        .returning()
      settings = newSettings
    }

    return new Response(
      JSON.stringify({
        baseCurrency: settings.baseCurrency,
        currencySymbol: settings.currencySymbol,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error fetching settings:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PUT({ request, locals }) {
  const userId = locals.user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const { baseCurrency, currencySymbol } = body

    if (!baseCurrency || !currencySymbol) {
      return new Response(
        JSON.stringify({ error: 'baseCurrency and currencySymbol are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if settings exist
    const existing = await db.query.userSettings.findFirst({
      where: eq(schema.userSettings.userId, userId),
    })

    let settings
    if (existing) {
      // Update existing
      ;[settings] = await db
        .update(schema.userSettings)
        .set({
          baseCurrency,
          currencySymbol,
          updatedAt: nowSql,
        })
        .where(eq(schema.userSettings.userId, userId))
        .returning()
    } else {
      // Insert new
      ;[settings] = await db
        .insert(schema.userSettings)
        .values({
          userId,
          baseCurrency,
          currencySymbol,
        })
        .returning()
    }

    return new Response(
      JSON.stringify({
        baseCurrency: settings.baseCurrency,
        currencySymbol: settings.currencySymbol,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error updating settings:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
