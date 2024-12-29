import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { useQuota } from '@/hooks/use-quota';
import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Pricing from "@/components/Pricing";

interface SubmitButtonProps {
  onSubmit: () => Promise<void>;
  disabled?: boolean;
  analyzing?: boolean;
  proMode: boolean;
  hasInput: boolean;
}

export function SubmitButton({
  onSubmit,
  disabled = false,
  analyzing = false,
  proMode,
  hasInput
}: SubmitButtonProps) {
  const [showPricing, setShowPricing] = useState(false);
  const { isSignedIn } = useUser();
  const { basicQuota } = useQuota();

  const handleClick = async () => {
    // 如果用户未登录且已用完免费配额，显示定价页面
    if (!isSignedIn && basicQuota && basicQuota.remainingQuota === 0) {
      setShowPricing(true);
      return;
    }

    await onSubmit();
  };

  return (
    <>
      <Button
        size="sm"
        onClick={handleClick}
        disabled={disabled || analyzing || !hasInput}
        className="h-8 px-3 shadow-none bg-[#0d9488] hover:bg-[#0d9488]/90 text-white"
      >
        {analyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-4xl relative">
          <button
            onClick={() => setShowPricing(false)}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
          <Pricing onClose={() => setShowPricing(false)} hideCloseButton={true} />
        </DialogContent>
      </Dialog>
    </>
  );
} 