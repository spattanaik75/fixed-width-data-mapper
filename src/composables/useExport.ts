import { ref } from 'vue';
import * as XLSX from 'xlsx';
import type { FieldMapping, ParsedRecord, ValidationError } from '../types';
import { mapperToCSV } from '../utils/csvParser';
import { exportParsedDataToCSV } from '../utils/fixedWidthParser';

export function useExport() {
  const exporting = ref<boolean>(false);
  const exportError = ref<string | null>(null);

  /**
   * Download a file
   */
  const downloadFile = (content: string | Blob, filename: string, mimeType: string): void => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Export mapper as CSV
   */
  const exportMapperCSV = (mappings: FieldMapping[], filename: string = 'mapper.csv'): void => {
    exporting.value = true;
    exportError.value = null;

    try {
      const csv = mapperToCSV(mappings);
      downloadFile(csv, filename, 'text/csv');
    } catch (error) {
      exportError.value = error instanceof Error ? error.message : 'Failed to export mapper as CSV';
      throw error;
    } finally {
      exporting.value = false;
    }
  };

  /**
   * Export mapper as Excel
   */
  const exportMapperExcel = (mappings: FieldMapping[], filename: string = 'mapper.xlsx'): void => {
    exporting.value = true;
    exportError.value = null;

    try {
      // Prepare data for Excel
      const data = mappings.map(m => ({
        Element: m.element,
        Value: m.value,
        Description: m.description,
        Type: m.type,
        Position: `${m.positionStart} to ${m.positionEnd}`,
        Length: m.length,
        Preview: m.preview
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, // Element
        { wch: 20 }, // Value
        { wch: 40 }, // Description
        { wch: 10 }, // Type
        { wch: 15 }, // Position
        { wch: 10 }, // Length
        { wch: 30 }  // Preview
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Field Mappings');

      // Write file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      exportError.value = error instanceof Error ? error.message : 'Failed to export mapper as Excel';
      throw error;
    } finally {
      exporting.value = false;
    }
  };

  /**
   * Export parsed data as CSV
   */
  const exportDataCSV = (
    parsedRecords: ParsedRecord[],
    mappings: FieldMapping[],
    filename: string = 'parsed-data.csv'
  ): void => {
    exporting.value = true;
    exportError.value = null;

    try {
      const csv = exportParsedDataToCSV(parsedRecords, mappings);
      downloadFile(csv, filename, 'text/csv');
    } catch (error) {
      exportError.value = error instanceof Error ? error.message : 'Failed to export data as CSV';
      throw error;
    } finally {
      exporting.value = false;
    }
  };

  /**
   * Export validation report
   */
  const exportValidationReport = (
    validationErrors: ValidationError[],
    mappings: FieldMapping[],
    filename: string = 'validation-report.xlsx'
  ): void => {
    exporting.value = true;
    exportError.value = null;

    try {
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        { Metric: 'Total Fields', Value: mappings.length },
        { Metric: 'Total Errors', Value: validationErrors.filter(e => e.type === 'error').length },
        { Metric: 'Total Warnings', Value: validationErrors.filter(e => e.type === 'warning').length },
        { Metric: 'Validation Date', Value: new Date().toISOString() }
      ];
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Errors/Warnings sheet
      if (validationErrors.length > 0) {
        const errorsData = validationErrors.map(e => ({
          Type: e.type.toUpperCase(),
          Field: e.field,
          Message: e.message,
          Line: e.line || ''
        }));
        const errorsWs = XLSX.utils.json_to_sheet(errorsData);
        errorsWs['!cols'] = [
          { wch: 10 },  // Type
          { wch: 20 },  // Field
          { wch: 60 },  // Message
          { wch: 10 }   // Line
        ];
        XLSX.utils.book_append_sheet(wb, errorsWs, 'Validation Results');
      }

      // Mappings sheet
      const mappingsData = mappings.map(m => ({
        Element: m.element,
        Value: m.value,
        Description: m.description,
        Type: m.type,
        'Start Pos': m.positionStart,
        'End Pos': m.positionEnd,
        Length: m.length
      }));
      const mappingsWs = XLSX.utils.json_to_sheet(mappingsData);
      XLSX.utils.book_append_sheet(wb, mappingsWs, 'Field Mappings');

      // Write file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      exportError.value = error instanceof Error ? error.message : 'Failed to export validation report';
      throw error;
    } finally {
      exporting.value = false;
    }
  };

  /**
   * Export all (mapper + data + validation)
   */
  const exportAll = (
    mappings: FieldMapping[],
    parsedRecords: ParsedRecord[],
    validationErrors: ValidationError[]
  ): void => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    exportMapperCSV(mappings, `mapper-${timestamp}.csv`);
    if (parsedRecords.length > 0) {
      exportDataCSV(parsedRecords, mappings, `data-${timestamp}.csv`);
    }
    exportValidationReport(validationErrors, mappings, `validation-${timestamp}.xlsx`);
  };

  return {
    exporting,
    exportError,
    exportMapperCSV,
    exportMapperExcel,
    exportDataCSV,
    exportValidationReport,
    exportAll
  };
}
