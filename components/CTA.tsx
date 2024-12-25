"use client";

import Section from "@/components/section";
import ButtonTry from "@/components/ButtonTry";
import { cn } from "@/libs/utils";
import { useUser } from '@clerk/nextjs';

const CTA = () => {
  const { user } = useUser();

  return (
    <Section
      title={user ? "Ready to Continue Your Work?" : "Ready to Transform Your Excel Workflow?"}
      subtitle={user ? "Your workspace is waiting for you." : "Automate your Excel tasks effortlessly."}
      className="bg-gradient-to-b from-green-500/5 to-green-500/10 rounded-3xl py-16"
    >
      <div className="flex flex-col w-full sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-8">
        <ButtonTry
          text={user ? "Continue to Dashboard" : undefined}
          extraStyle={cn(
            "bg-black text-white shadow hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
            "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-8 py-2 text-base font-semibold tracking-tighter",
            "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
          )}
        />
      </div>
    </Section>
  );
};

export default CTA;
