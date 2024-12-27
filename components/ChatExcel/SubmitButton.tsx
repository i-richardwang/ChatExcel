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
        <DialogContent className="max-w-4xl">
          <Pricing />
        </DialogContent>
      </Dialog>
    </>
  );
} 