'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  UploadedFileInfo,
  AnalysisResult,
  AssistantResponse,
  ApiResponse,
  AnalysisRequest
} from '@/types/chatexcel';
import * as XLSX from 'xlsx';

interface PyodideInterface {
  loadPyodide: any;
  runPythonAsync: (code: string) => Promise<any>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  loadPackage: (packages: string[] | string) => Promise<void>;
  globals: any;
  FS: any;
}

interface PyodideLoadOptions {
  indexURL: string;
  fullStdLib?: boolean;
}

declare global {
  interface Window {
    loadPyodide: (options: PyodideLoadOptions) => Promise<PyodideInterface>;
    pyodide: PyodideInterface | null;
  }
}

const PYODIDE_CDN_URL = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/";

interface PendingFile {
  file: File;
  content: ArrayBuffer;
  fileType: 'csv' | 'xlsx' | 'xls';
}

export function useChatExcel() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const pendingFiles = useRef<Record<string, PendingFile>>({});

  // 初始化 Pyodide
  const initializePyodide = async () => {
    if (window.pyodide) {
      setPyodideReady(true);
      return window.pyodide;
    }

    try {
      if (!document.querySelector('script[src*="pyodide.js"]')) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'script';
        preloadLink.href = `${PYODIDE_CDN_URL}pyodide.js`;
        document.head.appendChild(preloadLink);

        const script = document.createElement('script');
        script.src = `${PYODIDE_CDN_URL}pyodide.js`;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-cache-max-age', '604800');
        document.body.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      window.pyodide = await window.loadPyodide({
        indexURL: PYODIDE_CDN_URL,
        fullStdLib: false,
      });

      await window.pyodide.loadPackage(['pandas', 'numpy', 'matplotlib']);
      
      await window.pyodide.loadPackage('micropip');
      await window.pyodide.runPythonAsync(`
        import micropip
        await micropip.install(['plotly', 'openpyxl'])
      `);

      await window.pyodide.runPythonAsync(`
        import sys
        import io
        import pandas as pd
        import numpy as np
        import matplotlib
        import plotly.express as px
        import plotly.graph_objects as go
        matplotlib.use('agg')
        import matplotlib.pyplot as plt
        
        plt.style.use('seaborn')
        matplotlib.rcParams['figure.figsize'] = (10, 6)
        matplotlib.rcParams['figure.dpi'] = 100
      `);

      // 处理所有待处理的文件
      if (Object.keys(pendingFiles.current).length > 0) {
        for (const [fileName, { content }] of Object.entries(pendingFiles.current)) {
          window.pyodide.FS.writeFile(
            fileName,
            new Uint8Array(content)
          );
        }
        pendingFiles.current = {};
      }

      setPyodideReady(true);
      return window.pyodide;
    } catch (error) {
      console.error('Pyodide initialization error:', error);
      throw error;
    }
  };

  // 推断数据类型
  const inferValueType = (value: unknown): string => {
    if (value == null || value === '') {
      return 'string';
    }

    const strValue = String(value).trim();
    
    if (strValue === '') {
      return 'string';
    }

    // 处理数字
    if (!isNaN(Number(strValue))) {
      return strValue.includes('.') ? 'float64' : 'int64';
    }

    // 处理布尔值
    const lowerValue = strValue.toLowerCase();
    if (lowerValue === 'true' || lowerValue === 'false') {
      return 'bool';
    }

    // 其他情况都作为字符串处理
    return 'string';
  };

  // 处理列名
  const processHeader = (header: string): string => {
    if (!header) {
      throw new Error('存在空的列名');
    }
    
    // 移除不可见字符
    const cleaned = header.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    if (!cleaned) {
      throw new Error('存在空的列名');
    }

    return cleaned;
  };

  // 解析CSV文件
  const inferCsvDtypes = async (file: File): Promise<Record<string, string>> => {
    try {
      const firstChunk = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        const chunk = file.slice(0, 8192);
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(chunk);
      });

      const lines = firstChunk.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('文件格式错误或为空');
      }

      const headers = lines[0].split(',').map((header) => processHeader(header));
      const sampleData = lines[1].split(',').map((d: string) => d.trim());

      const dtypes: Record<string, string> = {};
      headers.forEach((header, index) => {
        dtypes[header] = inferValueType(sampleData[index]);
      });

      return dtypes;
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new Error('CSV文件解析失败');
    }
  };

  // 解析Excel文件
  const inferExcelDtypes = async (file: File): Promise<Record<string, string>> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // 获取第一个工作表
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) {
        throw new Error('Excel文件为空');
      }

      // 转换为JSON数据
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      if (jsonData.length < 2) {
        throw new Error('Excel文件数据不足');
      }

      const headers = (jsonData[0] as unknown[]).map((header) => processHeader(header as string));
      const sampleData = jsonData[1] as unknown[];

      const dtypes: Record<string, string> = {};
      headers.forEach((header, index) => {
        dtypes[header] = inferValueType(sampleData[index]);
      });

      return dtypes;
    } catch (error) {
      console.error('Excel parsing error:', error);
      throw new Error('Excel文件解析失败');
    }
  };

  // 处理文件上传
  const handleFileUpload = useCallback(async (files: FileList) => {
    try {
      // 检查文件数量限制
      if (uploadedFiles.length + files.length > 5) {
        throw new Error('最多只能上传5个文件');
      }

      // 计算当前已上传文件的总大小
      const currentTotalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
      
      // 计算新文件的总大小
      const newFilesSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
      
      // 检查总大小限制 (100MB = 100 * 1024 * 1024 bytes)
      if (currentTotalSize + newFilesSize > 100 * 1024 * 1024) {
        throw new Error('所有文件的总大小不能超过100MB');
      }

      const newFiles: UploadedFileInfo[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.toLowerCase().split('.').pop();
        
        if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
          throw new Error('只支持 CSV 或 Excel 文件格式');
        }

        const dtypes = fileExt === 'csv' 
          ? await inferCsvDtypes(file)
          : await inferExcelDtypes(file);

        const content = await file.arrayBuffer();

        // 将文件存储在待处理队列中
        pendingFiles.current[file.name] = {
          file,
          content,
          fileType: fileExt as 'csv' | 'xlsx' | 'xls'
        };

        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          dtypes,
          fileType: fileExt as 'csv' | 'xlsx' | 'xls',
          uploadedAt: new Date()
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }, [uploadedFiles]);

  // 删除文件
  const handleFileDelete = useCallback((fileName: string) => {
    try {
      // 从 pendingFiles 中删除文件
      delete pendingFiles.current[fileName];
      
      // 如果 Pyodide 已初始化，尝试从文件系统中删除文件
      if (window.pyodide?.FS) {
        try {
          window.pyodide.FS.unlink(fileName);
        } catch (fsError) {
          // 忽略文件系统错误，因为文件可能不存在
          console.log('File not found in Pyodide filesystem:', fileName);
        }
      }

      setUploadedFiles(prev => {
        const newFiles = prev.filter(file => file.name !== fileName);
        // 如果删除后没有文件了，清空分析结果
        if (newFiles.length === 0) {
          setAnalysisResult(null);
        }
        return newFiles;
      });
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }, []);

  // 执行分析
  const executeAnalysis = useCallback(async (userInput: string, isProMode: boolean) => {
    if (uploadedFiles.length === 0) {
      throw new Error('请先上传要分析的文件');
    }

    try {
      setAnalyzing(true);
      setAnalysisResult(null);

      const [response, pyodide] = await Promise.all([
        fetch('/api/chatexcel/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_input: userInput,
            table_info: uploadedFiles.reduce((acc, file) => {
              acc[file.name] = {
                dtypes: file.dtypes,
                fileType: file.fileType
              };
              return acc;
            }, {} as Record<string, { dtypes: Record<string, string>; fileType: 'csv' | 'xlsx' | 'xls' }>),
            mode: isProMode ? 'pro' : 'basic'
          } as AnalysisRequest)
        }).then(res => res.json() as Promise<ApiResponse<AssistantResponse>>),
        initializePyodide()
      ]);

      if (response.error) {
        throw new Error(response.error.detail);
      }

      const result = response.data;
      if (!result) {
        throw new Error('分析服务返回空结果');
      }

      // 处理需要更多信息的情况
      if (result.next_step === 'need_more_info') {
        setAnalysisResult({
          status: 'need_more_info',
          message: result.message
        });
        return;
      }

      // 处理超出范围的情况
      if (result.next_step === 'out_of_scope') {
        setAnalysisResult({
          status: 'out_of_scope',
          message: result.message
        });
        return;
      }

      if (!result.command?.code) {
        throw new Error('系统无法生成分析代码');
      }

      // 执行Python代码
      setExecuting(true);
      let output = '';
      let charts: AnalysisResult['charts'] = [];

      try {
        // 确保所有文件都写入到 Pyodide 文件系统
        for (const file of uploadedFiles) {
          const pendingFile = pendingFiles.current[file.name];
          if (pendingFile) {
            pyodide.FS.writeFile(
              file.name,
              new Uint8Array(pendingFile.content)
            );
          }
        }

        // 设置输出捕获
        await pyodide.runPythonAsync(`
          import io
          import sys
          _stdout = sys.stdout
          _stderr = sys.stderr
          sys.stdout = io.StringIO()
          sys.stderr = io.StringIO()
          
          # 创建一个列表来存储所有图表
          _all_figures = []
          
          # 重写 plotly 的 show 方法来捕获图表
          def _custom_show(fig):
              _all_figures.append(fig)
          
          import plotly.graph_objects as go
          original_show = go.Figure.show
          go.Figure.show = _custom_show
        `);

        // 执行代码
        await pyodide.runPythonAsync(result.command.code);

        // 获取输出
        const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
        const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');
        output = stdout + stderr;

        // 检查是否�� matplotlib 图表
        const hasMplFigure = await pyodide.runPythonAsync('plt.get_fignums()');
        if (hasMplFigure.length > 0) {
          const base64Data = await pyodide.runPythonAsync(`
            import base64
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight')
            buf.seek(0)
            base64.b64encode(buf.read()).decode('utf-8')
          `);
          charts.push({
            type: 'matplotlib',
            data: base64Data
          });
          await pyodide.runPythonAsync('plt.close("all")');
        }

        // 获取所有 Plotly 图表
        const hasPlotlyFigures = await pyodide.runPythonAsync('len(_all_figures) > 0');
        if (hasPlotlyFigures) {
          const plotlyFigures = await pyodide.runPythonAsync(`
            [fig.to_json() for fig in _all_figures]
          `);
          for (const figureJson of plotlyFigures) {
            charts.push({
              type: 'plotly',
              data: figureJson
            });
          }
        }

        // 恢复原始的 show 方法
        await pyodide.runPythonAsync(`
          go.Figure.show = original_show
        `);

        // 处理输出文件
        if (result.command.output_filename) {
          try {
            const outputFiles = result.command.output_filename.map(filename => {
              const fileContent = pyodide.FS.readFile(
                filename,
                { encoding: 'binary' }
              );
              return {
                filename,
                content: fileContent,
                size: fileContent.length
              };
            });

            setAnalysisResult({
              status: 'success',
              output,
              charts: charts.length > 0 ? charts : undefined,
              outputFiles
            });
          } catch (fileError) {
            console.error('Failed to read output files:', fileError);
            output += '\n读取输出文件失败';
            setAnalysisResult({
              status: 'success',
              output,
              charts: charts.length > 0 ? charts : undefined
            });
          }
        } else {
          setAnalysisResult({
            status: 'success',
            output,
            charts: charts.length > 0 ? charts : undefined
          });
        }
      } catch (execError) {
        console.error('Code execution error:', execError);
        setAnalysisResult({
          status: 'error',
          output,
          error: execError instanceof Error ? execError.message : '代码执行失败'
        });
      } finally {
        // 恢复标准输出
        await pyodide.runPythonAsync(`
          sys.stdout = _stdout
          sys.stderr = _stderr
        `);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        status: 'error',
        error: error instanceof Error ? error.message : '分析失败，请稍后重试'
      });
    } finally {
      setAnalyzing(false);
      setExecuting(false);
    }
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    analyzing,
    executing,
    pyodideReady,
    analysisResult,
    proMode,
    setProMode,
    handleFileUpload,
    handleFileDelete,
    executeAnalysis
  };
} 