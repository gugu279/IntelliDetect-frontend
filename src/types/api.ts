// API响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 事故统计数据类型
export interface AccidentStats {
  totalAccidents: number;
  resolvedAccidents: number;
  pendingAccidents: number;
  accidentRate: number;
}

// 事故记录类型
export interface Accident {
  id: number;
  videoUrl: string;
  imageUrl: string;
  accidentDescription: string;
  accidentDescriptionText: string;
  accidentDescriptionTime: string;
  accidentDescriptionState: string;
  displayInfo?: string;
  createTime?: string;
  updateTime?: string;
}

// 分页响应类型
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
  totalPages?: number; // 兼容可能使用totalPages的情况
}