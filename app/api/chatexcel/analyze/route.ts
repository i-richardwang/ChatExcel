import { NextResponse } from 'next/server'
import type { AnalysisRequest, ApiResponse, AssistantResponse } from '@/types/chatexcel'

export async function POST(req: Request) {
  try {
    const data: AnalysisRequest = await req.json()
    
    // 验证请求数据
    if (!data.user_input || !data.table_info || Object.keys(data.table_info).length === 0) {
      return NextResponse.json<ApiResponse<AssistantResponse>>({
        data: null,
        error: {
          detail: '请求参数不完整',
          status_code: 400
        }
      }, { status: 400 })
    }

    // 调用AI API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/basic-datalab/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json<ApiResponse<AssistantResponse>>({
        data: null,
        error: {
          detail: error.message || '分析服务暂时不可用',
          status_code: response.status
        }
      }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json<ApiResponse<AssistantResponse>>({ data: result })
  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json<ApiResponse<AssistantResponse>>({
      data: null,
      error: {
        detail: error instanceof Error ? error.message : '服务器内部错误',
        status_code: 500
      }
    }, { status: 500 })
  }
} 