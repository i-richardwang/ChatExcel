import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import type { AnalysisRequest, ApiResponse, AssistantResponse } from '@/types/chatexcel'

// 获取客户端IP
function getClientIp(headers: Headers): string {
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  return '0.0.0.0';
}

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

    const { userId } = await auth();
    const ip = getClientIp(headers());
    const operationType = data.mode === 'pro' ? 'pro' : 'basic';

    // 创建数据库客户端
    const supabase = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 直接在这里检查操作权限
    const { data: checkResult, error: checkError } = await supabase
      .rpc('is_operation_allowed', {
        p_user_id: userId || null,
        p_ip_address: userId ? null : ip,
        p_operation_type: operationType
      });

    if (checkError) {
      console.error('Failed to check operation:', checkError);
      return NextResponse.json<ApiResponse<AssistantResponse>>({
        data: null,
        error: {
          detail: '系统错误',
          status_code: 500
        }
      }, { status: 500 });
    }

    if (!checkResult) {
      return NextResponse.json<ApiResponse<AssistantResponse>>({
        data: null,
        error: {
          detail: `您的${operationType === 'pro' ? 'Pro' : '基础'}操作额度已用完`,
          status_code: 403
        }
      }, { status: 403 });
    }

    // 创建操作记录
    const { data: operationLog, error: logError } = await supabase
      .from('operations_log')
      .insert({
        user_id: userId || null,
        ip_address: userId ? null : ip,
        operation_type: operationType,
        request_payload: data,
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create operation log:', logError);
      return NextResponse.json<ApiResponse<AssistantResponse>>({
        data: null,
        error: {
          detail: '系统错误',
          status_code: 500
        }
      }, { status: 500 });
    }

    // 调用AI API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/basic-datalab/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    // 更新操作记录
    const { error: updateError } = await supabase
      .from('operations_log')
      .update({
        status: response.ok ? 'success' : 'error',
        response_payload: result,
        error_message: !response.ok ? result?.error?.message : null
      })
      .eq('id', operationLog.id);

    if (updateError) {
      console.error('Failed to update operation log:', updateError);
    }

    if (!response.ok) {
      return NextResponse.json<ApiResponse<AssistantResponse>>({
        data: null,
        error: {
          detail: result.message || '分析服务暂时不可用',
          status_code: response.status
        }
      }, { status: response.status });
    }

    return NextResponse.json<ApiResponse<AssistantResponse>>({ data: result });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json<ApiResponse<AssistantResponse>>({
      data: null,
      error: {
        detail: error instanceof Error ? error.message : '服务器内部错误',
        status_code: 500
      }
    }, { status: 500 });
  }
}