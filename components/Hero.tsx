"use client";

import TestimonialsAvatars from "./TestimonialsAvatars";
import WordRotate from "@/components/ui/word-rotate";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/libs/utils";
import ButtonSignin from "./ButtonSignin";
import ButtonTry from "./ButtonTry";
import { useUser } from '@clerk/nextjs';

const Hero = () => {
  const { isLoaded, user } = useUser();
  const fadeInRef = useRef(null);
  const fadeInInView = useInView(fadeInRef, {
    once: true,
  });

  const fadeUpVariants = {
    initial: {
      opacity: 0,
      y: 24,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section id="hero" className="bg-background min-h-fit flex items-center justify-center pb-4 md:pb-8">
      <div className="container relative z-10 flex flex-col items-center justify-center px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.h1
            ref={fadeInRef}
            className="text-balance flex flex-col items-center gap-4 text-5xl font-extrabold leading-none tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            initial={false}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.21, 0.47, 0.32, 0.98],
              type: "spring",
            }}
          >
            <span>Say Goodbye to</span>
            <WordRotate
              className="text-white px-4 py-1 rounded-lg bg-gradient-to-r from-[hsl(142.1,76.2%,36.3%)] to-[hsl(142.1,76.2%,36.3%)]/80"
              words={[
                "Tedious VLOOKUP",
                "Pivot Tables",
                "Data Cleaning",
                "Chart Tweaking",
                "Formula Errors",
                "Merge Conflicts",
              ]}
            />
          </motion.h1>

          <motion.p
            className="text-balance max-w-3xl text-lg opacity-90 leading-relaxed tracking-tight text-gray-600 dark:text-gray-400 md:text-xl"
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            initial={false}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.21, 0.47, 0.32, 0.98],
              type: "spring",
            }}
          >
            Tired of wrestling with complex Excel tasks? Let AI turn your instructions into action. 
            Simplify everything from data analysis to visualization with just a few words.
          </motion.p>

          <motion.div
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            initial={false}
            transition={{
              duration: 0.6,
              delay: 0.3,
              ease: [0.21, 0.47, 0.32, 0.98],
              type: "spring",
            }}
            className="flex gap-4"
          >
            {!isLoaded ? null : user ? (
              <ButtonTry extraStyle={cn(
                "bg-black text-white shadow hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
                "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-8 py-2 text-base font-semibold tracking-tighter",
                "transform-gpu ring-offset-current transition-all duration-200 hover:ring-2 hover:ring-primary hover:ring-offset-2"
              )} />
            ) : (
              <>
                <ButtonSignin extraStyle={cn(
                  "btn btn-outline rounded-full",
                  "h-12 px-8"
                )} />
                <ButtonTry extraStyle={cn(
                  "bg-black text-white shadow hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
                  "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-8 py-2 text-base font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-200 hover:ring-2 hover:ring-primary hover:ring-offset-2"
                )} />
              </>
            )}
          </motion.div>

          <motion.div
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            initial={false}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0.21, 0.47, 0.32, 0.98],
              type: "spring",
            }}
          >
            <TestimonialsAvatars priority={true} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
