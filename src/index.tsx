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

// 메인 페이지
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
        <!-- 네비게이션 바 -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <i class="fas fa-building text-blue-600 text-2xl mr-3"></i>
                        <span class="text-xl font-bold text-gray-800">중소기업 ERP</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button id="loginBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-sign-in-alt mr-2"></i>로그인
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- 메인 콘텐츠 -->
        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- 대시보드 카드 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- 인사관리 카드 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-800">인사관리</h3>
                        <i class="fas fa-users text-blue-600 text-3xl"></i>
                    </div>
                    <p class="text-gray-600 mb-4">직원 정보, 조직도, 근태 관리</p>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">직원 관리</span>
                            <span class="text-blue-600 font-semibold">→</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">근태 관리</span>
                            <span class="text-blue-600 font-semibold">→</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">조직도</span>
                            <span class="text-blue-600 font-semibold">→</span>
                        </div>
                    </div>
                </div>

                <!-- 전자결재 카드 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-800">전자결재</h3>
                        <i class="fas fa-file-signature text-green-600 text-3xl"></i>
                    </div>
                    <p class="text-gray-600 mb-4">문서 작성, 결재 승인 워크플로우</p>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">문서 작성</span>
                            <span class="text-green-600 font-semibold">→</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">결재 현황</span>
                            <span class="text-green-600 font-semibold">→</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">승인 대기</span>
                            <span class="text-green-600 font-semibold">→</span>
                        </div>
                    </div>
                </div>

                <!-- 재무/회계 카드 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-800">재무/회계</h3>
                        <i class="fas fa-chart-line text-purple-600 text-3xl"></i>
                    </div>
                    <p class="text-gray-600 mb-4">매출/매입, 비용, 예산 관리</p>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">매출 관리</span>
                            <span class="text-purple-600 font-semibold">→</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">비용 처리</span>
                            <span class="text-purple-600 font-semibold">→</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">예산 현황</span>
                            <span class="text-purple-600 font-semibold">→</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 시스템 정보 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4">
                    <i class="fas fa-info-circle text-blue-600 mr-2"></i>시스템 정보
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">시스템 버전</p>
                        <p class="text-lg font-semibold">v1.0.0</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">API 상태</p>
                        <p class="text-lg font-semibold text-green-600" id="apiStatus">확인 중...</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">테스트 계정</p>
                        <p class="text-sm font-mono">admin / admin123</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">지원 사용자</p>
                        <p class="text-lg font-semibold">50-100명</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // API 헬스체크
            async function checkApiHealth() {
                try {
                    const response = await axios.get('/api/health');
                    document.getElementById('apiStatus').textContent = '정상 작동';
                    document.getElementById('apiStatus').className = 'text-lg font-semibold text-green-600';
                } catch (error) {
                    document.getElementById('apiStatus').textContent = '오류';
                    document.getElementById('apiStatus').className = 'text-lg font-semibold text-red-600';
                }
            }

            // 로그인 버튼
            document.getElementById('loginBtn').addEventListener('click', () => {
                alert('로그인 페이지는 구현 예정입니다.\\n\\n테스트 계정:\\nID: admin\\nPW: admin123');
            });

            // 페이지 로드 시 실행
            checkApiHealth();
        </script>
    </body>
    </html>
  `)
})

export default app
