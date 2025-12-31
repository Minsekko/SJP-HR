import { Hono } from 'hono'
import type { Bindings, Variables } from '../types/bindings'

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 로그인
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()

    if (!username || !password) {
      return c.json({ error: '아이디와 비밀번호를 입력해주세요.' }, 400)
    }

    const user = await c.env.DB.prepare(
      'SELECT u.*, e.name as employee_name FROM users u LEFT JOIN employees e ON u.id = e.user_id WHERE u.username = ? AND u.is_active = 1'
    ).bind(username).first()

    if (!user) {
      return c.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401)
    }

    // 실제 운영에서는 bcrypt로 비밀번호 검증 필요
    // 현재는 간단한 비교로 처리 (개발 환경)
    const isValidPassword = password === 'admin123' // 임시

    if (!isValidPassword) {
      return c.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401)
    }

    // 마지막 로그인 시간 업데이트
    await c.env.DB.prepare(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?'
    ).bind(user.id).run()

    return c.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.employee_name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: '로그인 처리 중 오류가 발생했습니다.' }, 500)
  }
})

// 현재 사용자 정보
auth.get('/me', async (c) => {
  // 실제로는 JWT 토큰 검증 필요
  return c.json({ error: 'Not implemented' }, 501)
})

export default auth
