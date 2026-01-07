import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings, Variables } from './types/bindings'

// 라우트 임포트
import hrRoutes from './routes/hr'
import approvalRoutes from './routes/approval'
import financeRoutes from './routes/finance'
import authRoutes from './routes/auth'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// CORS 설정
app.use('/api/*', cors())

// API 라우트
app.route('/api/auth', authRoutes)
app.route('/api/hr', hrRoutes)
app.route('/api/approval', approvalRoutes)
app.route('/api/finance', financeRoutes)

// 헬스체크
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 메인 페이지 - SPA 진입점
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>중소기업 ERP 시스템</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div id="app"></div>
        
        <script src="/static/app.js"></script>
        <script src="/static/pages.js"></script>
        <script src="/static/approval-finance.js"></script>
    </body>
    </html>
  `)
})

export default app
