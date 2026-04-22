import { useState, useEffect, useCallback } from 'react';
import { SPREADSHEET_ID, SHEET_TAB, SHEET_LAYOUT } from '../config';
import { getValues, getSingleValue, putValue } from '../api/sheets';
import {
  detectFirstMonthCol,
  getMonthColumns,
  buildCategoryData,
  currentMonthIndex,
  currentMonthName,
  cellRef,
  parseNum,
  colIndexToLetter,
} from '../utils/sheetUtils';
import type { CategoryData, SheetState } from '../types';

function sheetRange(startCol: number, endCol: string | number, startRow: number, endRow: number): string {
  const end = typeof endCol === 'number' ? colIndexToLetter(endCol) : endCol;
  return `'${SHEET_TAB}'!${colIndexToLetter(startCol)}${startRow}:${end}${endRow}`;
}

export function useSheets(token: string | null): SheetState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const monthName = currentMonthName();

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const range = sheetRange(
        1,
        SHEET_LAYOUT.readRangeEnd,
        1,
        SHEET_LAYOUT.dataEndRow,
      );
      const rows = await getValues(token, SPREADSHEET_ID, range);
      const firstMonthCol = detectFirstMonthCol(rows);
      const cols = getMonthColumns(currentMonthIndex(), firstMonthCol);
      const data = buildCategoryData(rows, cols, currentMonthIndex());
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, categories, monthName, refresh: load };
}

/** Log an expense: read current actuals value, add amount, write back. */
export async function logExpense(
  token: string,
  category: CategoryData,
  amount: number,
): Promise<void> {
  if (category.row === -1) {
    throw new Error(`Category "${category.name}" was not found in the sheet.`);
  }
  const cell = cellRef(category.actualsCol, category.row);
  const range = `'${SHEET_TAB}'!${cell}`;

  const currentRaw = await getSingleValue(token, SPREADSHEET_ID, range);
  const current = parseNum(currentRaw);
  const newValue = Math.round((current + amount) * 100) / 100;

  await putValue(token, SPREADSHEET_ID, range, newValue);
}
