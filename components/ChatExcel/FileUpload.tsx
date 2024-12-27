'use client';

import React from 'react';
import { useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/libs/utils";
import type { UploadedFileInfo } from '@/types/chatexcel';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FileUploadProps {
  files: UploadedFileInfo[];
  onFileUpload: (files: FileList) => Promise<void>;
  onFileDelete: (fileName: string) => void;
  isDragging?: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function FileUpload({
  files,
  onFileUpload,
  onFileDelete,
  isDragging = false,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-full max-w-sm py-6 px-4">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Excel Files</h3>
        <p className="text-sm text-muted-foreground">
          Upload your Excel or CSV files here
        </p>
      </div>

      <div
        className={cn(
          "mt-6 border-2 border-dashed rounded-xl h-[200px] transition-colors duration-200",
          "flex flex-col items-center justify-center gap-4 p-6",
          isDragging ? "border-[#0d9488] bg-[#0d9488]/5" : "border-neutral-200 dark:border-neutral-800",
          "hover:border-[#0d9488] hover:bg-[#0d9488]/5"
        )}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
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
  );
} 