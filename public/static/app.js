// 전역 상태 관리
const AppState = {
  user: null,
  currentPage: 'login',
  token: localStorage.getItem('token') || null
}

// API 호출 헬퍼
async function apiCall(endpoint, options = {}) {
  const baseUrl = window.location.origin
  const url = `${baseUrl}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (AppState.token) {
    headers['Authorization'] = `Bearer ${AppState.token}`
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'API 오류가 발생했습니다.')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// 날짜 포맷 헬퍼
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

// 로그인 페이지
function renderLoginPage() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <i class="fas fa-building text-5xl text-blue-600 mb-4"></i>
          <h1 class="text-3xl font-bold text-gray-800">중소기업 ERP</h1>
          <p class="text-gray-600 mt-2">통합 관리 시스템</p>
        </div>
        
        <form id="loginForm" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">아이디</label>
            <input type="text" id="username" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="아이디를 입력하세요">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <input type="password" id="password" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="비밀번호를 입력하세요">
          </div>
          
          <button type="submit" 
            class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
            로그인
          </button>
        </form>
        
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600 text-center mb-2">테스트 계정</p>
          <div class="text-center">
            <code class="text-sm bg-white px-3 py-1 rounded">admin / admin123</code>
          </div>
        </div>
        
        <div id="loginError" class="mt-4 hidden">
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"></div>
        </div>
      </div>
    </div>
  `
  
  document.getElementById('loginForm').addEventListener('submit', handleLogin)
}

// 로그인 처리
async function handleLogin(e) {
  e.preventDefault()
  
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const errorDiv = document.getElementById('loginError')
  
  try {
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    
    if (data.success) {
      AppState.user = data.user
      AppState.token = 'dummy-token' // 실제로는 서버에서 JWT 발급
      localStorage.setItem('token', AppState.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      navigateTo('dashboard')
    }
  } catch (error) {
    errorDiv.classList.remove('hidden')
    errorDiv.querySelector('div').textContent = error.message
  }
}

// 로그아웃
function handleLogout() {
  AppState.user = null
  AppState.token = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  navigateTo('login')
}

// 메인 레이아웃 렌더링
function renderMainLayout(content) {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <!-- 사이드바 -->
    <div class="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-8">
          <i class="fas fa-building text-3xl text-blue-400"></i>
          <div>
            <h1 class="text-xl font-bold">중소기업 ERP</h1>
            <p class="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
        
        <nav class="space-y-2">
          <a href="#" onclick="navigateTo('dashboard')" class="nav-item" data-page="dashboard">
            <i class="fas fa-home"></i>
            <span>대시보드</span>
          </a>
          
          <div class="mt-6 mb-2">
            <div class="text-xs text-gray-500 uppercase font-semibold px-4">인사관리</div>
          </div>
          <a href="#" onclick="navigateTo('employees')" class="nav-item" data-page="employees">
            <i class="fas fa-users"></i>
            <span>직원 관리</span>
          </a>
          <a href="#" onclick="navigateTo('attendance')" class="nav-item" data-page="attendance">
            <i class="fas fa-clock"></i>
            <span>근태 관리</span>
          </a>
          
          <div class="mt-6 mb-2">
            <div class="text-xs text-gray-500 uppercase font-semibold px-4">전자결재</div>
          </div>
          <a href="#" onclick="navigateTo('approval')" class="nav-item" data-page="approval">
            <i class="fas fa-file-signature"></i>
            <span>결재 문서</span>
          </a>
          
          <div class="mt-6 mb-2">
            <div class="text-xs text-gray-500 uppercase font-semibold px-4">재무/회계</div>
          </div>
          <a href="#" onclick="navigateTo('sales')" class="nav-item" data-page="sales">
            <i class="fas fa-dollar-sign"></i>
            <span>매출 관리</span>
          </a>
          <a href="#" onclick="navigateTo('expenses')" class="nav-item" data-page="expenses">
            <i class="fas fa-receipt"></i>
            <span>비용 관리</span>
          </a>
        </nav>
      </div>
      
      <!-- 사용자 정보 -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gray-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <i class="fas fa-user"></i>
            </div>
            <div class="text-sm">
              <div class="font-semibold">${AppState.user?.name || '사용자'}</div>
              <div class="text-xs text-gray-400">${AppState.user?.role || 'employee'}</div>
            </div>
          </div>
          <button onclick="handleLogout()" class="text-gray-400 hover:text-white">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 메인 콘텐츠 -->
    <div class="ml-64 min-h-screen bg-gray-50">
      <!-- 헤더 -->
      <header class="bg-white shadow-sm">
        <div class="px-6 py-4">
          <h2 class="text-2xl font-bold text-gray-800" id="pageTitle">대시보드</h2>
        </div>
      </header>
      
      <!-- 콘텐츠 영역 -->
      <main class="p-6" id="mainContent">
        ${content}
      </main>
    </div>
  `
  
  // 현재 페이지 하이라이트
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('bg-blue-600')
    if (item.dataset.page === AppState.currentPage) {
      item.classList.add('bg-blue-600')
    }
  })
}

// 대시보드 페이지
async function renderDashboard() {
  const content = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- 통계 카드 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">전체 직원</p>
            <p class="text-3xl font-bold text-gray-800" id="totalEmployees">-</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-users text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">결재 대기</p>
            <p class="text-3xl font-bold text-gray-800" id="pendingApprovals">-</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-file-signature text-green-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">이번 달 매출</p>
            <p class="text-3xl font-bold text-gray-800" id="monthlySales">-</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-dollar-sign text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">이번 달 비용</p>
            <p class="text-3xl font-bold text-gray-800" id="monthlyExpenses">-</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-receipt text-red-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 최근 활동 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold text-gray-800">최근 직원 등록</h3>
        </div>
        <div class="p-6">
          <div id="recentEmployees" class="space-y-3">
            <p class="text-gray-500 text-center py-4">로딩 중...</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold text-gray-800">최근 결재 문서</h3>
        </div>
        <div class="p-6">
          <div id="recentDocuments" class="space-y-3">
            <p class="text-gray-500 text-center py-4">로딩 중...</p>
          </div>
        </div>
      </div>
    </div>
  `
  
  renderMainLayout(content)
  document.getElementById('pageTitle').textContent = '대시보드'
  
  // 통계 데이터 로드
  loadDashboardStats()
}

async function loadDashboardStats() {
  try {
    // 직원 수
    const employees = await apiCall('/api/hr/employees?limit=5')
    document.getElementById('totalEmployees').textContent = employees.pagination?.total || 0
    
    // 최근 직원 표시
    const recentEmployeesDiv = document.getElementById('recentEmployees')
    if (employees.data && employees.data.length > 0) {
      recentEmployeesDiv.innerHTML = employees.data.map(emp => `
        <div class="flex items-center justify-between py-2 border-b">
          <div>
            <p class="font-semibold">${emp.name}</p>
            <p class="text-sm text-gray-600">${emp.department_name || '부서 미지정'}</p>
          </div>
          <span class="text-xs text-gray-500">${formatDate(emp.created_at)}</span>
        </div>
      `).join('')
    } else {
      recentEmployeesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">등록된 직원이 없습니다.</p>'
    }
    
    // 결재 문서
    const documents = await apiCall('/api/approval/documents?limit=5')
    document.getElementById('pendingApprovals').textContent = 
      documents.data?.filter(d => d.status === 'pending').length || 0
    
    const recentDocsDiv = document.getElementById('recentDocuments')
    if (documents.data && documents.data.length > 0) {
      recentDocsDiv.innerHTML = documents.data.map(doc => `
        <div class="flex items-center justify-between py-2 border-b">
          <div>
            <p class="font-semibold">${doc.title}</p>
            <p class="text-sm text-gray-600">${doc.drafter_name}</p>
          </div>
          <span class="text-xs px-2 py-1 rounded ${
            doc.status === 'approved' ? 'bg-green-100 text-green-700' :
            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }">${doc.status}</span>
        </div>
      `).join('')
    } else {
      recentDocsDiv.innerHTML = '<p class="text-gray-500 text-center py-4">결재 문서가 없습니다.</p>'
    }
    
    // 매출/비용은 임시 데이터
    document.getElementById('monthlySales').textContent = '0원'
    document.getElementById('monthlyExpenses').textContent = '0원'
    
  } catch (error) {
    console.error('Dashboard stats error:', error)
  }
}

// 페이지 네비게이션
function navigateTo(page) {
  AppState.currentPage = page
  
  switch(page) {
    case 'login':
      renderLoginPage()
      break
    case 'dashboard':
      renderDashboard()
      break
    case 'employees':
      renderEmployeesPage()
      break
    case 'attendance':
      renderAttendancePage()
      break
    case 'approval':
      renderApprovalPage()
      break
    case 'sales':
      renderSalesPage()
      break
    case 'expenses':
      renderExpensesPage()
      break
    default:
      renderDashboard()
  }
  
  return false // prevent default link behavior
}

// 앱 초기화
function initApp() {
  const savedUser = localStorage.getItem('user')
  const savedToken = localStorage.getItem('token')
  
  if (savedUser && savedToken) {
    AppState.user = JSON.parse(savedUser)
    AppState.token = savedToken
    navigateTo('dashboard')
  } else {
    navigateTo('login')
  }
}

// CSS 추가
const style = document.createElement('style')
style.textContent = `
  .nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #d1d5db;
    border-radius: 0.5rem;
    transition: all 0.2s;
    text-decoration: none;
  }
  
  .nav-item:hover {
    background-color: #374151;
    color: white;
  }
  
  .nav-item.bg-blue-600 {
    background-color: #2563eb;
    color: white;
  }
  
  .nav-item i {
    width: 1.5rem;
    margin-right: 0.75rem;
  }
`
document.head.appendChild(style)

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', initApp)
