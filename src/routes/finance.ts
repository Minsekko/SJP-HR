import { Hono } from 'hono'
import type { Bindings, Variables } from '../types/bindings'

const finance = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ============================================
// 매출 관리 API
// ============================================

// 매출 목록 조회
finance.get('/sales', async (c) => {
  try {
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 20)
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    const partnerId = c.req.query('partner_id')
    const paymentStatus = c.req.query('payment_status')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        s.*,
        bp.company_name as partner_name,
        ac.name as account_name,
        e.name as employee_name
      FROM sales s
      LEFT JOIN business_partners bp ON s.partner_id = bp.id
      LEFT JOIN account_codes ac ON s.account_code_id = ac.id
      LEFT JOIN employees e ON s.employee_id = e.id
      WHERE 1=1
    `
    let params: any[] = []

    if (startDate) {
      query += ' AND s.sale_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND s.sale_date <= ?'
      params.push(endDate)
    }

    if (partnerId) {
      query += ' AND s.partner_id = ?'
      params.push(partnerId)
    }

    if (paymentStatus) {
      query += ' AND s.payment_status = ?'
      params.push(paymentStatus)
    }

    query += ' ORDER BY s.sale_date DESC, s.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const sales = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: sales.results })
  } catch (error) {
    console.error('Get sales error:', error)
    return c.json({ error: '매출 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 매출 등록
finance.post('/sales', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.partner_id || !data.sale_date || !data.account_code_id || !data.amount) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    // 매출 번호 생성
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM sales WHERE substr(sale_number, 3, 8) = ?'
    ).bind(today).first()
    const seq = String((countResult?.count as number || 0) + 1).padStart(4, '0')
    const saleNumber = `S-${today}-${seq}`

    const vat = data.amount * 0.1
    const totalAmount = data.amount + vat

    const result = await c.env.DB.prepare(`
      INSERT INTO sales (
        sale_number, partner_id, sale_date, due_date, account_code_id,
        amount, vat, total_amount, payment_status, paid_amount, description, employee_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 0, ?, ?)
    `).bind(
      saleNumber, data.partner_id, data.sale_date, data.due_date, data.account_code_id,
      data.amount, vat, totalAmount, data.description, data.employee_id
    ).run()

    return c.json({
      success: true,
      data: { id: result.meta.last_row_id, sale_number: saleNumber }
    }, 201)
  } catch (error) {
    console.error('Create sale error:', error)
    return c.json({ error: '매출 등록 중 오류가 발생했습니다.' }, 500)
  }
})

// 비용 목록 조회
finance.get('/expenses', async (c) => {
  try {
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 20)
    const offset = (page - 1) * limit

    const expenses = await c.env.DB.prepare(`
      SELECT 
        ex.*,
        e.name as employee_name,
        ac.name as account_name
      FROM expenses ex
      LEFT JOIN employees e ON ex.employee_id = e.id
      LEFT JOIN account_codes ac ON ex.account_code_id = ac.id
      ORDER BY ex.expense_date DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    return c.json({ success: true, data: expenses.results })
  } catch (error) {
    console.error('Get expenses error:', error)
    return c.json({ error: '비용 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 비용 등록
finance.post('/expenses', async (c) => {
  try {
    const data = await c.req.json()

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM expenses WHERE substr(expense_number, 3, 8) = ?'
    ).bind(today).first()
    const seq = String((countResult?.count as number || 0) + 1).padStart(4, '0')
    const expenseNumber = `E-${today}-${seq}`

    const vat = data.amount * 0.1
    const totalAmount = data.amount + vat

    const result = await c.env.DB.prepare(`
      INSERT INTO expenses (
        expense_number, employee_id, expense_date, account_code_id,
        amount, vat, total_amount, category, description, approval_status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')
    `).bind(
      expenseNumber, data.employee_id, data.expense_date, data.account_code_id,
      data.amount, vat, totalAmount, data.category || 'etc', data.description
    ).run()

    return c.json({
      success: true,
      data: { id: result.meta.last_row_id, expense_number: expenseNumber }
    }, 201)
  } catch (error) {
    console.error('Create expense error:', error)
    return c.json({ error: '비용 등록 중 오류가 발생했습니다.' }, 500)
  }
})

// 거래처 목록
finance.get('/partners', async (c) => {
  try {
    const partners = await c.env.DB.prepare(
      'SELECT * FROM business_partners WHERE is_active = 1 ORDER BY company_name'
    ).all()

    return c.json({ success: true, data: partners.results })
  } catch (error) {
    console.error('Get partners error:', error)
    return c.json({ error: '거래처 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 계정과목 목록
finance.get('/account-codes', async (c) => {
  try {
    const accounts = await c.env.DB.prepare(
      'SELECT * FROM account_codes WHERE is_active = 1 ORDER BY code'
    ).all()

    return c.json({ success: true, data: accounts.results })
  } catch (error) {
    console.error('Get account codes error:', error)
    return c.json({ error: '계정과목 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 예산 목록 조회
finance.get('/budgets', async (c) => {
  try {
    const year = c.req.query('year')
    const month = c.req.query('month')

    let query = `
      SELECT 
        b.*,
        d.name as department_name,
        ac.name as account_name
      FROM budgets b
      LEFT JOIN departments d ON b.department_id = d.id
      LEFT JOIN account_codes ac ON b.account_code_id = ac.id
      WHERE 1=1
    `
    let params: any[] = []

    if (year) {
      query += ' AND b.year = ?'
      params.push(year)
    }

    if (month) {
      query += ' AND b.month = ?'
      params.push(month)
    }

    query += ' ORDER BY b.year DESC, b.month DESC'

    const budgets = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: budgets.results })
  } catch (error) {
    console.error('Get budgets error:', error)
    return c.json({ error: '예산 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

export default finance
