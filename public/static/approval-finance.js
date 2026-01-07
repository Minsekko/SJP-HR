// 전자결재 페이지
async function renderApprovalPage() {
  const content = `
    <div class="space-y-6">
      <!-- 액션 버튼 -->
      <div class="flex justify-end">
        <button onclick="showNewDocumentModal()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>문서 작성
        </button>
      </div>
      
      <!-- 결재 문서 목록 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b flex space-x-4">
          <button onclick="loadDocuments('all')" class="px-4 py-2 rounded bg-gray-100">전체</button>
          <button onclick="loadDocuments('pending')" class="px-4 py-2 rounded">대기</button>
          <button onclick="loadDocuments('approved')" class="px-4 py-2 rounded">승인</button>
          <button onclick="loadDocuments('rejected')" class="px-4 py-2 rounded">반려</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">문서번호</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기안자</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
              </tr>
            </thead>
            <tbody id="documentTableBody" class="divide-y divide-gray-200">
              <tr><td colspan="5" class="text-center py-8 text-gray-500">로딩 중...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 문서 작성 모달 -->
    <div id="documentModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 class="text-xl font-bold mb-4">결재 문서 작성</h3>
        <form id="documentForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">문서 유형*</label>
            <select name="doc_type_id" required class="w-full px-3 py-2 border rounded" id="docTypeSelect">
              <option value="">선택하세요</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">제목*</label>
            <input type="text" name="title" required class="w-full px-3 py-2 border rounded">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">내용*</label>
            <textarea name="content" required rows="6" class="w-full px-3 py-2 border rounded"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">긴급도</label>
            <select name="urgency" class="w-full px-3 py-2 border rounded">
              <option value="normal">보통</option>
              <option value="high">높음</option>
              <option value="urgent">긴급</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-2 mt-6">
            <button type="button" onclick="closeDocumentModal()" 
              class="px-4 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">작성</button>
          </div>
        </form>
      </div>
    </div>
  `
  
  renderMainLayout(content)
  document.getElementById('pageTitle').textContent = '전자결재'
  
  loadDocuments()
  loadDocTypes()
}

async function loadDocuments(status = 'all') {
  try {
    const url = status === 'all' ? '/api/approval/documents' : `/api/approval/documents?status=${status}`
    const data = await apiCall(url)
    
    const tbody = document.getElementById('documentTableBody')
    
    if (data.data && data.data.length > 0) {
      tbody.innerHTML = data.data.map(doc => `
        <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewDocument('${doc.id}')">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">${doc.doc_number}</td>
          <td class="px-6 py-4">
            <div class="font-medium">${doc.title}</div>
            <div class="text-sm text-gray-500">${doc.doc_type_name}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${doc.drafter_name}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 text-xs rounded ${
              doc.status === 'approved' ? 'bg-green-100 text-green-700' :
              doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }">${
              doc.status === 'approved' ? '승인' :
              doc.status === 'pending' ? '대기' :
              doc.status === 'rejected' ? '반려' : doc.status
            }</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${formatDate(doc.created_at)}</td>
        </tr>
      `).join('')
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">문서가 없습니다.</td></tr>'
    }
  } catch (error) {
    console.error('Load documents error:', error)
  }
}

async function loadDocTypes() {
  try {
    const data = await apiCall('/api/approval/doc-types')
    const select = document.getElementById('docTypeSelect')
    if (data.data) {
      select.innerHTML = '<option value="">선택하세요</option>' + 
        data.data.map(type => `<option value="${type.id}">${type.name}</option>`).join('')
    }
  } catch (error) {
    console.error('Load doc types error:', error)
  }
}

function showNewDocumentModal() {
  document.getElementById('documentModal').classList.remove('hidden')
  document.getElementById('documentForm').reset()
  
  document.getElementById('documentForm').onsubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    // 내용을 JSON으로 변환
    data.content = { text: data.content }
    data.drafter_id = 1 // 실제로는 로그인된 직원 ID
    
    try {
      await apiCall('/api/approval/documents', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      alert('문서가 작성되었습니다.')
      closeDocumentModal()
      loadDocuments()
    } catch (error) {
      alert(error.message)
    }
  }
}

function closeDocumentModal() {
  document.getElementById('documentModal').classList.add('hidden')
}

async function viewDocument(id) {
  try {
    const data = await apiCall(`/api/approval/documents/${id}`)
    const doc = data.data
    
    let contentText = ''
    try {
      const content = JSON.parse(doc.content)
      contentText = content.text || doc.content
    } catch {
      contentText = doc.content
    }
    
    alert(`문서 상세\n\n제목: ${doc.title}\n상태: ${doc.status}\n기안자: ${doc.drafter_name}\n내용: ${contentText}`)
  } catch (error) {
    alert('문서 정보를 불러오는데 실패했습니다.')
  }
}

// 매출 관리 페이지
async function renderSalesPage() {
  const content = `
    <div class="space-y-6">
      <!-- 액션 버튼 -->
      <div class="flex justify-end">
        <button onclick="showNewSaleModal()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>매출 등록
        </button>
      </div>
      
      <!-- 매출 목록 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold">매출 내역</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">매출번호</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">거래처</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">매출일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">입금상태</th>
              </tr>
            </thead>
            <tbody id="salesTableBody" class="divide-y divide-gray-200">
              <tr><td colspan="5" class="text-center py-8 text-gray-500">로딩 중...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 매출 등록 모달 -->
    <div id="saleModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 class="text-xl font-bold mb-4">매출 등록</h3>
        <form id="saleForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">거래처*</label>
            <select name="partner_id" required class="w-full px-3 py-2 border rounded" id="partnerSelect">
              <option value="">선택하세요</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">매출일*</label>
            <input type="date" name="sale_date" required class="w-full px-3 py-2 border rounded">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">금액*</label>
            <input type="number" name="amount" required class="w-full px-3 py-2 border rounded">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">계정과목*</label>
            <select name="account_code_id" required class="w-full px-3 py-2 border rounded" id="accountSelect">
              <option value="">선택하세요</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">설명</label>
            <textarea name="description" rows="3" class="w-full px-3 py-2 border rounded"></textarea>
          </div>
          
          <div class="flex justify-end space-x-2 mt-6">
            <button type="button" onclick="closeSaleModal()" 
              class="px-4 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">등록</button>
          </div>
        </form>
      </div>
    </div>
  `
  
  renderMainLayout(content)
  document.getElementById('pageTitle').textContent = '매출 관리'
  
  loadSales()
  loadPartners()
  loadAccounts()
}

async function loadSales() {
  try {
    const data = await apiCall('/api/finance/sales')
    
    const tbody = document.getElementById('salesTableBody')
    
    if (data.data && data.data.length > 0) {
      tbody.innerHTML = data.data.map(sale => `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">${sale.sale_number}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${sale.partner_name || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${formatDate(sale.sale_date)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">${Number(sale.total_amount).toLocaleString()}원</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 text-xs rounded ${
              sale.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
              sale.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }">${
              sale.payment_status === 'paid' ? '완납' :
              sale.payment_status === 'partial' ? '부분입금' : '미입금'
            }</span>
          </td>
        </tr>
      `).join('')
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">매출 내역이 없습니다.</td></tr>'
    }
  } catch (error) {
    console.error('Load sales error:', error)
  }
}

async function loadPartners() {
  try {
    const data = await apiCall('/api/finance/partners')
    const select = document.getElementById('partnerSelect')
    if (data.data) {
      select.innerHTML = '<option value="">선택하세요</option>' + 
        data.data.map(p => `<option value="${p.id}">${p.company_name}</option>`).join('')
    }
  } catch (error) {
    console.error('Load partners error:', error)
  }
}

async function loadAccounts() {
  try {
    const data = await apiCall('/api/finance/account-codes?type=revenue')
    const select = document.getElementById('accountSelect')
    if (data.data) {
      select.innerHTML = '<option value="">선택하세요</option>' + 
        data.data.map(acc => `<option value="${acc.id}">${acc.name}</option>`).join('')
    }
  } catch (error) {
    console.error('Load accounts error:', error)
  }
}

function showNewSaleModal() {
  document.getElementById('saleModal').classList.remove('hidden')
  document.getElementById('saleForm').reset()
  
  document.getElementById('saleForm').onsubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.employee_id = 1 // 실제로는 로그인된 직원 ID
    
    try {
      await apiCall('/api/finance/sales', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      alert('매출이 등록되었습니다.')
      closeSaleModal()
      loadSales()
    } catch (error) {
      alert(error.message)
    }
  }
}

function closeSaleModal() {
  document.getElementById('saleModal').classList.add('hidden')
}

// 비용 관리 페이지
async function renderExpensesPage() {
  const content = `
    <div class="space-y-6">
      <!-- 액션 버튼 -->
      <div class="flex justify-end">
        <button onclick="showNewExpenseModal()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>비용 등록
        </button>
      </div>
      
      <!-- 비용 목록 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold">비용 내역</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">비용번호</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신청자</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">일자</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">승인상태</th>
              </tr>
            </thead>
            <tbody id="expensesTableBody" class="divide-y divide-gray-200">
              <tr><td colspan="5" class="text-center py-8 text-gray-500">로딩 중...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 비용 등록 모달 -->
    <div id="expenseModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 class="text-xl font-bold mb-4">비용 등록</h3>
        <form id="expenseForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">비용일자*</label>
            <input type="date" name="expense_date" required class="w-full px-3 py-2 border rounded">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">금액*</label>
            <input type="number" name="amount" required class="w-full px-3 py-2 border rounded">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">계정과목*</label>
            <select name="account_code_id" required class="w-full px-3 py-2 border rounded" id="expenseAccountSelect">
              <option value="">선택하세요</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">카테고리</label>
            <select name="category" class="w-full px-3 py-2 border rounded">
              <option value="transportation">교통비</option>
              <option value="meal">식대</option>
              <option value="supplies">소모품</option>
              <option value="etc">기타</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">설명*</label>
            <textarea name="description" required rows="3" class="w-full px-3 py-2 border rounded"></textarea>
          </div>
          
          <div class="flex justify-end space-x-2 mt-6">
            <button type="button" onclick="closeExpenseModal()" 
              class="px-4 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">등록</button>
          </div>
        </form>
      </div>
    </div>
  `
  
  renderMainLayout(content)
  document.getElementById('pageTitle').textContent = '비용 관리'
  
  loadExpenses()
  loadExpenseAccounts()
}

async function loadExpenses() {
  try {
    const data = await apiCall('/api/finance/expenses')
    
    const tbody = document.getElementById('expensesTableBody')
    
    if (data.data && data.data.length > 0) {
      tbody.innerHTML = data.data.map(exp => `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">${exp.expense_number}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${exp.employee_name || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">${formatDate(exp.expense_date)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">${Number(exp.total_amount).toLocaleString()}원</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 text-xs rounded ${
              exp.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
              exp.approval_status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }">${
              exp.approval_status === 'approved' ? '승인' :
              exp.approval_status === 'rejected' ? '반려' : '대기'
            }</span>
          </td>
        </tr>
      `).join('')
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">비용 내역이 없습니다.</td></tr>'
    }
  } catch (error) {
    console.error('Load expenses error:', error)
  }
}

async function loadExpenseAccounts() {
  try {
    const data = await apiCall('/api/finance/account-codes?type=expense')
    const select = document.getElementById('expenseAccountSelect')
    if (data.data) {
      select.innerHTML = '<option value="">선택하세요</option>' + 
        data.data.map(acc => `<option value="${acc.id}">${acc.name}</option>`).join('')
    }
  } catch (error) {
    console.error('Load expense accounts error:', error)
  }
}

function showNewExpenseModal() {
  document.getElementById('expenseModal').classList.remove('hidden')
  document.getElementById('expenseForm').reset()
  
  document.getElementById('expenseForm').onsubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.employee_id = 1 // 실제로는 로그인된 직원 ID
    
    try {
      await apiCall('/api/finance/expenses', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      alert('비용이 등록되었습니다.')
      closeExpenseModal()
      loadExpenses()
    } catch (error) {
      alert(error.message)
    }
  }
}

function closeExpenseModal() {
  document.getElementById('expenseModal').classList.add('hidden')
}
