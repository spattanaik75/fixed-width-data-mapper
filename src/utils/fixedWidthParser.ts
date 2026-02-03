import type { FieldMapping, ParsedRecord } from '../types';

/**
 * Auto-detect record length from mapper
 * Returns the maximum position end value
 */
export function detectRecordLength(mappings: FieldMapping[]): number {
  if (mappings.length === 0) return 1040; // Default
  
  const maxPosition = Math.max(...mappings.map(m => m.positionEnd));
  return maxPosition;
}

/**
 * Reformat fixed-width file by adding proper line breaks
 * Removes all existing line breaks and splits into records of specified length
 */
export function reformatFixedWidthFile(fileContent: string, recordLength: number): string[] {
  // Remove all line breaks to get continuous data
  const cleaned = fileContent
    .replace(/\r\n/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '');

  // Split into records of fixed length
  const records: string[] = [];
  for (let i = 0; i < cleaned.length; i += recordLength) {
    const record = cleaned.substring(i, i + recordLength);
    if (record.trim().length > 0) {
      // Pad with spaces if needed
      const paddedRecord = record.padEnd(recordLength, ' ');
      records.push(paddedRecord);
    }
  }

  return records;
}

/**
 * Parse a single record using field mappings
 * Extracts each field based on position and length
 */
export function parseRecord(line: string, mappings: FieldMapping[]): ParsedRecord {
  const record: ParsedRecord = {};

  mappings.forEach(field => {
    try {
      // Convert 1-based position to 0-based index
      const startIdx = field.positionStart - 1;
      const endIdx = field.positionEnd;
      
      // Extract value and trim
      const value = line.substring(startIdx, endIdx).trim();
      
      record[field.element] = {
        name: field.description || field.value || field.element,
        value: value,
        type: field.type
      };
    } catch (error) {
      console.error(`Error parsing field ${field.element}:`, error);
      record[field.element] = {
        name: field.description || field.value || field.element,
        value: '',
        type: field.type
      };
    }
  });

  return record;
}

/**
 * Parse all records using field mappings
 */
export function parseAllRecords(records: string[], mappings: FieldMapping[]): ParsedRecord[] {
  return records.map(record => parseRecord(record, mappings));
}

/**
 * Check if a field value appears to be empty
 * Empty patterns: all 9s, all blanks, all underscores, all asterisks
 */
export function isFieldEmpty(value: string): boolean {
  if (!value || value.trim().length === 0) return true;
  
  // Check for common empty patterns
  const trimmed = value.trim();
  if (/^9+$/.test(trimmed)) return true;  // All 9s
  if (/^_+$/.test(trimmed)) return true;  // All underscores
  if (/^\*+$/.test(trimmed)) return true; // All asterisks
  if (/^0+$/.test(trimmed)) return true;  // All zeros (in some contexts)
  
  return false;
}

/**
 * Export parsed records to CSV format
 */
export function exportParsedDataToCSV(parsedRecords: ParsedRecord[], mappings: FieldMapping[]): string {
  if (parsedRecords.length === 0) return '';

  // Create headers from field elements
  const headers = mappings.map(m => m.element);
  
  // Create rows
  const rows = parsedRecords.map(record => {
    return mappings.map(m => {
      const field = record[m.element];
      return field ? field.value : '';
    });
  });

  // Simple CSV generation
  const csvLines: string[] = [];
  csvLines.push(headers.join(','));
  
  rows.forEach(row => {
    const escapedRow = row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    });
    csvLines.push(escapedRow.join(','));
  });

  return csvLines.join('\n');
}
