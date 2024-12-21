/**
 * Python分析命令请求参数
 */
export interface AnalysisRequest {
  /** 用户输入的分析需求 */
  user_input: string;
  /** 表格信息，key为文件名 */
  table_info: Record<string, FileInfo>;
}

/**
 * 文件信息
 */
export interface FileInfo {
  /** 列名到数据类型的映射 */
  dtypes: Record<string, string>;
  /** 文件类型 */
  fileType: 'csv' | 'xlsx' | 'xls';
}

/**
 * Python命令
 */
export interface PythonCommand {
  /** 要执行的Python/Pandas代码 */
  code: string;
  /** 如果需要保存处理后的表格，这里指定输出文件名 */
  output_filename?: string | null;
}

/**
 * AI助手响应
 */
export interface AssistantResponse {
  /** 下一步操作：需要更多信息、执行命令或超出范围 */
  next_step: 'need_more_info' | 'execute_command' | 'out_of_scope';
  /** 当next_step为'execute_command'时，包含要执行的Python命令 */
  command?: PythonCommand;
  /** 给用户的自然语言反馈信息 */
  message: string;
}

/**
 * 文件上传信息
 */
export interface UploadedFileInfo {
  /** 文件名 */
  name: string;
  /** 文件大小(字节) */
  size: number;
  /** 文件类型 */
  type: string;
  /** 数据类型映射 */
  dtypes: Record<string, string>;
  /** 文件类型 */
  fileType: 'csv' | 'xlsx' | 'xls';
  /** 上传时间 */
  uploadedAt: Date;
}

/**
 * 分析结果类型
 */
export interface AnalysisResult {
  /** 执行状态 */
  status: 'success' | 'error' | 'need_more_info' | 'out_of_scope';
  /** 输出文本 */
  output?: string;
  /** 错误信息 */
  error?: string;
  /** 图表数据数组 */
  charts?: Array<{
    /** 图表类型 */
    type: 'matplotlib' | 'plotly';
    /** 图表数据：matplotlib为base64图片，plotly为JSON字符串 */
    data: string;
  }>;
  /** 反馈信息 */
  message?: string;
  /** 输出文件信息 */
  outputFile?: {
    /** 文件名 */
    filename: string;
    /** 文件内容 */
    content: Uint8Array;
    /** 文件大小 */
    size: number;
  };
}

/**
 * API响应类型
 */
export type ApiResponse<T> = {
  data: T | null;
  error?: {
    detail: string;
    status_code: number;
  };
}; 