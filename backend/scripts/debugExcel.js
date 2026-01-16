import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Excel file
const EXCEL_FILE = path.join(__dirname, '../../..', '[TKC] NEW TECH - RALLY_GARRISON Leaders Calculator - By Davor.xlsx');

console.log('Reading Excel file:', EXCEL_FILE);
console.log('='.repeat(80));

try {
  const workbook = xlsx.readFile(EXCEL_FILE);

  console.log('\nALL SHEET NAMES:');
  console.log(workbook.SheetNames);
  console.log('\n' + '='.repeat(80));

  const sheetsToDebug = [
    'SCALES OF VALUES',
    'EQUIPMENT LIBRARY',
    'INSCRIPTIONS LIBRARY',
    'VIP',
    'CIVILISATION',
    'SPENDING',
    'CITY SKIN LIBRARY',
    'REFERENCES'
  ];

  sheetsToDebug.forEach(sheetName => {
    console.log(`\n\n### SHEET: ${sheetName} ###`);

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.log(`❌ Sheet "${sheetName}" NOT FOUND`);
      return;
    }

    console.log(`✓ Sheet found`);

    // Convert to JSON with header option to see raw data
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (jsonData.length === 0) {
      console.log('⚠️  No data rows found in sheet');
      return;
    }

    console.log(`\nTotal rows: ${jsonData.length}`);
    console.log(`\nColumn names (from first row):`);
    const columnNames = Object.keys(jsonData[0]);
    columnNames.forEach((col, idx) => {
      console.log(`  ${idx + 1}. "${col}"`);
    });

    console.log(`\nFirst 3 rows of data:`);
    const rowsToShow = Math.min(3, jsonData.length);
    for (let i = 0; i < rowsToShow; i++) {
      console.log(`\n--- Row ${i + 1} ---`);
      const row = jsonData[i];
      columnNames.forEach(col => {
        const value = row[col];
        if (value !== '' && value !== null && value !== undefined) {
          console.log(`  ${col}: ${value}`);
        }
      });
    }

    console.log('\n' + '-'.repeat(80));
  });

  console.log('\n\n' + '='.repeat(80));
  console.log('DEBUG COMPLETE');

} catch (error) {
  console.error('Error reading Excel file:', error);
  console.error('Stack:', error.stack);
}
