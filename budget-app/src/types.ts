export interface CategoryConfig {
  id: string;
  name: string;
  searchTerms: string[];
}

export interface CategoryData {
  id: string;
  name: string;
  budget: number;
  actuals: number;
  remaining: number;
  percentUsed: number;
  /** 1-based row index in the sheet */
  row: number;
  /** 1-based column index for the actuals cell */
  actualsCol: number;
}

export interface MonthColumns {
  /** 1-based column index */
  budget: number;
  actuals: number;
  variance: number;
}

export interface SheetState {
  loading: boolean;
  error: string | null;
  categories: CategoryData[];
  monthName: string;
  refresh: () => void;
}

export interface AuthState {
  token: string | null;
  userEmail: string | null;
  signIn: () => void;
  signOut: () => void;
}
