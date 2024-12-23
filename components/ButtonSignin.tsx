/* eslint-disable @next/next/no-img-element */
"use client";

import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import Link from "next/link";
import config from "@/config";

const ButtonSignin = ({
  text = "Sign In",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
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
