/* eslint-disable @next/next/no-img-element */
"use client";

import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import Link from "next/link";
import config from "@/config";

// A simple button to sign in with Clerk.
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = ({
  text = "Try ChatExcel Free",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const { isSignedIn, user } = useUser();

  if (isSignedIn) {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn px-6 py-3 text-base font-medium ${extraStyle ? extraStyle : ""}`}
      >
        <UserButton afterSignOutUrl="/" />
      </Link>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className={`btn px-6 py-3 text-base font-medium ${extraStyle ? extraStyle : ""}`}>
        {text}
      </button>
    </SignInButton>
  );
};

export default ButtonSignin;
