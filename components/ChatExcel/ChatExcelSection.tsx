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
  const [isFilesPanelOpen, setIsFilesPanelOpen] = useState(true);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const dragCounterRef = useRef(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 在组件加载时检查配额
  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  // 处理面板打开状态变化
  useEffect(() => {
    if (isFilesPanelOpen) {
      // 面板打开时立即隐藏按钮
      setIsButtonVisible(false);
    }
  }, [isFilesPanelOpen]);

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 只有在有文件的情况下，才允许点击外部关闭
      if (uploadedFiles.length > 0) {
        const target = event.target as HTMLElement;
        
        // 检查点击是否在侧边栏内部
        if (sidebarRef.current?.contains(target)) {
          return;
        }

        // 检查是否点击了具体的交互组件
        const isInputComponent = target.closest('textarea, button, .switch-container');
        const isToggleButton = target.closest('.toggle-button');
        const isPricingModal = target.closest('.pricing-modal');
        
        // 如果点击了这些具体组件，不关闭侧边栏
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

  // 根据文件状态自动控制显示
  useEffect(() => {
    if (uploadedFiles.length === 0) {
      setIsFilesPanelOpen(true);
      setIsButtonVisible(false);
    }
  }, [uploadedFiles.length]);

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

      // 执行时关闭面板（如果有文件）
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
    <div className="h-full flex">
      {/* 主要分析区域 */}
      <motion.div 
        className="analysis-panel flex-1 flex justify-center overflow-y-auto"
        animate={{ 
          marginRight: isFilesPanelOpen ? 400 : 0 
        }}
        transition={{ 
          duration: 0.3,
          ease: 'easeInOut'
        }}
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

      {/* 文件侧边栏 */}
      <motion.div
        ref={sidebarRef}
        className="file-sidebar fixed right-0 top-0 h-full bg-stone-50 dark:bg-neutral-900"
        animate={{ 
          x: isFilesPanelOpen ? 0 : '100%',
        }}
        transition={{ 
          duration: 0.3,
          ease: 'easeInOut'
        }}
        style={{
          width: 400,
        }}
        onAnimationComplete={() => {
          if (!isFilesPanelOpen) {
            setIsButtonVisible(true);
          }
        }}
      >
        <div className="h-full pt-[120px]">
          <motion.div
            animate={{ 
              x: isFilesPanelOpen ? 0 : 100,
              opacity: isFilesPanelOpen ? 1 : 0,
            }}
            transition={{ 
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className="pr-12 h-full"
          >
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
          </motion.div>
        </div>
      </motion.div>

      {/* 切换按钮 */}
      <AnimatePresence mode="wait">
        {!isFilesPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-[200px] z-30"
          >
            <Button
              variant="default"
              size="sm"
              className="toggle-button h-32 w-10 rounded-l-lg rounded-r-none bg-[#0d9488] hover:bg-[#0d9488]/90"
              onClick={() => setIsFilesPanelOpen(true)}
            >
              <FileUp className="h-4 w-4 -rotate-90" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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