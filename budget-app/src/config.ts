import type { CategoryConfig } from './types';

export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID as string;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
export const SHEET_TAB = '2026 Howse Budget';

/**
 * Sheet layout assumptions (adjust if your sheet differs):
 *
 * Row 1 (MONTH_HEADER_ROW): contains month names — "January", "February", etc.
 *   Merged cells mean only the first column of each 3-column block has a value.
 *
 * Row 2 (DATA_HEADER_ROW): contains "Budget", "Actuals", "Variance" repeated.
 *
 * Row DATA_START_ROW onward: category rows.
 *
 * Column A (col 1): category names.
 * Each month occupies COLS_PER_MONTH consecutive columns:
 *   offset 0 = Budget, offset 1 = Actuals, offset 2 = Variance
 *
 * January starts at column FIRST_MONTH_COL (1-based).
 */
export const SHEET_LAYOUT = {
  monthHeaderRow: 1,
  dataHeaderRow: 2,
  dataStartRow: 3,
  dataEndRow: 60,
  categoryCol: 1,        // Column A
  firstMonthCol: 2,      // Column B = January Budget
  colsPerMonth: 3,
  budgetOffset: 0,
  actualsOffset: 1,
  varianceOffset: 2,
  // How many columns to read (A through ~AQ covers 12 months × 3 + 1 label col)
  readRangeEnd: 'AQ',
};

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'groceries',
    name: 'Groceries / household items',
    searchTerms: ['groceries', 'grocery', 'household'],
  },
  {
    id: 'eating_out',
    name: 'Eating out',
    searchTerms: ['eating out', 'eat out', 'restaurant', 'dining'],
  },
  {
    id: 'car_gas',
    name: 'Car gas',
    searchTerms: ['car gas', 'gas - car', 'gas (car)', 'gasoline car', 'car fuel'],
  },
  {
    id: 'truck_gas',
    name: 'Truck gas',
    searchTerms: ['truck gas', 'gas - truck', 'gas (truck)', 'gasoline truck', 'truck fuel'],
  },
  {
    id: 'pet',
    name: 'Pet expenses',
    searchTerms: ['pet'],
  },
  {
    id: 'baby',
    name: 'Baby stuff',
    searchTerms: ['baby'],
  },
  {
    id: 'liquor',
    name: 'Liquor',
    searchTerms: ['liquor', 'alcohol', 'beer', 'wine', 'spirits'],
  },
  {
    id: 'home_maintenance',
    name: 'Home/yard maintenance',
    searchTerms: ['maintenance', 'yard maintenance', 'home maintenance'],
  },
  {
    id: 'home_renos',
    name: 'Home/yard renos or projects',
    searchTerms: ['reno', 'renovation', 'project', 'yard project', 'home project'],
  },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');
