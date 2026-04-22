import type { CategoryData, SheetState } from '../types';
import { CategoryCard } from './CategoryCard';

interface Props {
  sheets: SheetState;
  onLogExpense: (category: CategoryData) => void;
}

export function Dashboard({ sheets, onLogExpense }: Props) {
  const { loading, error, categories, monthName, refresh } = sheets;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading {monthName} budget…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-medium text-sm">Failed to load sheet</p>
          <p className="text-red-600 text-xs mt-1 break-all">{error}</p>
          <button
            onClick={refresh}
            className="mt-3 text-sm text-blue-600 font-medium underline"
          >
            Try again
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Make sure VITE_SPREADSHEET_ID is correct and the sheet is shared with your account.
        </p>
      </div>
    );
  }

  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const totalActuals = categories.reduce((s, c) => s + c.actuals, 0);
  const overallPct = totalBudget > 0 ? (totalActuals / totalBudget) * 100 : 0;

  return (
    <div className="px-4 pb-6">
      {/* Summary bar */}
      <div className="bg-blue-700 rounded-xl p-4 mb-4 text-white">
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">{monthName} Overview</p>
        <div className="flex justify-between items-end mt-1">
          <div>
            <p className="text-2xl font-bold">${totalActuals.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-blue-200 text-xs">of ${totalBudget.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} budgeted</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{Math.round(overallPct)}%</p>
            <p className="text-blue-200 text-xs">used</p>
          </div>
        </div>
        <div className="mt-3 bg-blue-900 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-blue-300 transition-all"
            style={{ width: `${Math.min(overallPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Refresh */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Categories</h2>
        <button
          onClick={refresh}
          className="text-xs text-blue-600 font-medium flex items-center gap-1"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Category cards */}
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} onLogExpense={onLogExpense} />
      ))}
    </div>
  );
}
