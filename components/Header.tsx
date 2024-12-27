"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import ButtonTry from "./ButtonTry";
import logo from "@/app/icon.svg";
import config from "@/config";
import { cn } from "@/libs/utils";

export function useScrollY() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

const Header = () => {
  const scrollY = useScrollY();
  const { theme } = useTheme();
  const [active, setActive] = useState(false);
  const searchParams = useSearchParams();

  const navLinks = useMemo(
    () => [
      { id: 1, label: "Features", link: "/#features" },
      { id: 2, label: "Examples", link: "/#examples" },
      { id: 3, label: "Pricing", link: "/#pricing" },
    ],
    []
  );

  useEffect(() => {
    setActive(false);
  }, [searchParams]);

  return (
    <header className="sticky top-0 z-50 px-10 py-7 xl:px-0">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between">
        <Link
          className="flex items-center gap-3 shrink-0"
          href="/"
          title={`${config.appName} homepage`}
        >
          <motion.div
            animate={{
              y: scrollY >= 120 ? -50 : 0,
              opacity: scrollY >= 120 ? 0 : 1,
            }}
            transition={{ duration: 0.15 }}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-10 h-10"
              // placeholder="blur"
              priority={true}
              width={40}
              height={40}
            />
          </motion.div>
          <motion.span
            className="font-bold text-xl"
            animate={{
              y: scrollY >= 120 ? -50 : 0,
              opacity: scrollY >= 120 ? 0 : 1,
            }}
            transition={{ duration: 0.15 }}
          >
            {config.appName}
          </motion.span>
        </Link>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ x: 0 }}
            animate={{
              boxShadow:
                scrollY >= 120
                  ? theme === "dark"
                    ? "0 0 0 1px rgba(255,255,255,.08), 0 1px 2px -1px rgba(255,255,255,.08), 0 2px 4px rgba(255,255,255,.04)"
                    : "0 0 0 1px rgba(17,24,28,.08), 0 1px 2px -1px rgba(17,24,28,.08), 0 2px 4px rgba(17,24,28,.04)"
                  : "none",
            }}
            transition={{
              ease: "linear",
              duration: 0.05,
              delay: 0.05,
            }}
            className={cn(
              "hidden md:flex h-14 items-center justify-center overflow-hidden rounded-full px-8 py-3 transition-all",
              scrollY >= 120 ? "bg-background" : "bg-transparent"
            )}
          >
            <nav className="relative h-full items-center justify-between gap-x-4 flex">
              <ul className="flex h-full items-center justify-center gap-x-8">
                {navLinks.map((link) => (
                  <li
                    key={link.id}
                    className="flex items-center justify-center"
                  >
                    <Link href={link.link} className="link link-hover text-base">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: scrollY >= 120 ? "auto" : 0,
              }}
              transition={{
                ease: "linear",
                duration: 0.25,
                delay: 0.05,
              }}
              className="!hidden overflow-hidden rounded-full md:!block"
            >
              <AnimatePresence>
                {scrollY >= 120 && (
                  <motion.div
                    initial={{ x: "125%" }}
                    animate={{ x: "0" }}
                    exit={{
                      x: "125%",
                      transition: { ease: "linear", duration: 1 },
                    }}
                    transition={{ ease: "linear", duration: 0.3 }}
                    className="shrink-0 whitespace-nowrap pl-8"
                  >
                    <ButtonTry extraStyle="bg-[hsl(142.1,76.2%,36.3%)] hover:bg-[hsl(142.1,76.2%,36.3%)]/90 text-white rounded-full border-0" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="z-[999] hidden items-center md:flex gap-4"
          animate={{
            y: scrollY >= 120 ? -50 : 0,
            opacity: scrollY >= 120 ? 0 : 1,
          }}
          transition={{ duration: 0.15 }}
        >
          <ButtonSignin extraStyle="btn btn-outline rounded-full h-12 px-8" />
          <ButtonTry extraStyle="bg-[hsl(142.1,76.2%,36.3%)] hover:bg-[hsl(142.1,76.2%,36.3%)]/90 text-white rounded-full border-0" />
        </motion.div>

        <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
          <motion.button
            onClick={() => setActive((prev) => !prev)}
            animate={active ? "open" : "close"}
            className="relative flex h-8 w-8 items-center justify-center rounded-md md:hidden"
          >
            <motion.span
              style={{ left: "50%", top: "35%", x: "-50%", y: "-50%" }}
              className="absolute h-0.5 w-5 bg-foreground"
              variants={{
                open: {
                  rotate: ["0deg", "0deg", "45deg"],
                  top: ["35%", "50%", "50%"],
                },
                close: {
                  rotate: ["45deg", "0deg", "0deg"],
                  top: ["50%", "50%", "35%"],
                },
              }}
            />
            <motion.span
              style={{ left: "50%", top: "50%", x: "-50%", y: "-50%" }}
              className="absolute h-0.5 w-5 bg-foreground"
              variants={{
                open: {
                  opacity: 0,
                },
                close: {
                  opacity: 1,
                },
              }}
            />
            <motion.span
              style={{ left: "50%", bottom: "30%", x: "-50%", y: "-50%" }}
              className="absolute h-0.5 w-5 bg-foreground"
              variants={{
                open: {
                  rotate: ["0deg", "0deg", "-45deg"],
                  top: ["65%", "50%", "50%"],
                },
                close: {
                  rotate: ["-45deg", "0deg", "0deg"],
                  top: ["50%", "50%", "65%"],
                },
              }}
            />
          </motion.button>
        </MotionConfig>

        {/* Mobile menu */}
        <div className={`relative z-50 ${active ? "" : "hidden"}`}>
          <div className="fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-background sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300">
            <div className="flex items-center justify-between">
              <Link
                className="flex items-center gap-3 shrink-0"
                title={`${config.appName} homepage`}
                href="/"
              >
                <Image
                  src={logo}
                  alt={`${config.appName} logo`}
                  className="w-10 h-10"
                  // placeholder="blur"
                  priority={true}
                  width={40}
                  height={40}
                />
                <span className="font-bold text-xl">{config.appName}</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5"
                onClick={() => setActive(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flow-root mt-6">
              <div className="py-4">
                <div className="flex flex-col gap-y-4 items-start">
                  {navLinks.map((link) => (
                    <Link
                      href={link.link}
                      key={link.id}
                      className="link link-hover text-base"
                      title={link.label}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="divider" />
              <div className="flex flex-col gap-4">
                <ButtonSignin extraStyle="btn btn-outline rounded-full h-12 px-8" />
                <ButtonTry extraStyle="bg-[hsl(142.1,76.2%,36.3%)] hover:bg-[hsl(142.1,76.2%,36.3%)]/90 text-white rounded-full border-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
