import { NextResponse, NextRequest } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { createCustomerPortal } from "@/libs/stripe";
import { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    const body = await req.json();

    // User who are not logged in can't make a purchase
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to view billing information." },
        { status: 401 }
      );
    } else if (!body.returnUrl) {
      return NextResponse.json(
        { error: "Return URL is required" },
        { status: 400 }
      );
    }

    // Create a private supabase client using the secret service_role API key
    const supabase = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get customer_id from Supabase
    const { data } = await supabase
      .from("users")
      .select("customer_id")
      .eq("id", userId)
      .single();

    if (!data?.customer_id) {
      return NextResponse.json(
        {
          error: "You don't have a billing account yet. Make a purchase first.",
        },
        { status: 400 }
      );
    }

    const stripePortalUrl = await createCustomerPortal({
      customerId: data.customer_id,
      returnUrl: body.returnUrl,
    });

    return NextResponse.json({
      url: stripePortalUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
