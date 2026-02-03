import { ref, computed } from 'vue';
import type { FieldMapping, ValidationError } from '../types';

export function useMapper(initialMappings: FieldMapping[] = []) {
  const mappings = ref<FieldMapping[]>([...initialMappings]);
  const editingField = ref<FieldMapping | null>(null);
  const selectedFields = ref<Set<string>>(new Set());

  /**
   * Add a new field mapping
   */
  const addField = (field: FieldMapping): void => {
    mappings.value.push(field);
    sortMappings();
  };

  /**
   * Update an existing field mapping
   */
  const updateField = (element: string, updates: Partial<FieldMapping>): void => {
    const index = mappings.value.findIndex(m => m.element === element);
    if (index !== -1) {
      const field = mappings.value[index];
      const updatedField: FieldMapping = {
        ...field,
        ...updates
      } as FieldMapping;

      // Recalculate length if positions changed
      if (updates.positionStart !== undefined || updates.positionEnd !== undefined) {
        updatedField.length = updatedField.positionEnd - updatedField.positionStart + 1;
      }

      mappings.value[index] = updatedField;
      sortMappings();
    }
  };

  /**
   * Delete a field mapping
   */
  const deleteField = (element: string): void => {
    mappings.value = mappings.value.filter(m => m.element !== element);
    selectedFields.value.delete(element);
  };

  /**
   * Delete multiple fields
   */
  const deleteFields = (elements: string[]): void => {
    mappings.value = mappings.value.filter(m => !elements.includes(m.element));
    elements.forEach(el => selectedFields.value.delete(el));
  };

  /**
   * Sort mappings by position start
   */
  const sortMappings = (): void => {
    mappings.value.sort((a, b) => a.positionStart - b.positionStart);
  };

  /**
   * Get field by element name
   */
  const getField = (element: string): FieldMapping | undefined => {
    return mappings.value.find(m => m.element === element);
  };

  /**
   * Check if field exists
   */
  const fieldExists = (element: string): boolean => {
    return mappings.value.some(m => m.element === element);
  };

  /**
   * Set field for editing
   */
  const startEditing = (field: FieldMapping): void => {
    editingField.value = { ...field };
  };

  /**
   * Cancel editing
   */
  const cancelEditing = (): void => {
    editingField.value = null;
  };

  /**
   * Save edited field
   */
  const saveEditing = (): void => {
    if (editingField.value) {
      updateField(editingField.value.element, editingField.value);
      editingField.value = null;
    }
  };

  /**
   * Toggle field selection
   */
  const toggleSelection = (element: string): void => {
    if (selectedFields.value.has(element)) {
      selectedFields.value.delete(element);
    } else {
      selectedFields.value.add(element);
    }
  };

  /**
   * Select all fields
   */
  const selectAll = (): void => {
    mappings.value.forEach(m => selectedFields.value.add(m.element));
  };

  /**
   * Clear selection
   */
  const clearSelection = (): void => {
    selectedFields.value.clear();
  };

  /**
   * Validate field before adding/updating
   */
  const validateField = (field: FieldMapping): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!field.element || field.element.trim() === '') {
      errors.push({
        type: 'error',
        field: 'element',
        message: 'Element name is required'
      });
    }

    if (field.positionStart < 1) {
      errors.push({
        type: 'error',
        field: 'positionStart',
        message: 'Position start must be >= 1'
      });
    }

    if (field.positionEnd < field.positionStart) {
      errors.push({
        type: 'error',
        field: 'positionEnd',
        message: 'Position end must be >= position start'
      });
    }

    if (field.length <= 0) {
      errors.push({
        type: 'error',
        field: 'length',
        message: 'Length must be > 0'
      });
    }

    const calculatedLength = field.positionEnd - field.positionStart + 1;
    if (calculatedLength !== field.length) {
      errors.push({
        type: 'warning',
        field: 'length',
        message: `Length mismatch: calculated ${calculatedLength} but specified ${field.length}`
      });
    }

    return errors;
  };

  /**
   * Computed: Number of selected fields
   */
  const selectedCount = computed(() => selectedFields.value.size);

  /**
   * Computed: All selected elements
   */
  const selectedElements = computed(() => Array.from(selectedFields.value));

  return {
    mappings,
    editingField,
    selectedFields,
    selectedCount,
    selectedElements,
    addField,
    updateField,
    deleteField,
    deleteFields,
    sortMappings,
    getField,
    fieldExists,
    startEditing,
    cancelEditing,
    saveEditing,
    toggleSelection,
    selectAll,
    clearSelection,
    validateField
  };
}
