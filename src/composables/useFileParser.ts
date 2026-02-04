import { ref } from 'vue';
import type { FieldMapping, FileUploadState, ParsedRecord } from '../types';
import { parseMapperCSV } from '../utils/csvParser';
import { parseMapperExcel } from '../utils/excelParser';
import { reformatFixedWidthFile, parseAllRecords, detectRecordLength } from '../utils/fixedWidthParser';

export function useFileParser() {
  const fileState = ref<FileUploadState>({
    mapperFile: null,
    dataFile: null,
    mapperLoaded: false,
    dataLoaded: false,
    loading: false,
    error: null
  });

  const mappings = ref<FieldMapping[]>([]);
  const rawRecords = ref<string[]>([]);
  const parsedRecords = ref<ParsedRecord[]>([]);
  const recordLength = ref<number>(1040); // Default

  /**
   * Parse mapper file (CSV or Excel)
   */
  const parseMapperFile = async (file: File): Promise<void> => {
    fileState.value.loading = true;
    fileState.value.error = null;

    try {
      let parsedMappings: FieldMapping[];
      
      // Check file extension to determine parser
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        parsedMappings = await parseMapperExcel(file);
      } else {
        const text = await file.text();
        parsedMappings = parseMapperCSV(text);
      }
      
      if (parsedMappings.length === 0) {
        throw new Error('No valid mappings found in file');
      }

      mappings.value = parsedMappings;
      recordLength.value = detectRecordLength(parsedMappings);
      fileState.value.mapperFile = file;
      fileState.value.mapperLoaded = true;

      // If data file already loaded, re-parse it with new mappings
      if (fileState.value.dataLoaded && rawRecords.value.length > 0) {
        parsedRecords.value = parseAllRecords(rawRecords.value, mappings.value);
      }
    } catch (error) {
      fileState.value.error = error instanceof Error ? error.message : 'Failed to parse mapper file';
      throw error;
    } finally {
      fileState.value.loading = false;
    }
  };

  /**
   * Parse data file (fixed-width)
   */
  const parseDataFile = async (file: File): Promise<void> => {
    fileState.value.loading = true;
    fileState.value.error = null;

    try {
      if (!fileState.value.mapperLoaded) {
        throw new Error('Please upload mapper file first');
      }

      const text = await file.text();
      const records = reformatFixedWidthFile(text, recordLength.value);
      
      if (records.length === 0) {
        throw new Error('No valid records found in file');
      }

      rawRecords.value = records;
      parsedRecords.value = parseAllRecords(records, mappings.value);
      fileState.value.dataFile = file;
      fileState.value.dataLoaded = true;
    } catch (error) {
      fileState.value.error = error instanceof Error ? error.message : 'Failed to parse data file';
      throw error;
    } finally {
      fileState.value.loading = false;
    }
  };

  /**
   * Load sample data files
   */
  const loadSampleData = async (): Promise<void> => {
    fileState.value.loading = true;
    fileState.value.error = null;

    try {
      // Load sample mapper
      const mapperResponse = await fetch('/sample-data/SRV.mapper.csv');
      if (!mapperResponse.ok) throw new Error('Failed to load sample mapper');
      const mapperText = await mapperResponse.text();
      const parsedMappings = parseMapperCSV(mapperText);
      
      mappings.value = parsedMappings;
      recordLength.value = detectRecordLength(parsedMappings);
      fileState.value.mapperLoaded = true;

      // Load sample data
      const dataResponse = await fetch('/sample-data/sample-data.txt');
      if (!dataResponse.ok) throw new Error('Failed to load sample data');
      const dataText = await dataResponse.text();
      const records = reformatFixedWidthFile(dataText, recordLength.value);
      
      rawRecords.value = records;
      parsedRecords.value = parseAllRecords(records, mappings.value);
      fileState.value.dataLoaded = true;
    } catch (error) {
      fileState.value.error = error instanceof Error ? error.message : 'Failed to load sample data';
      throw error;
    } finally {
      fileState.value.loading = false;
    }
  };

  /**
   * Reset all state
   */
  const reset = (): void => {
    fileState.value = {
      mapperFile: null,
      dataFile: null,
      mapperLoaded: false,
      dataLoaded: false,
      loading: false,
      error: null
    };
    mappings.value = [];
    rawRecords.value = [];
    parsedRecords.value = [];
    recordLength.value = 1040;
  };

  /**
   * Re-parse records with updated mappings
   */
  const reparse = (): void => {
    if (rawRecords.value.length > 0 && mappings.value.length > 0) {
      parsedRecords.value = parseAllRecords(rawRecords.value, mappings.value);
      recordLength.value = detectRecordLength(mappings.value);
    }
  };

  return {
    fileState,
    mappings,
    rawRecords,
    parsedRecords,
    recordLength,
    parseMapperFile,
    parseDataFile,
    loadSampleData,
    reset,
    reparse
  };
}
