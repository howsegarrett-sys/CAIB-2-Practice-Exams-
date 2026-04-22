import { SHEET_LAYOUT, CATEGORIES, MONTH_NAMES } from '../config';
import type { CategoryData, MonthColumns } from '../types';

/** Convert 1-based column index to A1 letter(s): 1→A, 26→Z, 27→AA */
export function colIndexToLetter(col: number): string {
  let result = '';
  while (col > 0) {
    const rem = (col - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    col = Math.floor((col - 1) / 26);
  }
  return result;
}

/** Convert A1 letter(s) to 1-based column index */
export function letterToColIndex(letters: string): number {
  return letters.toUpperCase().split('').reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0);
}

/** Build an A1 notation cell reference, e.g. row=3 col=4 → "D3" */
export function cellRef(col: number, row: number): string {
  return `${colIndexToLetter(col)}${row}`;
}

/**
 * Given a 2D array of sheet values (row 0 = first row read), scan the first row
 * for any month name. Returns the 1-based column index where January starts,
 * or falls back to SHEET_LAYOUT.firstMonthCol.
 */
export function detectFirstMonthCol(rows: string[][]): number {
  const headerRow = rows[SHEET_LAYOUT.monthHeaderRow - 1] ?? [];
  for (let i = 0; i < headerRow.length; i++) {
    const cell = (headerRow[i] ?? '').trim().toLowerCase();
    if (cell === 'january' || cell === 'jan') {
      return i + 1; // convert 0-based to 1-based
    }
  }
  return SHEET_LAYOUT.firstMonthCol;
}

/** Return the budget/actuals/variance column indices (1-based) for a given month (1=Jan). */
export function getMonthColumns(month: number, firstMonthCol: number): MonthColumns {
  const base = firstMonthCol + (month - 1) * SHEET_LAYOUT.colsPerMonth;
  return {
    budget: base + SHEET_LAYOUT.budgetOffset,
    actuals: base + SHEET_LAYOUT.actualsOffset,
    variance: base + SHEET_LAYOUT.varianceOffset,
  };
}

/** Parse a sheet cell value to a number. Returns 0 for empty/invalid. */
export function parseNum(val: string | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val.replace(/[$,\s]/g, ''));
  return isNaN(n) ? 0 : n;
}

/**
 * Given the full 2D sheet data (starting from row 1), the month columns, and
 * the row the data starts at, build the CategoryData array by matching category
 * names in column A against our known categories.
 */
export function buildCategoryData(
  rows: string[][],
  cols: MonthColumns,
  currentMonth: number,
): CategoryData[] {
  const results: CategoryData[] = [];

  for (const cat of CATEGORIES) {
    let matchedRow = -1;

    for (let r = SHEET_LAYOUT.dataStartRow - 1; r < rows.length; r++) {
      const cellVal = (rows[r]?.[SHEET_LAYOUT.categoryCol - 1] ?? '').toLowerCase().trim();
      if (!cellVal) continue;

      const matched = cat.searchTerms.some((term) => cellVal.includes(term.toLowerCase()));
      if (matched) {
        matchedRow = r + 1; // convert 0-based array index to 1-based row number
        break;
      }
    }

    if (matchedRow === -1) {
      // Category not found in sheet — still show it so user knows
      results.push({
        id: cat.id,
        name: cat.name,
        budget: 0,
        actuals: 0,
        remaining: 0,
        percentUsed: 0,
        row: -1,
        actualsCol: cols.actuals,
      });
      continue;
    }

    const rowData = rows[matchedRow - 1];
    const budget = parseNum(rowData?.[cols.budget - 1]);
    const actuals = parseNum(rowData?.[cols.actuals - 1]);
    const remaining = budget - actuals;
    const percentUsed = budget > 0 ? (actuals / budget) * 100 : actuals > 0 ? 100 : 0;

    results.push({
      id: cat.id,
      name: cat.name,
      budget,
      actuals,
      remaining,
      percentUsed,
      row: matchedRow,
      actualsCol: cols.actuals,
    });
  }

  void currentMonth; // used by caller for context, not needed here
  return results;
}

export function currentMonthIndex(): number {
  return new Date().getMonth() + 1; // 1-based
}

export function currentMonthName(): string {
  return MONTH_NAMES[new Date().getMonth()];
}

/** Format a dollar amount for display */
export function formatDollar(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
}

/** Return Tailwind color classes based on % budget used */
export function statusColors(pct: number): { bg: string; bar: string; text: string; badge: string } {
  if (pct >= 100) {
    return { bg: 'bg-red-50', bar: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
  }
  if (pct >= 75) {
    return { bg: 'bg-yellow-50', bar: 'bg-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' };
  }
  return { bg: 'bg-green-50', bar: 'bg-green-500', text: 'text-green-700', badge: 'bg-green-100 text-green-700' };
}
