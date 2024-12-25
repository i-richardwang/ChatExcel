import { useUser } from '@clerk/nextjs';
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface QuotaInfo {
  remainingQuota: number;
  totalQuota: number;
  usedQuota: number;
  subscriptionTier: string;
}

interface UsageQuotaProps {
  basicQuota: QuotaInfo;
  proQuota: QuotaInfo | null;
  isProMode: boolean;
}

export function UsageQuota({ basicQuota, proQuota, isProMode }: UsageQuotaProps) {
  const { isSignedIn } = useUser();
  const currentQuota = isProMode && proQuota ? proQuota : basicQuota;
  const percentageUsed = (currentQuota.usedQuota / currentQuota.totalQuota) * 100;

  const getQuotaMessage = () => {
    if (!isSignedIn) {
      return "Guest users get 3 free basic operations. Sign in to get more!";
    }

    switch (currentQuota.subscriptionTier) {
      case 'basic':
        return "500 basic operations per month included in your Basic plan.";
      case 'pro':
      case 'lifetime':
        return isProMode
          ? "100 pro operations per month included in your Pro plan."
          : "1,000 basic operations per month included in your Pro plan.";
      default:
        return "Sign up for a plan to get more operations!";
    }
  };

  const getProgressColor = () => {
    if (percentageUsed >= 90) return "bg-red-500";
    if (percentageUsed >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">
            {isProMode ? "Pro Operations" : "Basic Operations"}
          </Label>
          <HoverCard>
            <HoverCardTrigger>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <p className="text-sm">{getQuotaMessage()}</p>
                {!isSignedIn && (
                  <p className="text-sm text-muted-foreground">
                    Your usage is tracked by IP address when not signed in.
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentQuota.remainingQuota} left of {currentQuota.totalQuota}
        </span>
      </div>
      <Progress 
        value={percentageUsed} 
        className="h-2"
        indicatorClassName={getProgressColor()}
      />
      {percentageUsed >= 90 && (
        <p className="text-sm text-red-500">
          You're running low on {isProMode ? "pro" : "basic"} operations!
          {currentQuota.subscriptionTier === 'none' && " Consider upgrading to get more."}
        </p>
      )}
    </div>
  );
}