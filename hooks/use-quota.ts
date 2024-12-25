import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { useUser } from '@clerk/nextjs';

interface QuotaInfo {
  allowed: boolean;
  remainingQuota: number;
  totalQuota: number;
  usedQuota: number;
  subscriptionTier: string;
  error?: string;
}

interface UseQuotaReturn {
  basicQuota: QuotaInfo | null;
  proQuota: QuotaInfo | null;
  checkQuota: (operationType: 'basic' | 'pro') => Promise<boolean>;
  isLoading: boolean;
  refreshQuota: () => Promise<void>;
}

export function useQuota(): UseQuotaReturn {
  const [basicQuota, setBasicQuota] = useState<QuotaInfo | null>(null);
  const [proQuota, setProQuota] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isSignedIn } = useUser();

  // 检查用户是否有 pro 权限
  const hasProAccess = useCallback((tier?: string): boolean => {
    return tier === 'pro' || tier === 'lifetime';
  }, []);

  // 静默获取配额信息（不显示错误提示）
  const fetchQuota = useCallback(async (operationType: 'basic' | 'pro'): Promise<QuotaInfo | null> => {
    try {
      const response = await fetch('/api/chatexcel/check-operation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operationType }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch quota:', error);
      return null;
    }
  }, []);

  // 检查配额（显示错误提示）
  const checkQuota = useCallback(async (operationType: 'basic' | 'pro'): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 检查 pro 操作的权限
      if (operationType === 'pro') {
        // 未登录用户没有 pro 权限
        if (!isSignedIn) {
          toast({
            title: "Pro mode not available",
            description: "Please sign in to use pro mode features"
          });
          return false;
        }
        
        // 检查用户是否有 pro 权限
        if (basicQuota && !hasProAccess(basicQuota.subscriptionTier)) {
          toast({
            title: "Pro mode not available",
            description: "Please upgrade to a pro plan to use this feature"
          });
          return false;
        }
      }

      const data = await fetchQuota(operationType);
      if (!data) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check operation quota. Please try again."
        });
        return false;
      }

      // 更新对应的配额状态
      if (operationType === 'basic') {
        setBasicQuota(data);
      } else {
        setProQuota(data);
      }

      if (!data.allowed) {
        toast({
          variant: "destructive",
          title: "Operation not allowed",
          description: data.error || `You've reached your ${operationType} operations limit for this month.`
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check quota:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check operation quota. Please try again."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, basicQuota, hasProAccess, fetchQuota, toast]);

  // 刷新配额信息（不显示错误提示）
  const refreshQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 获取 basic 配额信息
      const basicData = await fetchQuota('basic');
      if (basicData) {
        setBasicQuota(basicData);
        
        // 只为已登录且有 pro 权限的用户获取 pro 配额
        if (isSignedIn && hasProAccess(basicData.subscriptionTier)) {
          const proData = await fetchQuota('pro');
          if (proData) {
            setProQuota(proData);
          }
        } else {
          // 清除 pro 配额信息
          setProQuota({
            allowed: false,
            remainingQuota: 0,
            totalQuota: 0,
            usedQuota: 0,
            subscriptionTier: basicData.subscriptionTier
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, hasProAccess, fetchQuota]);

  return {
    basicQuota,
    proQuota,
    checkQuota,
    isLoading,
    refreshQuota
  };
}