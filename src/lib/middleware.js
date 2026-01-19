import { getUserFromSession } from './auth.js'
import { handleApiRequest, jsonError } from './api-utils.js'

export const requireAuth = async (cookies) => {
  const sessionId = cookies.get('session_id')?.value
  const user = await getUserFromSession(sessionId)

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export const authResponse = (_error) => {
  return jsonError('Unauthorized', 401)
}

export const withAuth = (handler) => {
  return async (context) => {
    return handleApiRequest(async () => {
      const user = await requireAuth(context.cookies)
      return handler({ ...context, user })
    }, context.cookies)
  }
}
