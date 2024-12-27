'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { AnalysisResult } from '@/types/chatexcel';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Code, Minus, Plus } from "lucide-react";
import { cn } from "@/libs/utils";

// 动态导入 Plotly，避免服务端渲染问题
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// 默认尺寸和限制
const DEFAULT_SIZE = { width: '800px', height: '500px' };
const MIN_SIZE = 300;

interface ChartSize {
  width: string;
  height: string;
}

interface ExecutionResultProps {
  result: AnalysisResult | null;
  executing?: boolean;
}

interface PreviewTableData {
  [key: string]: string | number | boolean | null;
}

function parseCSV(content: Uint8Array): { headers: string[]; data: PreviewTableData[] } {
  const text = new TextDecoder().decode(content);
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, index) => {
      const value = values[index];
      // 尝试转换数值
      const num = Number(value);
      obj[header] = !isNaN(num) ? num : 
        value.toLowerCase() === 'true' ? true :
        value.toLowerCase() === 'false' ? false :
        value === '' ? null : value;
      return obj;
    }, {} as PreviewTableData);
  });

  return { headers, data };
}

export function ExecutionResult({
  result,
  executing = false
}: ExecutionResultProps) {
  const [chartSizes, setChartSizes] = useState<Record<number, ChartSize>>({});
  const [previewData, setPreviewData] = useState<PreviewTableData[]>([]);

  if (!result && !executing) {
    return null;
  }

  // 处理文件下载
  const handleDownload = (file: { filename: string; content: Uint8Array }) => {
    const blob = new Blob([file.content], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.filename);
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const renderSizeControls = (index: number) => {
    const currentSize = chartSizes[index] || DEFAULT_SIZE;
    
    const updateSize = (dimension: 'width' | 'height', value: string) => {
      let numValue = parseInt(value.replace(/[^\d]/g, ''));
      // 确保不小于最小尺寸
      numValue = Math.max(MIN_SIZE, numValue || MIN_SIZE);
      const normalizedValue = `${numValue}px`;
      
      setChartSizes(prev => ({
        ...prev,
        [index]: {
          ...prev[index] || DEFAULT_SIZE,
          [dimension]: normalizedValue
        }
      }));
    };

    const adjustSize = (dimension: 'width' | 'height', delta: number) => {
      const currentValue = parseInt(chartSizes[index]?.[dimension] || DEFAULT_SIZE[dimension]);
      const newValue = Math.max(MIN_SIZE, currentValue + delta);
      updateSize(dimension, newValue.toString());
    };
    
    return (
      <div className="flex items-center justify-end gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Width:
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => adjustSize('width', -100)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              value={currentSize.width.replace(/px$/, '')}
              onChange={(e) => updateSize('width', e.target.value)}
              className="w-20 text-center h-8"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => adjustSize('width', 100)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Height:
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => adjustSize('height', -100)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              value={currentSize.height.replace(/px$/, '')}
              onChange={(e) => updateSize('height', e.target.value)}
              className="w-20 text-center h-8"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => adjustSize('height', 100)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">px</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-[#0d9488]" />
          <h2 className="text-lg font-medium">Analysis Result</h2>
        </div>

        {result?.outputFiles && result.outputFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-4 border rounded-[4px] bg-muted/30">
            {result.outputFiles.map((file, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="gap-2 bg-background hover:bg-muted"
                onClick={() => handleDownload(file)}
              >
                <Download className="h-4 w-4" />
                Download {file.filename}
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </Button>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {executing ? (
            <div className="flex items-center justify-center h-40 border rounded-[4px] bg-background">
              <div className="animate-spin">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* 需要更多信息 */}
              {result.status === 'need_more_info' && (
                <Alert variant="default" className="border rounded-[4px] p-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.message || 'Need more information to process. Please provide more details.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* 超出范围 */}
              {result.status === 'out_of_scope' && (
                <Alert variant="destructive" className="rounded-[4px] p-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.message || 'Sorry, your request is out of the system scope.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* 错误信息 */}
              {result.status === 'error' && result.error && (
                <Alert variant="destructive" className="rounded-[4px] p-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}

              {/* 输出内容 */}
              {result.output && (
                <div className="border rounded-[4px] bg-muted/30">
                  <pre className="p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto">
                    {result.output}
                  </pre>
                </div>
              )}

              {/* 图表展示 */}
              {result.charts?.map((chart, index) => (
                <div key={index} className="-mx-[max(0px,calc((100vw-48rem)/2))] mt-8">
                  <div className="max-w-3xl mx-auto space-y-2">
                    <div className="flex justify-end">
                      {renderSizeControls(index)}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div 
                      className="border rounded-[4px] bg-background p-2"
                      style={{ width: 'max-content' }}
                    >
                      {chart.type === 'matplotlib' ? (
                        <div 
                          className="relative"
                          style={chartSizes[index] || DEFAULT_SIZE}
                        >
                          <img
                            src={`data:image/png;base64,${chart.data}`}
                            alt={`Analysis Chart ${index + 1}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ) : chart.type === 'plotly' ? (
                        <div>
                          {(() => {
                            try {
                              const figure = JSON.parse(chart.data);
                              const size = chartSizes[index] || DEFAULT_SIZE;
                              
                              return (
                                <div 
                                  className="relative" 
                                  style={size}
                                >
                                  <Plot
                                    data={figure.data}
                                    layout={{
                                      ...figure.layout,
                                      autosize: true,
                                      width: undefined,
                                      height: undefined,
                                      margin: { t: 30, r: 10, b: 30, l: 50 },
                                      paper_bgcolor: 'transparent',
                                      plot_bgcolor: 'transparent',
                                    }}
                                    config={{
                                      responsive: true,
                                      displayModeBar: true,
                                      displaylogo: false,
                                    }}
                                    className="w-full h-full"
                                    useResizeHandler={true}
                                    style={{ width: '100%', height: '100%' }}
                                  />
                                </div>
                              );
                            } catch (error) {
                              console.error('Failed to parse Plotly data:', error);
                              return (
                                <Alert variant="destructive" className="rounded-[4px]">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>Failed to render chart {index + 1}</AlertDescription>
                                </Alert>
                              );
                            }
                          })()}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 