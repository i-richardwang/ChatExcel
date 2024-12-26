'use client';

import { useCallback, useEffect } from 'react';
import { AnalysisInput } from './AnalysisInput';
import { ExecutionResult } from './ExecutionResult';
import { UsageQuota } from './UsageQuota';
import { useChatExcel } from '@/hooks/use-chatexcel';
import { useQuota } from '@/hooks/use-quota';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';

export function ChatExcelSection() {
  const {
    uploadedFiles,
    analyzing,
    executing,
    analysisResult,
    proMode,
    setProMode,
    handleFileUpload,
    handleFileDelete,
    executeAnalysis
  } = useChatExcel();

  const {
    basicQuota,
    proQuota,
    checkQuota,
    refreshQuota,
  } = useQuota();

  const { toast } = useToast();
  const { isSignedIn } = useUser();

  // 在组件加载时检查配额
  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  // 文件上传处理
  const handleUpload = useCallback(async (files: FileList) => {
    try {
      await handleFileUpload(files);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files"
      });
    }
  }, [handleFileUpload, toast]);

  // 文件删除处理
  const handleDelete = useCallback((fileName: string) => {
    try {
      handleFileDelete(fileName);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete file"
      });
    }
  }, [handleFileDelete, toast]);

  // 分析处理
  const handleAnalysis = useCallback(async (input: string) => {
    try {
      // 检查操作配额
      const operationType = proMode ? 'pro' : 'basic';
      const isAllowed = await checkQuota(operationType);
      
      if (!isAllowed) {
        return;
      }

      await executeAnalysis(input, proMode);
      // 分析完成后刷新配额
      refreshQuota();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Analysis failed, please try again"
      });
    }
  }, [executeAnalysis, proMode, checkQuota, refreshQuota, toast]);

  // Pro模式切换处理
  const handleProModeChange = useCallback(async (enabled: boolean) => {
    if (enabled && !isSignedIn) {
      toast({
        variant: "destructive",
        title: "Pro mode not available",
        description: "Please sign in to use pro mode features"
      });
      return;
    }

    if (enabled && basicQuota && !['pro', 'lifetime'].includes(basicQuota.subscriptionTier)) {
      toast({
        variant: "destructive",
        title: "Pro mode not available",
        description: "Please upgrade to a pro plan to use pro mode features"
      });
      return;
    }

    setProMode(enabled);
  }, [isSignedIn, basicQuota?.subscriptionTier, setProMode, toast]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1800px] w-[90%] mx-auto py-8">
          {/* 配额显示 */}
          <div className="max-w-3xl mx-auto mb-8">
            {basicQuota && (
              <UsageQuota
                basicQuota={basicQuota}
                proQuota={proQuota}
                isProMode={proMode}
              />
            )}
          </div>

          <AnalysisInput
            onSubmit={handleAnalysis}
            onFileUpload={handleUpload}
            onFileDelete={handleDelete}
            files={uploadedFiles}
            disabled={analyzing || executing}
            analyzing={analyzing}
            proMode={proMode}
            onProModeChange={handleProModeChange}
          />

          <ExecutionResult
            result={analysisResult}
            executing={executing}
          />
        </div>
      </div>
    </div>
  );
}