/* eslint-disable @next/next/no-img-element */
"use client";

import { useUser } from '@clerk/nextjs';
import Link from "next/link";

const ButtonTry = ({
  text,
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const { isLoaded, user } = useUser();

  // Default text based on user login status
  const buttonText = text || (user ? "Open Dashboard" : "Try ChatExcel Free");

  return (
    <Link
      href="/dashboard"
      className={`btn px-6 py-3 text-base font-medium ${extraStyle ? extraStyle : ""}`}
    >
      {buttonText}
    </Link>
  );
};

export default ButtonTry; 