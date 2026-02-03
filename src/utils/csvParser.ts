import Papa from 'papaparse';
import type { FieldMapping } from '../types';

/**
 * Parse mapper CSV file and convert to FieldMapping array
 * Handles both comma and tab-delimited formats
 * Skips rows with Position = "0 to 0"
 */
export function parseMapperCSV(csvText: string): FieldMapping[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => {
      // Normalize header names
      const normalized = header.trim().toLowerCase();
      if (normalized.includes('element')) return 'element';
      if (normalized.includes('value')) return 'value';
      if (normalized.includes('description')) return 'description';
      if (normalized.includes('type')) return 'type';
      if (normalized.includes('position')) return 'position';
      if (normalized.includes('length')) return 'length';
      if (normalized.includes('preview')) return 'preview';
      return header;
    }
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }

  const mappings: FieldMapping[] = [];

  result.data.forEach((row: any, index: number) => {
    try {
      // Skip rows with position "0 to 0" or empty position
      const position = row.position || row.Position || '';
      if (position === '0 to 0' || position.trim() === '') {
        return;
      }

      // Parse position (e.g., "1 to 7" or "1-7")
      const posMatch = position.match(/(\d+)\s*(?:to|-)\s*(\d+)/);
      if (!posMatch) {
        console.warn(`Skipping row ${index}: Invalid position format "${position}"`);
        return;
      }

      const positionStart = parseInt(posMatch[1]);
      const positionEnd = parseInt(posMatch[2]);
      const calculatedLength = positionEnd - positionStart + 1;

      // Use provided length or calculated length
      const length = parseInt(row.length || row.Length) || calculatedLength;

      const mapping: FieldMapping = {
        element: (row.element || row.Element || '').trim(),
        value: (row.value || row.Value || '').trim(),
        description: (row.description || row.Description || '').trim(),
        type: (row.type || row.Type || 'CHR').trim(),
        positionStart,
        positionEnd,
        length,
        preview: (row.preview || row.Preview || '').trim()
      };

      // Only add if element is not empty
      if (mapping.element) {
        mappings.push(mapping);
      }
    } catch (error) {
      console.error(`Error parsing row ${index}:`, error);
    }
  });

  // Sort by position start
  mappings.sort((a, b) => a.positionStart - b.positionStart);

  return mappings;
}

/**
 * Convert mapper to CSV string for export
 */
export function mapperToCSV(mappings: FieldMapping[]): string {
  const headers = ['Element', 'Value', 'Description', 'Type', 'Position', 'Length', 'Preview'];
  
  const rows = mappings.map(m => [
    m.element,
    m.value,
    m.description,
    m.type,
    `${m.positionStart} to ${m.positionEnd}`,
    m.length.toString(),
    m.preview
  ]);

  const csv = Papa.unparse({
    fields: headers,
    data: rows
  });

  return csv;
}

/**
 * Validate mapper data
 */
export function validateMapper(mappings: FieldMapping[]): string[] {
  const errors: string[] = [];

  if (mappings.length === 0) {
    errors.push('Mapper is empty');
    return errors;
  }

  // Check for duplicate elements
  const elementSet = new Set<string>();
  mappings.forEach(m => {
    if (elementSet.has(m.element)) {
      errors.push(`Duplicate element: ${m.element}`);
    }
    elementSet.add(m.element);
  });

  // Check for overlapping positions
  for (let i = 0; i < mappings.length - 1; i++) {
    const current = mappings[i];
    const next = mappings[i + 1];
    
    if (current.positionEnd >= next.positionStart) {
      errors.push(
        `Overlapping positions: ${current.element} (${current.positionStart}-${current.positionEnd}) ` +
        `and ${next.element} (${next.positionStart}-${next.positionEnd})`
      );
    }
  }

  return errors;
}
