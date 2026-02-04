import * as XLSX from 'xlsx';
import type { FieldMapping } from '../types';

/**
 * Parse mapper Excel file (.xlsx, .xls) and convert to FieldMapping array
 * Handles the same format as CSV mapper files
 * Skips rows with Position = "0 to 0"
 */
export function parseMapperExcel(file: File): Promise<FieldMapping[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error('Excel file has no sheets'));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ''
        }) as any[];

        if (jsonData.length === 0) {
          reject(new Error('Excel sheet is empty'));
          return;
        }

        const mappings: FieldMapping[] = [];

        jsonData.forEach((row: any, index: number) => {
          try {
            // Get values from various possible column names (case-insensitive)
            const getColumnValue = (row: any, ...names: string[]): string => {
              for (const name of names) {
                // Try exact match first
                if (row[name] !== undefined) return String(row[name] || '').trim();
                
                // Try case-insensitive match
                const key = Object.keys(row).find(k => k.toLowerCase() === name.toLowerCase());
                if (key && row[key] !== undefined) return String(row[key] || '').trim();
              }
              return '';
            };

            const position = getColumnValue(row, 'Position', 'position');
            
            // Skip rows with position "0 to 0" or empty position
            if (position === '0 to 0' || position.trim() === '') {
              return;
            }

            // Parse position (e.g., "1 to 7" or "1-7")
            const posMatch = position.match(/(\d+)\s*(?:to|-)\s*(\d+)/);
            if (!posMatch) {
              console.warn(`Skipping row ${index + 2}: Invalid position format "${position}"`);
              return;
            }

            const positionStart = parseInt(posMatch[1]);
            const positionEnd = parseInt(posMatch[2]);
            const calculatedLength = positionEnd - positionStart + 1;

            // Use provided length or calculated length
            const lengthStr = getColumnValue(row, 'Length', 'length');
            const length = parseInt(lengthStr) || calculatedLength;

            const mapping: FieldMapping = {
              element: getColumnValue(row, 'Element', 'element'),
              value: getColumnValue(row, 'Value', 'value'),
              description: getColumnValue(row, 'Description', 'description'),
              type: getColumnValue(row, 'Type', 'type') || 'CHR',
              positionStart,
              positionEnd,
              length,
              preview: getColumnValue(row, 'Preview', 'preview')
            };

            // Only add if element is not empty
            if (mapping.element) {
              mappings.push(mapping);
            }
          } catch (error) {
            console.error(`Error parsing row ${index + 2}:`, error);
          }
        });

        if (mappings.length === 0) {
          reject(new Error('No valid mappings found in Excel file'));
          return;
        }

        // Sort by position start
        mappings.sort((a, b) => a.positionStart - b.positionStart);

        resolve(mappings);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsBinaryString(file);
  });
}
