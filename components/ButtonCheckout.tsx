"use client";

import { useState } from "react";
import apiClient from "@/libs/api";
import config from "@/config";
import { useUser, SignInButton } from '@clerk/nextjs';

// This component is used to create Stripe Checkout Sessions
// It calls the /api/stripe/create-checkout route with the priceId, successUrl and cancelUrl
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
// You can also change the mode to "subscription" if you want to create a subscription instead of a one-time payment
interface ButtonCheckoutProps {
  priceId: string;
  mode?: "payment" | "subscription";
  className?: string;
  children?: React.ReactNode;
}

const ButtonCheckout = ({ priceId, mode = "subscription", className, children }: ButtonCheckoutProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isSignedIn } = useUser();

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          priceId,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
          mode,
        }
      );

      window.location.href = url;
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  // 如果用户未登录，显示登录按钮
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className={`btn ${className}`}>
          {children}
        </button>
      </SignInButton>
    );
  }

  // 用户已登录，显示正常的支付按钮
  return (
    <button
      onClick={handlePayment}
      className={`btn ${className}`}
    >
      {children}
    </button>
  );
};

export default ButtonCheckout;
