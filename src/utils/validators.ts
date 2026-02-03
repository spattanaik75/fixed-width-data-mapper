import type { FieldMapping, ValidationError, ParsedRecord } from '../types';
import { isFieldEmpty } from './fixedWidthParser';

/**
 * Validate field mappings for errors and warnings
 */
export function validateMappings(mappings: FieldMapping[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (mappings.length === 0) {
    return errors;
  }

  // Check for overlapping positions
  for (let i = 0; i < mappings.length - 1; i++) {
    const current = mappings[i];
    const next = mappings[i + 1];
    
    if (current && next && current.positionEnd >= next.positionStart) {
      errors.push({
        type: 'error',
        field: current.element,
        message: `Overlapping with ${next.element}: positions ${current.positionStart}-${current.positionEnd} and ${next.positionStart}-${next.positionEnd}`
      });
    }
  }

  // Check for gaps in positions (warning only)
  for (let i = 0; i < mappings.length - 1; i++) {
    const current = mappings[i];
    const next = mappings[i + 1];
    
    if (current && next) {
      const gap = next.positionStart - current.positionEnd - 1;
      if (gap > 0) {
        errors.push({
          type: 'warning',
          field: current.element,
          message: `Gap of ${gap} characters between ${current.element} (ends at ${current.positionEnd}) and ${next.element} (starts at ${next.positionStart})`
        });
      }
    }
  }

  // Check for invalid position calculations
  mappings.forEach(field => {
    const calculatedLength = field.positionEnd - field.positionStart + 1;
    if (calculatedLength !== field.length) {
      errors.push({
        type: 'warning',
        field: field.element,
        message: `Length mismatch: specified ${field.length} but calculated ${calculatedLength} from positions ${field.positionStart}-${field.positionEnd}`
      });
    }

    if (field.positionStart < 1) {
      errors.push({
        type: 'error',
        field: field.element,
        message: `Invalid position start: ${field.positionStart} (must be >= 1)`
      });
    }

    if (field.positionEnd < field.positionStart) {
      errors.push({
        type: 'error',
        field: field.element,
        message: `Position end (${field.positionEnd}) is less than position start (${field.positionStart})`
      });
    }
  });

  // Check for duplicate elements
  const elementCounts = new Map<string, number>();
  mappings.forEach(field => {
    const count = elementCounts.get(field.element) || 0;
    elementCounts.set(field.element, count + 1);
  });

  elementCounts.forEach((count, element) => {
    if (count > 1) {
      errors.push({
        type: 'warning',
        field: element,
        message: `Duplicate element appears ${count} times`
      });
    }
  });

  return errors;
}

/**
 * Validate parsed data records
 */
export function validateParsedData(
  parsedRecords: ParsedRecord[],
  mappings: FieldMapping[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (parsedRecords.length === 0) {
    return errors;
  }

  // Sample first 100 records for validation
  const sampleSize = Math.min(100, parsedRecords.length);
  const sample = parsedRecords.slice(0, sampleSize);

  // Count empty fields
  const emptyFieldCounts = new Map<string, number>();
  
  sample.forEach((record, recordIndex) => {
    mappings.forEach(field => {
      const fieldData = record[field.element];
      if (!fieldData || isFieldEmpty(fieldData.value)) {
        const count = emptyFieldCounts.get(field.element) || 0;
        emptyFieldCounts.set(field.element, count + 1);
      }

      // Type-specific validation
      if (fieldData && !isFieldEmpty(fieldData.value)) {
        const value = fieldData.value;

        // Validate numeric fields (FCV, NUM)
        if ((field.type === 'FCV' || field.type === 'NUM') && !/^[\d\s.-]+$/.test(value)) {
          errors.push({
            type: 'warning',
            field: field.element,
            message: `Non-numeric value in numeric field: "${value}"`,
            line: recordIndex + 1
          });
        }

        // Validate date fields (FCD)
        if (field.type === 'FCD' && value.length > 0) {
          if (!/^\d{6,8}$/.test(value.replace(/\s/g, ''))) {
            errors.push({
              type: 'warning',
              field: field.element,
              message: `Invalid date format: "${value}"`,
              line: recordIndex + 1
            });
          }
        }
      }
    });
  });

  // Report fields that are mostly empty (>80% empty in sample)
  const emptyThreshold = sampleSize * 0.8;
  emptyFieldCounts.forEach((count, element) => {
    if (count > emptyThreshold) {
      const percentage = ((count / sampleSize) * 100).toFixed(0);
      errors.push({
        type: 'warning',
        field: element,
        message: `Field is ${percentage}% empty in sampled records (${count}/${sampleSize})`
      });
    }
  });

  return errors;
}

/**
 * Get validation summary
 */
export function getValidationSummary(errors: ValidationError[]): {
  totalErrors: number;
  totalWarnings: number;
  errorsByField: Map<string, ValidationError[]>;
} {
  const errorsByField = new Map<string, ValidationError[]>();
  let totalErrors = 0;
  let totalWarnings = 0;

  errors.forEach(error => {
    if (error.type === 'error') totalErrors++;
    if (error.type === 'warning') totalWarnings++;

    const fieldErrors = errorsByField.get(error.field) || [];
    fieldErrors.push(error);
    errorsByField.set(error.field, fieldErrors);
  });

  return { totalErrors, totalWarnings, errorsByField };
}
