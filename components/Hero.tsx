"use client";

import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";
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
    <section id="hero" className="relative flex items-center justify-center overflow-hidden -mt-[120px] pt-[120px]">
      <div
        className={cn(
          "absolute inset-0 top-0 h-full w-full transform-gpu [filter:blur(120px)]",
          "[background-image:linear-gradient(to_bottom,hsl(142.1_76.2%_36.3%),transparent_50%)]",
          "dark:[background-image:linear-gradient(to_bottom,#ffffff,transparent_50%)]"
        )}
      />
      
      <div className="container relative z-10 flex flex-col items-center justify-center px-8 py-14">
        <div className="flex flex-col items-center gap-6 pb-8 text-center">
          <motion.h1
            ref={fadeInRef}
            className="text-balance flex flex-col items-center gap-4 bg-gradient-to-br from-black from-30% to-black/60 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent dark:from-white dark:to-white/40 sm:text-6xl md:text-7xl lg:text-8xl"
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
            className="text-balance text-lg tracking-tight text-gray-400 md:text-xl max-w-3xl"
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
                "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
              )} />
            ) : (
              <>
                <ButtonSignin extraStyle={cn(
                  "bg-transparent text-foreground shadow hover:bg-gray-100 dark:hover:bg-gray-800",
                  "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-8 py-2 text-base font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                )} />
                <ButtonTry extraStyle={cn(
                  "bg-black text-white shadow hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
                  "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-8 py-2 text-base font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
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
