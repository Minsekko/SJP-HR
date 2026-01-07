// 직원 관리 페이지
async function renderEmployeesPage() {
  const content = `
    <div class="space-y-6">
      <!-- 액션 버튼 -->
      <div class="flex justify-between items-center">
        <div>
          <input type="text" id="employeeSearch" placeholder="직원 검색..." 
            class="px-4 py-2 border rounded-lg w-64">
        </div>
        <button onclick="showAddEmployeeModal()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>직원 등록
        </button>
      </div>
      
      <!-- 직원 목록 테이블 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사원번호</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">부서</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">직급</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">입사일</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody id="employeeTableBody" class="divide-y divide-gray-200">
            <tr><td colspan="7" class="text-center py-8 text-gray-500">로딩 중...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 직원 등록/수정 모달 -->
    <div id="employeeModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4" id="modalTitle">직원 등록</h3>
        <form id="employeeForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">사원번호*</label>
              <input type="text" name="employee_number" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">이름*</label>
              <input type="text" name="name" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">부서</label>
              <select name="department_id" class="w-full px-3 py-2 border rounded" id="departmentSelect">
                <option value="">선택하세요</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">직급</label>
              <select name="position_id" class="w-full px-3 py-2 border rounded" id="positionSelect">
                <option value="">선택하세요</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">이메일</label>
              <input type="email" name="email" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">휴대폰</label>
              <input type="tel" name="mobile" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">입사일*</label>
              <input type="date" name="hire_date" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">고용형태</label>
              <select name="employment_type" class="w-full px-3 py-2 border rounded">
                <option value="full_time">정규직</option>
                <option value="part_time">계약직</option>
                <option value="contract">파트타임</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end space-x-2 mt-6">
            <button type="button" onclick="closeEmployeeModal()" 
              class="px-4 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">저장</button>
          </div>
        </form>
      </div>
    </div>
  `
  
  renderMainLayout(content)
  document.getElementById('pageTitle').textContent = '직원 관리'
  
  loadEmployees()
  loadDepartments()
  loadPositions()
  
  document.getElementById('employeeSearch').addEventListener('input', (e) => {
    loadEmployees(e.target.value)
  })
}

async function loadEmployees(search = '') {
  try {
    const url = search ? `/api/hr/employees?search=${encodeURIComponent(search)}` : '/api/hr/employees'
    const data = await apiCall(url)
    
    const tbody = document.getElementById('employeeTableBody')
    
    if (data.data && data.data.length > 0) {
      tbody.innerHTML = data.data.map(emp => `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${emp.employee_number}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="font-medium">${emp.name}</div>
            <div class="text-sm text-gray-500">${emp.email || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${emp.department_name || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${emp.position_name || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${formatDate(emp.hire_date)}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 text-xs rounded ${
              emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }">${emp.status === 'active' ? '재직' : '퇴사'}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <button onclick="viewEmployee(${emp.id})" class="text-blue-600 hover:text-blue-800 mr-2">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        </tr>
      `).join('')
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">직원이 없습니다.</td></tr>'
    }
  } catch (error) {
    console.error('Load employees error:', error)
    alert('직원 목록을 불러오는데 실패했습니다.')
  }
}

async function loadDepartments() {
  try {
    const data = await apiCall('/api/hr/departments')
    const select = document.getElementById('departmentSelect')
    if (data.data) {
      select.innerHTML = '<option value="">선택하세요</option>' + 
        data.data.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('')
    }
  } catch (error) {
    console.error('Load departments error:', error)
  }
}

async function loadPositions() {
  try {
    const data = await apiCall('/api/hr/positions')
    const select = document.getElementById('positionSelect')
    if (data.data) {
      select.innerHTML = '<option value="">선택하세요</option>' + 
        data.data.map(pos => `<option value="${pos.id}">${pos.name}</option>`).join('')
    }
  } catch (error) {
    console.error('Load positions error:', error)
  }
}

function showAddEmployeeModal() {
  document.getElementById('employeeModal').classList.remove('hidden')
  document.getElementById('modalTitle').textContent = '직원 등록'
  document.getElementById('employeeForm').reset()
  
  document.getElementById('employeeForm').onsubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    // 빈 값 처리
    Object.keys(data).forEach(key => {
      if (data[key] === '') data[key] = null
    })
    
    try {
      await apiCall('/api/hr/employees', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      alert('직원이 등록되었습니다.')
      closeEmployeeModal()
      loadEmployees()
    } catch (error) {
      alert(error.message)
    }
  }
}

function closeEmployeeModal() {
  document.getElementById('employeeModal').classList.add('hidden')
}

async function viewEmployee(id) {
  try {
    const data = await apiCall(`/api/hr/employees/${id}`)
    alert(`직원 정보\n\n이름: ${data.data.name}\n부서: ${data.data.department_name || '-'}\n직급: ${data.data.position_name || '-'}`)
  } catch (error) {
    alert('직원 정보를 불러오는데 실패했습니다.')
  }
}

// 근태 관리 페이지
async function renderAttendancePage() {
  const content = `
    <div class="space-y-6">
      <!-- 출퇴근 버튼 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold mb-4">오늘 출퇴근</h3>
        <div class="flex space-x-4">
          <button onclick="checkIn()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            <i class="fas fa-sign-in-alt mr-2"></i>출근
          </button>
          <button onclick="checkOut()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            <i class="fas fa-sign-out-alt mr-2"></i>퇴근
          </button>
        </div>
      </div>
      
      <!-- 근태 기록 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold">근태 기록</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출근</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">퇴근</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">근무시간</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              </tr>
            </thead>
            <tbody id="attendanceTableBody" class="divide-y divide-gray-200">
              <tr><td colspan="5" class="text-center py-8 text-gray-500">로딩 중...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
  
  renderMainLayout(content)
  document.getElementById('pageTitle').textContent = '근태 관리'
  
  loadAttendances()
}

async function checkIn() {
  if (!AppState.user) {
    alert('로그인이 필요합니다.')
    return
  }
  
  try {
    await apiCall('/api/hr/attendances/check-in', {
      method: 'POST',
      body: JSON.stringify({ employee_id: 1 }) // 실제로는 로그인된 직원 ID
    })
    
    alert('출근 처리되었습니다.')
    loadAttendances()
  } catch (error) {
    alert(error.message)
  }
}

async function checkOut() {
  if (!AppState.user) {
    alert('로그인이 필요합니다.')
    return
  }
  
  try {
    await apiCall('/api/hr/attendances/check-out', {
      method: 'POST',
      body: JSON.stringify({ employee_id: 1 }) // 실제로는 로그인된 직원 ID
    })
    
    alert('퇴근 처리되었습니다.')
    loadAttendances()
  } catch (error) {
    alert(error.message)
  }
}

async function loadAttendances() {
  try {
    const data = await apiCall('/api/hr/attendances?employee_id=1&limit=10')
    
    const tbody = document.getElementById('attendanceTableBody')
    
    if (data.data && data.data.length > 0) {
      tbody.innerHTML = data.data.map(att => `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${formatDate(att.attendance_date)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${att.check_in ? new Date(att.check_in).toLocaleTimeString('ko-KR') : '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${att.check_out ? new Date(att.check_out).toLocaleTimeString('ko-KR') : '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${att.work_hours ? att.work_hours + '시간' : '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 text-xs rounded ${
              att.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }">${att.status}</span>
          </td>
        </tr>
      `).join('')
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">근태 기록이 없습니다.</td></tr>'
    }
  } catch (error) {
    console.error('Load attendances error:', error)
  }
}
