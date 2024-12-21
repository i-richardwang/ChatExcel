'use client';

import { useCallback } from 'react';
import { AnalysisInput } from './AnalysisInput';
import { ExecutionResult } from './ExecutionResult';
import { useChatExcel } from '@/hooks/use-chatexcel';
import { useToast } from '@/hooks/use-toast';

export function ChatExcelSection() {
  const {
    uploadedFiles,
    analyzing,
    executing,
    analysisResult,
    handleFileUpload,
    handleFileDelete,
    executeAnalysis
  } = useChatExcel();

  const { toast } = useToast();

  const handleUpload = useCallback(async (files: FileList) => {
    try {
      await handleFileUpload(files);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: error instanceof Error ? error.message : "文件上传失败"
      });
    }
  }, [handleFileUpload, toast]);

  const handleDelete = useCallback((fileName: string) => {
    try {
      handleFileDelete(fileName);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "文件删除失败，请重试"
      });
    }
  }, [handleFileDelete, toast]);

  const handleAnalysis = useCallback(async (input: string) => {
    try {
      await executeAnalysis(input);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "分析失败",
        description: error instanceof Error ? error.message : "分析失败，请稍后重试"
      });
    }
  }, [executeAnalysis, toast]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1800px] w-[90%] mx-auto py-8">
          <AnalysisInput
            onSubmit={handleAnalysis}
            onFileUpload={handleUpload}
            onFileDelete={handleDelete}
            files={uploadedFiles}
            disabled={analyzing || executing}
            analyzing={analyzing}
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