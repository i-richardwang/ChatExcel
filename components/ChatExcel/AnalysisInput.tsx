'use client';

import React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, FileUp, Sparkles, Upload, X, FileText, ArrowRight } from "lucide-react";
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
    <div 
      className="w-full max-w-4xl mx-auto h-full flex items-center"
      ref={dropzoneRef}
    >
      <div className="w-full space-y-6">
        <h1 className="text-4xl font-normal text-center">
          What data would you like to process today?
        </h1>

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="border rounded-[4px] focus-within:border-[#0d9488] transition-colors overflow-hidden bg-white">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your data processing request..."
              disabled={analyzing}
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 bg-transparent px-4 py-4 shadow-none text-lg"
            />
            <div className="px-2 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  multiple
                  onChange={handleFileChange}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 shadow-none hover:bg-muted/50"
                        onClick={handleFileClick}
                      >
                        <FileUp className="h-4 w-4 mr-0" />
                        Upload Files
                        {files.length > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({files.length})
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload Excel or CSV files</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Pro Mode</span>
                  <Switch
                    checked={proMode}
                    onCheckedChange={onProModeChange}
                    disabled={analyzing}
                    className="data-[state=checked]:bg-[#0d9488] data-[state=checked]:hover:bg-[#0d9488]/90"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={disabled || analyzing || !input.trim()}
                  className="h-8 px-3 shadow-none bg-[#0d9488] hover:bg-[#0d9488]/90 text-white"
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {isDragging && (
            <div 
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="fixed inset-x-0 top-[40%] max-w-3xl mx-auto px-4">
                <div className="h-[160px] border-2 border-dashed border-[#0d9488]/50 rounded-[4px] bg-[#0d9488]/5 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 text-center px-4">
                    <Upload className="h-10 w-10 text-[#0d9488]/60" />
                    <div>
                      <p className="text-lg font-medium text-[#0d9488]">Drop files here</p>
                      <p className="text-sm text-muted-foreground">
                        Support Excel or CSV files, up to 5 files, max 100MB total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-2xl mx-auto">
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

          {files.length > 0 && (
            <div className="border rounded-[4px] overflow-hidden bg-white">
              <div className="px-4 py-3 border-b">
                <h3 className="font-medium">Uploaded Files</h3>
              </div>
              <Table>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.name} className="hover:bg-muted/30">
                      <TableCell className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">
                          {file.name}
                        </span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Badge variant="secondary" className="font-normal bg-muted/30 hover:bg-muted/50">
                            {(file.size / 1024).toFixed(1)} KB
                          </Badge>
                          <Badge variant="secondary" className="font-normal bg-muted/30 hover:bg-muted/50">
                            {Object.keys(file.dtypes).length} columns
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto shadow-none hover:bg-muted/50"
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
    </div>
  );
} 