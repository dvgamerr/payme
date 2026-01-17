import { defineMiddleware } from 'astro:middleware'
import { getUserFromSession } from './lib/auth.js'

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, locals, url } = context

  // Get session cookie
  const sessionId = cookies.get('session_id')?.value

  console.log('[Middleware]', url.pathname, 'session:', sessionId ? 'exists' : 'none')

  // Try to get user from session
  if (sessionId) {
    try {
      const user = await getUserFromSession(sessionId)
      console.log('[Middleware] User:', user ? `${user.username} (${user.id})` : 'not found')
      if (user) {
        locals.user = user
      }
    } catch (error) {
      console.error('[Middleware] Error getting user from session:', error)
    }
  }

  // Continue to the request
  return next()
})
