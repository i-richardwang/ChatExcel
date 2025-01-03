import configFile from "@/config";
import { findCheckoutSession } from "@/libs/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SupabaseClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const runtime = "edge";

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = headers().get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        // 同时检查 priceId 和 yearlyPriceId
        const plan = configFile.stripe.plans.find((p) => 
          p.priceId === priceId || p.yearlyPriceId === priceId
        );

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!plan) break;

        // Update the user's subscription info in Supabase
        await supabase
          .from("users")
          .update({
            customer_id: customerId,
            price_id: priceId,
            subscription_tier: plan.name.toLowerCase(),
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: stripeObject.mode === 'subscription' ? 
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30天后
              null // lifetime 计划不需要结束时间
          })
          .eq("id", userId);

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        
        const stripeObject: Stripe.Subscription = event.data.object as Stripe.Subscription;
        const customerId = stripeObject.customer;
        const priceId = stripeObject.items.data[0].price.id;
        
        // 同时检查 priceId 和 yearlyPriceId
        const plan = configFile.stripe.plans.find((p) => 
          p.priceId === priceId || p.yearlyPriceId === priceId
        );

        if (!plan) {
          console.error('No matching plan found for priceId:', priceId);
          break;
        }

        // Update subscription info in Supabase

        const { data, error } = await supabase
          .from("users")
          .update({
            price_id: priceId,
            subscription_tier: plan.name.toLowerCase(),
            subscription_status: stripeObject.status,
            subscription_end_date: new Date(stripeObject.current_period_end * 1000).toISOString()
          })
          .eq("customer_id", customerId)
          .select();

        if (error) {
          console.error('Error updating Supabase:', error);
          throw error;
        }

        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        const stripeObject: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        // Revoke access in Supabase
        await supabase
          .from("users")
          .update({ 
            subscription_status: 'canceled',
            subscription_end_date: new Date().toISOString()
          })
          .eq("customer_id", subscription.customer);

        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;

        // Find profile where customer_id equals the customerId
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("customer_id", customerId)
          .single();

        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        if (profile.price_id !== priceId) break;

        // Grant access in Supabase
        await supabase
          .from("users")
          .update({ 
            subscription_status: 'active',
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 续费后延长30天
          })
          .eq("customer_id", customerId);

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error("stripe error: ", e.message);
  }

  return NextResponse.json({});
}
