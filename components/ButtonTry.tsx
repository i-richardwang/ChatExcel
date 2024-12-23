/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

const ButtonTry = ({
  text = "Try ChatExcel Free",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  return (
    <Link
      href="/dashboard"
      className={`btn px-6 py-3 text-base font-medium ${extraStyle ? extraStyle : ""}`}
    >
      {text}
    </Link>
  );
};

export default ButtonTry; 