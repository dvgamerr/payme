import { defineMiddleware } from 'astro:middleware'
import { getUserFromSession } from './lib/auth.js'

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, locals, url } = context

  const sessionId = cookies.get('session_id')?.value

  if (sessionId) {
    try {
      const user = await getUserFromSession(sessionId)
      if (user) {
        locals.user = user
      }
    } catch (error) {
      console.error('[Middleware] Error getting user from session:', error)
    }
  }

  return next()
})
