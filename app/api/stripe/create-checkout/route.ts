import { createCheckout } from "@/libs/stripe";
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "edge";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to make a purchase." },
        { status: 401 }
      );
    }

    // Get user's email from Clerk
    const user = await currentUser();
    const email = user.emailAddresses[0].emailAddress;

    // Create a private supabase client using the secret service_role API key
    const supabase = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get customer_id from Supabase if exists
    const { data } = await supabase
      .from("users")
      .select("customer_id")
      .eq("id", userId)
      .single();

    // 获取用户当前订阅状态
    const { data: userData } = await supabase
      .from("users")
      .select("subscription_tier, subscription_status")
      .eq("id", userId)
      .single();

    // 如果用户已经有 lifetime 订阅，不允许再次购买
    if (userData?.subscription_tier === 'lifetime') {
      return NextResponse.json(
        { error: "You already have a lifetime subscription." },
        { status: 400 }
      );
    }

    // 如果用户有活跃的订阅，且尝试购买新的订阅，提示先取消当前订阅
    if (
      userData?.subscription_status === 'active' && 
      body.mode === 'subscription'
    ) {
      return NextResponse.json(
        { error: "Please cancel your current subscription before starting a new one." },
        { status: 400 }
      );
    }

    const { priceId, mode, successUrl, cancelUrl } = body;

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
      clientReferenceId: userId,
      user: {
        email,
        // If the user has already purchased, it will automatically prefill it's credit card
        customerId: data?.customer_id,
      },
      // If you send coupons from the frontend, you can pass it here
      // couponId: body.couponId,
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
