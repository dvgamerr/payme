/**
 * POST /api/auth/login
 * Login existing user
 */
import { loginUser, createSession } from '../../../lib/auth.js';

export async function POST({ request, cookies }) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await loginUser(username, password);
    const { sessionId, expiresAt } = createSession(user.id);

    // Set session cookie
    cookies.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(expiresAt),
    });

    return new Response(JSON.stringify({ id: user.id, username: user.username }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);

    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
