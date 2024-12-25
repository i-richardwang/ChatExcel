import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { auth } from '@clerk/nextjs/server';

// 获取客户端IP
function getClientIp(headers: Headers): string {
  // 优先从 Cloudflare 或其他CDN的headers中获取
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // 从 X-Forwarded-For 获取
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  // 从 X-Real-IP 获取
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  // 如果都没有，返回一个占位符
  return '0.0.0.0';
}

export async function POST(req: Request) {
  try {
    const { operationType } = await req.json();
    
    if (!operationType || !['basic', 'pro'].includes(operationType)) {
      return NextResponse.json({
        allowed: false,
        error: 'Invalid operation type'
      }, { status: 400 });
    }

    // 创建数据库客户端
    const supabase = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 获取当前用户信息（如果已登录）
    const { userId } = await auth();
    
    // 获取客户端IP（用于未登录用户）
    const ip = getClientIp(headers());

    if (!userId && !ip) {
      return NextResponse.json({
        allowed: false,
        error: 'Cannot identify user'
      }, { status: 400 });
    }

    // 检查操作是否允许
    const { data: checkResult, error: checkError } = await supabase
      .rpc('is_operation_allowed', {
        p_user_id: userId || null,
        p_ip_address: userId ? null : ip,
        p_operation_type: operationType
      });

    if (checkError) {
      console.error('Operation check error:', checkError);
      return NextResponse.json({
        allowed: false,
        error: 'Failed to check operation permissions'
      }, { status: 500 });
    }

    // 如果是未登录用户，更新或创建访客记录
    if (!userId) {
      const { error: guestError } = await supabase
        .from('guest_users')
        .upsert({
          ip_address: ip,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'ip_address'
        });

      if (guestError) {
        console.error('Guest user update error:', guestError);
      }
    }

    // 获取当月已使用次数
    const { data: usageCount, error: usageError } = await supabase
      .rpc('get_monthly_operation_count', {
        p_user_id: userId || null,
        p_ip_address: userId ? null : ip,
        p_operation_type: operationType
      });

    if (usageError) {
      console.error('Usage count error:', usageError);
      return NextResponse.json({
        allowed: false,
        error: 'Failed to get usage count'
      }, { status: 500 });
    }

    // 如果是已登录用户，获取订阅信息
    let subscriptionTier = 'none';
    if (userId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('User data fetch error:', userError);
      } else if (userData) {
        subscriptionTier = userData.subscription_tier;
      }
    }

    // 计算剩余额度
    let totalQuota = 3; // 默认访客配额
    if (subscriptionTier === 'basic') {
      totalQuota = operationType === 'basic' ? 500 : 0;
    } else if (subscriptionTier === 'pro' || subscriptionTier === 'lifetime') {
      totalQuota = operationType === 'basic' ? 1000 : 100;
    }

    return NextResponse.json({
      allowed: checkResult,
      remainingQuota: Math.max(0, totalQuota - usageCount),
      totalQuota,
      usedQuota: usageCount,
      subscriptionTier
    });
    
  } catch (error) {
    console.error('Check operation error:', error);
    return NextResponse.json({
      allowed: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}