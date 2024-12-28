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
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { cn } from '@/libs/utils';

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

  // 状态管理
  const [showPricing, setShowPricing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFilesPanelOpen, setIsFilesPanelOpen] = useState(true);
  const dragCounterRef = useRef(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 在组件加载时检查配额
  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (uploadedFiles.length > 0) {
        const target = event.target as HTMLElement;
        
        if (sidebarRef.current?.contains(target)) {
          return;
        }

        const isInputComponent = target.closest('textarea, button, .switch-container');
        const isToggleButton = target.closest('.toggle-button');
        const isPricingModal = target.closest('.pricing-modal');
        
        if (isInputComponent || isToggleButton || isPricingModal) {
          return;
        }

        setIsFilesPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [uploadedFiles.length]);

  // 全局拖拽处理
  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        dragCounterRef.current++;
        setIsDragging(true);
        setIsFilesPanelOpen(true);
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

  // 文件拖拽处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
      setIsFilesPanelOpen(true);
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

  // 分析处理
  const handleAnalysis = useCallback(async (input: string) => {
    try {
      const operationType = proMode ? 'pro' : 'basic';
      const { isAllowed, shouldShowPricing } = await checkQuota(operationType);
      
      if (!isAllowed) {
        if (shouldShowPricing) {
          setShowPricing(true);
        }
        return;
      }

      if (uploadedFiles.length > 0) {
        setIsFilesPanelOpen(false);
      }
      
      await executeAnalysis(input, proMode);
      refreshQuota();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Analysis failed, please try again"
      });
    }
  }, [executeAnalysis, proMode, checkQuota, refreshQuota, toast, uploadedFiles.length]);

  // Pro模式切换处理
  const handleProModeChange = useCallback(async (enabled: boolean) => {
    if (!enabled) {
      setProMode(false);
      return;
    }

    const hasPro = isSignedIn && basicQuota && ['pro', 'lifetime'].includes(basicQuota.subscriptionTier);
    
    if (!hasPro) {
      setShowPricing(true);
      return;
    }

    setProMode(true);
  }, [isSignedIn, basicQuota?.subscriptionTier]);

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* 文件上传区域 - 移动端显示在顶部 */}
      <div className="lg:hidden">
        {isFilesPanelOpen && (
          <div className="bg-stone-50 dark:bg-neutral-900 border-b">
            <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8">
              <FileUpload
                files={uploadedFiles}
                onFileUpload={handleUpload}
                onFileDelete={handleFileDelete}
                isDragging={isDragging}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            </div>
          </div>
        )}
      </div>

      {/* 主分析区域 */}
      <motion.div 
        className={cn(
          "analysis-panel flex-1 flex justify-center overflow-y-auto min-w-[640px]",
          "lg:transition-[margin] lg:duration-300 lg:ease-in-out",
          isFilesPanelOpen && "lg:ml-[350px]"
        )}
      >
        <AnalysisPanel
          onSubmit={handleAnalysis}
          disabled={analyzing || executing || uploadedFiles.length === 0}
          analyzing={analyzing}
          executing={executing}
          proMode={proMode}
          onProModeChange={handleProModeChange}
          result={analysisResult}
          onFocus={() => setIsFilesPanelOpen(true)}
        />
      </motion.div>

      {/* 文件侧边栏 - 桌面端显示 */}
      <motion.div
        ref={sidebarRef}
        className="file-sidebar fixed left-0 top-0 h-full bg-stone-50 dark:bg-neutral-900 hidden lg:block"
        animate={{ 
          x: isFilesPanelOpen ? 0 : '-100%',
        }}
        transition={{ 
          duration: 0.3,
          ease: 'easeInOut'
        }}
        style={{
          width: 350,
        }}
      >
        <div className="h-full pt-[120px]">
          <motion.div
            animate={{ 
              x: isFilesPanelOpen ? 0 : -100,
              opacity: isFilesPanelOpen ? 1 : 0,
            }}
            transition={{ 
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className="pl-12 pr-2 h-full"
          >
            <FileUpload
              files={uploadedFiles}
              onFileUpload={handleUpload}
              onFileDelete={handleFileDelete}
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* 切换按钮 - 仅在桌面端显示 */}
      <AnimatePresence mode="wait">
        {!isFilesPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-[200px] z-30 hidden lg:block"
          >
            <Button
              variant="default"
              size="sm"
              className="toggle-button h-32 w-10 rounded-r-lg rounded-l-none bg-[#0d9488] hover:bg-[#0d9488]/90"
              onClick={() => setIsFilesPanelOpen(true)}
            >
              <FileUp className="h-4 w-4 rotate-90" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端的切换按钮 */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full bg-[#0d9488] hover:bg-[#0d9488]/90 shadow-lg"
          onClick={() => setIsFilesPanelOpen(!isFilesPanelOpen)}
        >
          <FileUp className={cn(
            "h-5 w-5 transition-transform",
            isFilesPanelOpen ? "rotate-180" : "rotate-0"
          )} />
        </Button>
      </div>

      {/* Pricing 弹窗 */}
      <AnimatePresence>
        {showPricing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-background rounded-lg shadow-lg overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Pricing onClose={() => setShowPricing(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}