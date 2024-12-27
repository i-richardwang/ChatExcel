'use client';

import React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, FileUp, Sparkles, Upload, X, FileText } from "lucide-react";
import { cn } from "@/libs/utils";
import type { UploadedFileInfo } from '@/types/chatexcel';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "./SubmitButton";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLE_PROMPTS = [
  {
    text: "Calculate average salary by department",
    icon: "📊"
  },
  {
    text: "Create sales chart by city",
    icon: "📈"
  },
  {
    text: "Find duplicate customer records",
    icon: "🔍"
  },
  {
    text: "Merge multiple tables into one",
    icon: "🔄"
  }
];

interface AnalysisInputProps {
  onSubmit: (input: string) => Promise<void>;
  onFileUpload: (files: FileList) => Promise<void>;
  files: UploadedFileInfo[];
  disabled?: boolean;
  analyzing?: boolean;
  onFileDelete: (fileName: string) => void;
  proMode: boolean;
  onProModeChange: (checked: boolean) => void;
}

export function AnalysisInput({
  onSubmit,
  onFileUpload,
  files,
  disabled = false,
  analyzing = false,
  onFileDelete,
  proMode,
  onProModeChange
}: AnalysisInputProps) {
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;
    await onSubmit(input.trim());
  }, [input, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handlePromptClick = useCallback((prompt: string) => {
    setInput(prompt);
  }, []);

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onFileUpload(files);
      e.target.value = '';
    }
  }, [onFileUpload]);

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
      await onFileUpload(files);
    }
  }, [onFileUpload]);

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

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* 左侧文件区域 */}
      <div className="w-1/3 border-r flex justify-center">
        <div className="w-full max-w-sm py-6 px-4">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Excel Files</h3>
            <p className="text-sm text-muted-foreground">
              Upload your Excel or CSV files here
            </p>
          </div>

          <div
            ref={dropzoneRef}
            className={cn(
              "mt-6 border-2 border-dashed rounded-xl h-[200px] transition-colors duration-200",
              "flex flex-col items-center justify-center gap-4 p-6",
              isDragging ? "border-[#0d9488] bg-[#0d9488]/5" : "border-neutral-200 dark:border-neutral-800",
              "hover:border-[#0d9488] hover:bg-[#0d9488]/5"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleFileClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              multiple
              onChange={handleFileChange}
            />
            <Upload className={cn(
              "w-10 h-10 transition-colors duration-200",
              isDragging ? "text-[#0d9488]" : "text-neutral-400"
            )} />
            <div className="text-center">
              <p className="font-medium mb-1">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Support Excel or CSV files
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 border rounded-xl overflow-hidden bg-white dark:bg-neutral-800">
              <Table>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.name} className="hover:bg-muted/30">
                      <TableCell className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {file.name}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Badge variant="secondary" className="font-normal bg-muted/30 hover:bg-muted/50">
                              {(file.size / 1024).toFixed(1)} KB
                            </Badge>
                            <Badge variant="secondary" className="font-normal bg-muted/30 hover:bg-muted/50">
                              {Object.keys(file.dtypes).length} columns
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shadow-none hover:bg-muted/50"
                          onClick={() => onFileDelete(file.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* 右侧分析区域 */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl py-6 px-4">
          <h1 className="text-4xl font-normal text-center mb-8">
            What would you like to analyze?
          </h1>

          <div className="border rounded-[4px] focus-within:border-[#0d9488] transition-colors overflow-hidden bg-white dark:bg-neutral-800">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your data processing request..."
              disabled={analyzing}
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 bg-transparent px-4 py-4 shadow-none text-lg"
            />
            <div className="px-2 py-2 flex items-center justify-between border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Pro Mode</span>
                <Switch
                  checked={proMode}
                  onCheckedChange={onProModeChange}
                  disabled={analyzing}
                  className="data-[state=checked]:bg-[#0d9488] data-[state=checked]:hover:bg-[#0d9488]/90"
                />
              </div>
              <SubmitButton
                onSubmit={handleSubmit}
                disabled={disabled || files.length === 0}
                analyzing={analyzing}
                proMode={proMode}
                hasInput={!!input.trim()}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-start gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-[#0d9488] shrink-0">
                <Sparkles className="h-4 w-4 text-[#0d9488]" />
                Try this
              </div>
              <div className="grid grid-cols-2 gap-2 flex-1">
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full shadow-none hover:bg-muted/50"
                    onClick={() => handlePromptClick(prompt.text)}
                  >
                    <span className="mr-1">{prompt.icon}</span>
                    {prompt.text}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 