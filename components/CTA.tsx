"use client";

import ButtonTry from "@/components/ButtonTry";
import { cn } from "@/libs/utils";
import { useUser } from '@clerk/nextjs';

const CTA = () => {
  const { user } = useUser();

  return (
    <section className="bg-neutral-100 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-8 py-8 md:py-16">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wider text-green-500 mb-4">
            CALL TO ACTION
          </p>
          <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-6">
            {user ? "Ready to Continue Your Work?" : "Ready to Transform Your Excel Workflow?"}
          </h2>
          <p className="max-w-xl mx-auto text-lg opacity-90 leading-relaxed">
            {user ? "Your workspace is waiting for you." : "Automate your Excel tasks effortlessly."}
          </p>
          <div className="flex flex-col w-full sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <ButtonTry
              text={user ? "Continue to Dashboard" : undefined}
              extraStyle={cn(
                "bg-black text-white shadow hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
                "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-8 py-2 text-base font-semibold tracking-tighter",
                "transform-gpu ring-offset-current transition-all duration-200 hover:ring-2 hover:ring-primary hover:ring-offset-2"
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
