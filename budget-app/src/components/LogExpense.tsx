import { useState, useEffect } from 'react';
import type { CategoryData, SheetState } from '../types';
import { logExpense } from '../hooks/useSheets';

interface Props {
  token: string;
  sheets: SheetState;
  preselectedCategory?: CategoryData | null;
  onClearPreselect: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function LogExpense({ token, sheets, preselectedCategory, onClearPreselect }: Props) {
  const { categories, refresh } = sheets;

  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // When a category is pre-selected (from Dashboard "+ Log" button), fill the dropdown
  useEffect(() => {
    if (preselectedCategory) {
      setCategoryId(preselectedCategory.id);
      onClearPreselect();
    }
  }, [preselectedCategory, onClearPreselect]);

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory) return;

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitState('submitting');
    setErrorMsg('');

    try {
      await logExpense(token, selectedCategory, parsed);
      setSubmitState('success');
      setAmount('');
      // Refresh dashboard data in background
      refresh();
      setTimeout(() => setSubmitState('idle'), 2500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setSubmitState('error');
    }
  }

  const isSubmitting = submitState === 'submitting';

  return (
    <div className="px-4 pb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Log an Expense</h2>

      {submitState === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <p className="text-green-700 font-medium text-sm">Expense logged successfully!</p>
        </div>
      )}

      {submitState === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 font-medium text-sm">Failed to log expense</p>
          <p className="text-red-600 text-xs mt-1">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="category">
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="" disabled>Select a category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} disabled={cat.row === -1}>
                  {cat.name}{cat.row === -1 ? ' (not found in sheet)' : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Current actuals hint */}
        {selectedCategory && selectedCategory.row !== -1 && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            Current actuals: <strong className="text-gray-800">${selectedCategory.actuals.toFixed(2)}</strong>
            {' '}· Budget: <strong className="text-gray-800">${selectedCategory.budget.toFixed(2)}</strong>
            {' '}· Remaining: <strong className={selectedCategory.remaining < 0 ? 'text-red-600' : 'text-gray-800'}>
              ${selectedCategory.remaining.toFixed(2)}
            </strong>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="amount">
            Amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (submitState === 'error') setSubmitState('idle');
              }}
              required
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !categoryId || !amount}
          className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base active:bg-blue-700 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            'Add to Actuals'
          )}
        </button>
      </form>
    </div>
  );
}
