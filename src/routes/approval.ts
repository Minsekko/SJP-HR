import { Hono } from 'hono'
import type { Bindings, Variables } from '../types/bindings'

const approval = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ============================================
// 결재 문서 API
// ============================================

// 결재 문서 목록 조회
approval.get('/documents', async (c) => {
  try {
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 20)
    const status = c.req.query('status')
    const drafterId = c.req.query('drafter_id')
    const docType = c.req.query('doc_type')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        ad.*,
        dt.name as doc_type_name,
        e.name as drafter_name,
        e.employee_number as drafter_employee_number,
        d.name as drafter_department
      FROM approval_documents ad
      LEFT JOIN approval_doc_types dt ON ad.doc_type_id = dt.id
      LEFT JOIN employees e ON ad.drafter_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `
    let params: any[] = []

    if (status) {
      query += ' AND ad.status = ?'
      params.push(status)
    }

    if (drafterId) {
      query += ' AND ad.drafter_id = ?'
      params.push(drafterId)
    }

    if (docType) {
      query += ' AND ad.doc_type_id = ?'
      params.push(docType)
    }

    query += ' ORDER BY ad.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const documents = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: documents.results })
  } catch (error) {
    console.error('Get approval documents error:', error)
    return c.json({ error: '결재 문서 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 결재 문서 상세 조회
approval.get('/documents/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const document = await c.env.DB.prepare(`
      SELECT 
        ad.*,
        dt.name as doc_type_name,
        dt.form_template,
        e.name as drafter_name,
        e.employee_number,
        d.name as department_name,
        p.name as position_name
      FROM approval_documents ad
      LEFT JOIN approval_doc_types dt ON ad.doc_type_id = dt.id
      LEFT JOIN employees e ON ad.drafter_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE ad.id = ?
    `).bind(id).first()

    if (!document) {
      return c.json({ error: '문서를 찾을 수 없습니다.' }, 404)
    }

    // 결재선 조회
    const approvalLines = await c.env.DB.prepare(`
      SELECT 
        al.*,
        e.name as approver_name,
        e.employee_number,
        d.name as department_name,
        p.name as position_name
      FROM approval_lines al
      LEFT JOIN employees e ON al.approver_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE al.document_id = ?
      ORDER BY al.step_order
    `).bind(id).all()

    // 첨부파일 조회
    const attachments = await c.env.DB.prepare(`
      SELECT * FROM approval_attachments WHERE document_id = ?
    `).bind(id).all()

    return c.json({
      success: true,
      data: {
        ...document,
        approval_lines: approvalLines.results,
        attachments: attachments.results
      }
    })
  } catch (error) {
    console.error('Get approval document error:', error)
    return c.json({ error: '결재 문서 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 결재 문서 작성
approval.post('/documents', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.doc_type_id || !data.title || !data.content || !data.drafter_id) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    // 문서 번호 생성 (예: APR-20231231-001)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM approval_documents WHERE substr(doc_number, 5, 8) = ?'
    ).bind(today).first()
    const seq = String((countResult?.count as number || 0) + 1).padStart(3, '0')
    const docNumber = `APR-${today}-${seq}`

    const result = await c.env.DB.prepare(`
      INSERT INTO approval_documents (
        doc_type_id, doc_number, title, content, drafter_id, status, urgency
      ) VALUES (?, ?, ?, ?, ?, 'draft', ?)
    `).bind(
      data.doc_type_id, docNumber, data.title, JSON.stringify(data.content),
      data.drafter_id, data.urgency || 'normal'
    ).run()

    const documentId = result.meta.last_row_id

    // 결재선 추가
    if (data.approval_lines && Array.isArray(data.approval_lines)) {
      for (let i = 0; i < data.approval_lines.length; i++) {
        const line = data.approval_lines[i]
        await c.env.DB.prepare(`
          INSERT INTO approval_lines (document_id, approver_id, step_order, approval_type, status)
          VALUES (?, ?, ?, ?, 'pending')
        `).bind(documentId, line.approver_id, i + 1, line.approval_type || 'approval').run()
      }
    }

    return c.json({
      success: true,
      data: { id: documentId, doc_number: docNumber, ...data }
    }, 201)
  } catch (error) {
    console.error('Create approval document error:', error)
    return c.json({ error: '결재 문서 작성 중 오류가 발생했습니다.' }, 500)
  }
})

// 결재 문서 상신 (제출)
approval.post('/documents/:id/submit', async (c) => {
  try {
    const id = c.req.param('id')
    const now = new Date().toISOString()

    const result = await c.env.DB.prepare(`
      UPDATE approval_documents SET
        status = 'pending',
        current_step = 1,
        submitted_at = ?,
        updated_at = datetime('now')
      WHERE id = ? AND status = 'draft'
    `).bind(now, id).run()

    if (result.meta.changes === 0) {
      return c.json({ error: '문서를 상신할 수 없습니다.' }, 400)
    }

    return c.json({ success: true, message: '문서가 상신되었습니다.' })
  } catch (error) {
    console.error('Submit document error:', error)
    return c.json({ error: '문서 상신 중 오류가 발생했습니다.' }, 500)
  }
})

// 결재 승인/반려
approval.post('/documents/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const { approver_id, action, comments } = await c.req.json()

    if (!['approve', 'reject'].includes(action)) {
      return c.json({ error: '올바르지 않은 액션입니다.' }, 400)
    }

    // 문서 정보 조회
    const document = await c.env.DB.prepare(
      'SELECT * FROM approval_documents WHERE id = ?'
    ).bind(id).first()

    if (!document || document.status !== 'pending') {
      return c.json({ error: '결재할 수 없는 문서입니다.' }, 400)
    }

    // 현재 결재 단계의 결재선 조회
    const currentLine = await c.env.DB.prepare(`
      SELECT * FROM approval_lines 
      WHERE document_id = ? AND step_order = ? AND approver_id = ? AND status = 'pending'
    `).bind(id, document.current_step, approver_id).first()

    if (!currentLine) {
      return c.json({ error: '결재 권한이 없습니다.' }, 403)
    }

    const now = new Date().toISOString()

    // 결재선 업데이트
    await c.env.DB.prepare(`
      UPDATE approval_lines SET
        status = ?,
        comments = ?,
        approved_at = ?
      WHERE id = ?
    `).bind(action === 'approve' ? 'approved' : 'rejected', comments, now, currentLine.id).run()

    if (action === 'reject') {
      // 반려 처리
      await c.env.DB.prepare(`
        UPDATE approval_documents SET
          status = 'rejected',
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(id).run()

      return c.json({ success: true, message: '문서가 반려되었습니다.' })
    } else {
      // 승인 처리 - 다음 결재자가 있는지 확인
      const nextLine = await c.env.DB.prepare(`
        SELECT * FROM approval_lines 
        WHERE document_id = ? AND step_order > ? AND status = 'pending'
        ORDER BY step_order
        LIMIT 1
      `).bind(id, document.current_step).first()

      if (nextLine) {
        // 다음 결재 단계로 이동
        await c.env.DB.prepare(`
          UPDATE approval_documents SET
            current_step = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).bind(nextLine.step_order, id).run()

        return c.json({ success: true, message: '승인되었습니다. 다음 결재자에게 전달됩니다.' })
      } else {
        // 최종 승인
        await c.env.DB.prepare(`
          UPDATE approval_documents SET
            status = 'approved',
            completed_at = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).bind(now, id).run()

        return c.json({ success: true, message: '최종 승인되었습니다.' })
      }
    }
  } catch (error) {
    console.error('Approve document error:', error)
    return c.json({ error: '결재 처리 중 오류가 발생했습니다.' }, 500)
  }
})

// 내가 결재할 문서 목록
approval.get('/my-approvals', async (c) => {
  try {
    const approverId = c.req.query('approver_id')
    if (!approverId) {
      return c.json({ error: '결재자 ID가 필요합니다.' }, 400)
    }

    const documents = await c.env.DB.prepare(`
      SELECT 
        ad.*,
        dt.name as doc_type_name,
        e.name as drafter_name,
        al.step_order,
        al.status as my_status
      FROM approval_documents ad
      INNER JOIN approval_lines al ON ad.id = al.document_id
      LEFT JOIN approval_doc_types dt ON ad.doc_type_id = dt.id
      LEFT JOIN employees e ON ad.drafter_id = e.id
      WHERE al.approver_id = ? AND ad.status = 'pending' AND al.step_order = ad.current_step
      ORDER BY ad.urgency DESC, ad.submitted_at ASC
    `).bind(approverId).all()

    return c.json({ success: true, data: documents.results })
  } catch (error) {
    console.error('Get my approvals error:', error)
    return c.json({ error: '결재 대기 문서 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// ============================================
// 결재 문서 유형 API
// ============================================

// 문서 유형 목록
approval.get('/doc-types', async (c) => {
  try {
    const types = await c.env.DB.prepare(
      'SELECT * FROM approval_doc_types WHERE is_active = 1 ORDER BY code'
    ).all()

    return c.json({ success: true, data: types.results })
  } catch (error) {
    console.error('Get doc types error:', error)
    return c.json({ error: '문서 유형 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 문서 유형 상세
approval.get('/doc-types/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const docType = await c.env.DB.prepare(
      'SELECT * FROM approval_doc_types WHERE id = ?'
    ).bind(id).first()

    if (!docType) {
      return c.json({ error: '문서 유형을 찾을 수 없습니다.' }, 404)
    }

    return c.json({ success: true, data: docType })
  } catch (error) {
    console.error('Get doc type error:', error)
    return c.json({ error: '문서 유형 조회 중 오류가 발생했습니다.' }, 500)
  }
})

export default approval
