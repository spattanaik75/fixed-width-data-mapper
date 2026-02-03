// Core interfaces for the application

export interface FieldMapping {
  element: string;
  value: string;
  description: string;
  type: string;
  positionStart: number;
  positionEnd: number;
  length: number;
  preview: string;
}

export interface ParsedRecord {
  [element: string]: {
    name: string;
    value: string;
    type: string;
  };
}

export interface ValidationError {
  type: 'error' | 'warning';
  field: string;
  message: string;
  line?: number;
}

export interface FileUploadState {
  mapperFile: File | null;
  dataFile: File | null;
  mapperLoaded: boolean;
  dataLoaded: boolean;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  mappings: FieldMapping[];
  records: string[];
  parsedRecords: ParsedRecord[];
  validationErrors: ValidationError[];
  searchTerm: string;
  currentPage: number;
  recordsPerPage: number;
  viewMode: 'parsed' | 'raw';
}
