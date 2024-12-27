'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { FileUpload } from './FileUpload';
import { AnalysisPanel } from './AnalysisPanel';
import { useChatExcel } from '@/hooks/use-chatexcel';
import { useQuota } from '@/hooks/use-quota';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import Pricing from "@/components/Pricing";
import { AnimatePresence, motion } from "framer-motion";

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

  const [showPricing, setShowPricing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  // 在组件加载时检查配额
  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  // 文件拖拽处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleUpload(files);
    }
  }, []);

  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        dragCounterRef.current++;
        setIsDragging(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

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
      const { isAllowed, shouldShowPricing } = await checkQuota(operationType);
      
      if (!isAllowed) {
        if (shouldShowPricing) {
          setShowPricing(true);
        }
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
    // 如果是关闭 Pro Mode，直接允许
    if (!enabled) {
      setProMode(false);
      return;
    }

    // 检查是否有 Pro 权限
    const hasPro = isSignedIn && basicQuota && ['pro', 'lifetime'].includes(basicQuota.subscriptionTier);
    
    if (!hasPro) {
      // 显示 Pricing 页面
      setShowPricing(true);
      return;
    }

    setProMode(true);
  }, [isSignedIn, basicQuota?.subscriptionTier]);

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* 左侧文件区域 */}
        <div className="w-1/3 border-r flex justify-center bg-neutral-50/50 dark:bg-neutral-900/50">
          <FileUpload
            files={uploadedFiles}
            onFileUpload={handleUpload}
            onFileDelete={handleDelete}
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>

        {/* 右侧分析区域 */}
        <div className="flex-1 flex justify-center overflow-y-auto">
          <AnalysisPanel
            onSubmit={handleAnalysis}
            disabled={analyzing || executing || uploadedFiles.length === 0}
            analyzing={analyzing}
            executing={executing}
            proMode={proMode}
            onProModeChange={handleProModeChange}
            result={analysisResult}
          />
        </div>
      </div>

      <AnimatePresence>
        {showPricing && (
          <motion.div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="fixed inset-0 overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="min-h-full">
                <div className="relative w-full bg-neutral-100 dark:bg-neutral-900">
                  <button
                    onClick={() => setShowPricing(false)}
                    className="absolute right-8 top-8 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span className="sr-only">Close</span>
                  </button>
                  <Pricing />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}