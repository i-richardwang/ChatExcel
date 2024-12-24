import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // 获取 webhook 签名信息
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // 获取请求头
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // 如果没有签名信息，返回错误
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // 获取 raw body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // 创建新的 Svix 实例来验证 webhook
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // 验证 webhook 签名
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // 创建 Supabase 客户端
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 处理不同的 webhook 事件
  const eventType = evt.type;
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, ...attributes } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error('No email found for user:', id);
      return new Response('No email found for user', {
        status: 400
      });
    }

    try {
      // 使用 upsert 操作 - 如果用户存在则更新，不存在则创建
      const { error } = await supabase
        .from('users')
        .upsert({
          id,
          email,
          clerk_data: attributes,
          subscription_tier: 'none',  // 新用户默认无订阅
          subscription_status: 'incomplete',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      return NextResponse.json({
        message: `User ${eventType === 'user.created' ? 'created' : 'updated'} successfully`
      });
      
    } catch (error) {
      console.error('Error upserting user:', error);
      return new Response('Error upserting user', {
        status: 500
      });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', evt.data.id);

      if (error) throw error;

      return NextResponse.json({
        message: 'User deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', {
        status: 500
      });
    }
  }

  return NextResponse.json({
    message: `Webhook received: ${eventType}`
  });
} 