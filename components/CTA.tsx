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
      subtitle={user ? "Your workspace is waiting for you." : "Join thousands of professionals who've automated their daily Excel tasks."}
      className="bg-green-500/10 rounded-xl py-16"
    >
      <div className="flex flex-col w-full sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
        <ButtonTry
          text={user ? "Continue to Dashboard" : undefined}
          extraStyle={cn(
            "w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white flex gap-2 py-6 text-lg font-semibold"
          )}
        />
      </div>
    </Section>
  );
};

export default CTA;
