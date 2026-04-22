import type { CategoryData } from '../types';
import { formatDollar, statusColors } from '../utils/sheetUtils';

interface Props {
  category: CategoryData;
  onLogExpense: (category: CategoryData) => void;
}

export function CategoryCard({ category, onLogExpense }: Props) {
  const pct = Math.min(category.percentUsed, 100);
  const colors = statusColors(category.percentUsed);
  const notFound = category.row === -1;

  return (
    <div className={`rounded-xl p-4 mb-3 ${notFound ? 'bg-gray-50' : colors.bg} border border-opacity-20 border-gray-200`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {category.name}
          </h3>

          {notFound ? (
            <p className="text-xs text-gray-400 mt-1">Not found in sheet</p>
          ) : (
            <>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${colors.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`text-xs font-medium shrink-0 px-1.5 py-0.5 rounded-full ${colors.badge}`}>
                  {category.percentUsed > 999 ? '>999' : Math.round(category.percentUsed)}%
                </span>
              </div>

              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Budget <strong className="text-gray-800">{formatDollar(category.budget)}</strong></span>
                <span>Spent <strong className="text-gray-800">{formatDollar(category.actuals)}</strong></span>
                <span>
                  Left{' '}
                  <strong className={category.remaining < 0 ? 'text-red-600' : 'text-gray-800'}>
                    {formatDollar(category.remaining)}
                  </strong>
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => onLogExpense(category)}
          className="shrink-0 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium active:bg-blue-700 hover:bg-blue-700 transition-colors"
          aria-label={`Log expense for ${category.name}`}
        >
          + Log
        </button>
      </div>
    </div>
  );
}
