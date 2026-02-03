import { ref, computed } from 'vue';
import type { FieldMapping, ParsedRecord, ValidationError } from '../types';
import { validateMappings, validateParsedData } from '../utils/validators';

export function useValidation() {
  const validationErrors = ref<ValidationError[]>([]);
  const validationEnabled = ref<boolean>(true);
  const lastValidated = ref<Date | null>(null);

  /**
   * Run all validators
   */
  const validate = (mappings: FieldMapping[], parsedRecords: ParsedRecord[] = []): void => {
    if (!validationEnabled.value) return;

    const errors: ValidationError[] = [];

    // Validate mappings
    const mappingErrors = validateMappings(mappings);
    errors.push(...mappingErrors);

    // Validate parsed data if available
    if (parsedRecords.length > 0) {
      const dataErrors = validateParsedData(parsedRecords, mappings);
      errors.push(...dataErrors);
    }

    validationErrors.value = errors;
    lastValidated.value = new Date();
  };

  /**
   * Clear all validation errors
   */
  const clearValidation = (): void => {
    validationErrors.value = [];
    lastValidated.value = null;
  };

  /**
   * Get errors for specific field
   */
  const getFieldErrors = (fieldName: string): ValidationError[] => {
    return validationErrors.value.filter(e => e.field === fieldName);
  };

  /**
   * Check if field has errors
   */
  const hasFieldErrors = (fieldName: string): boolean => {
    return validationErrors.value.some(e => e.field === fieldName && e.type === 'error');
  };

  /**
   * Check if field has warnings
   */
  const hasFieldWarnings = (fieldName: string): boolean => {
    return validationErrors.value.some(e => e.field === fieldName && e.type === 'warning');
  };

  /**
   * Enable/disable validation
   */
  const toggleValidation = (): void => {
    validationEnabled.value = !validationEnabled.value;
    if (!validationEnabled.value) {
      clearValidation();
    }
  };

  /**
   * Computed: Errors only
   */
  const errors = computed(() => {
    return validationErrors.value.filter(e => e.type === 'error');
  });

  /**
   * Computed: Warnings only
   */
  const warnings = computed(() => {
    return validationErrors.value.filter(e => e.type === 'warning');
  });

  /**
   * Computed: Error count
   */
  const errorCount = computed(() => errors.value.length);

  /**
   * Computed: Warning count
   */
  const warningCount = computed(() => warnings.value.length);

  /**
   * Computed: Has any errors
   */
  const hasErrors = computed(() => errorCount.value > 0);

  /**
   * Computed: Has any warnings
   */
  const hasWarnings = computed(() => warningCount.value > 0);

  /**
   * Computed: Validation status
   */
  const validationStatus = computed<'success' | 'warning' | 'error'>(() => {
    if (hasErrors.value) return 'error';
    if (hasWarnings.value) return 'warning';
    return 'success';
  });

  return {
    validationErrors,
    validationEnabled,
    lastValidated,
    errors,
    warnings,
    errorCount,
    warningCount,
    hasErrors,
    hasWarnings,
    validationStatus,
    validate,
    clearValidation,
    getFieldErrors,
    hasFieldErrors,
    hasFieldWarnings,
    toggleValidation
  };
}
