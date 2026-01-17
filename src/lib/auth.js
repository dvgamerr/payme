import bcrypt from 'bcrypt'
import { and, eq, gt, lte } from 'drizzle-orm'
import { db, nowSql, schema } from './db.js'

const { sessions, users } = schema

const SALT_ROUNDS = 10
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

function generateSessionId() {
  return crypto.randomUUID()
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

export async function createSession(userId) {
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString()

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  })

  return { sessionId, expiresAt }
}

export async function getUserFromSession(sessionId) {
  if (!sessionId) return null

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      savings: users.savings,
      retirementSavings: users.retirementSavings,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, nowSql)))
    .limit(1)

  return rows[0] ?? null
}

export async function deleteSession(sessionId) {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function cleanupExpiredSessions() {
  const deleted = await db
    .delete(sessions)
    .where(lte(sessions.expiresAt, nowSql))
    .returning({ id: sessions.id })
  if (deleted.length > 0) {
    console.log(`Cleaned up ${deleted.length} expired sessions`)
  }
}

export async function registerUser(username, password) {
  const passwordHash = await hashPassword(password)

  try {
    const rows = await db
      .insert(users)
      .values({ username, passwordHash })
      .returning({ id: users.id, username: users.username })
    return rows[0]
  } catch (error) {
    if (
      error?.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      error?.code === '23505' ||
      error?.message?.includes('UNIQUE constraint failed')
    ) {
      throw new Error('Username already exists')
    }
    throw error
  }
}

export async function loginUser(username, password) {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
  const user = rows[0]

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isValid = await verifyPassword(password, user.passwordHash)

  if (!isValid) {
    throw new Error('Invalid credentials')
  }

  return { id: user.id, username: user.username }
}

// Run cleanup every 6 hours
setInterval(
  () => {
    cleanupExpiredSessions().catch((error) => console.error('Session cleanup failed:', error))
  },
  6 * 60 * 60 * 1000
)
