"use client";

import { cn } from "@/libs/utils";
import { motion } from "framer-motion";

const features = [
  {
    title: "Browser-Based Processing",
    description:
      "All Excel operations happen right in your browser. Your data never leaves your device, ensuring complete privacy and security of your sensitive business information.",
    className: "hover:bg-green-500/10 transition-all duration-500 ease-out",
  },
  {
    title: "Natural Language Commands",
    description:
      "Simply describe what you need in plain English. Transform, merge, and analyze Excel data without remembering complex formulas or keyboard shortcuts.",
    className:
      "order-3 xl:order-none hover:bg-green-500/10 transition-all duration-500 ease-out",
  },
  {
    title: "Instant Excel Operations",
    description:
      "Automate tedious tasks like VLOOKUP, pivot tables, and data consolidation in seconds. Focus on analyzing results instead of manual data manipulation.",
    className:
      "md:row-span-2 hover:bg-green-500/10 transition-all duration-500 ease-out",
  },
  {
    title: "Focused on Real Tasks",
    description:
      "We don't try to be your data scientist - we're your automation expert. While others promise vague AI insights, we focus on eliminating the Excel tasks that slow you down every day.",
    className:
      "flex-row order-4 md:col-span-2 md:flex-row xl:order-none hover:bg-green-500/10 transition-all duration-500 ease-out",
  },
];

export default function Component() {
  return (
    <section className="bg-neutral-100 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-8 py-8 md:py-16">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-wider text-green-500 mb-4">
            SOLUTION
          </p>
          <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-6">
            Privacy-First Automation for Practical Tasks
          </h2>
          <p className="max-w-xl mx-auto text-lg opacity-90 leading-relaxed">
            We focus solely on what matters - automating your repetitive daily tasks while keeping your data completely private. No false promises, just real productivity gains.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-sm grid-cols-1 gap-6 text-gray-500 md:max-w-3xl md:grid-cols-2 xl:grid-rows-2 md:grid-rows-3 xl:max-w-6xl xl:auto-rows-fr xl:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={cn(
                "group relative items-start bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl",
                feature.className
              )}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 30,
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
            >
              <div>
                <h3 className="font-semibold mb-2 text-primary">
                  {feature.title}
                </h3>
                <p className="text-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
