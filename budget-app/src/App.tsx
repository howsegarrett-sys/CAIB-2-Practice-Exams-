import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSheets } from './hooks/useSheets';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { LogExpense } from './components/LogExpense';
import type { CategoryData } from './types';

type Tab = 'dashboard' | 'log';

export default function App() {
  const auth = useAuth();
  const sheets = useSheets(auth.token);

  const [tab, setTab] = useState<Tab>('dashboard');
  const [preselected, setPreselected] = useState<CategoryData | null>(null);

  if (!auth.token) {
    return <AuthScreen auth={auth} />;
  }

  function handleLogExpense(category: CategoryData) {
    setPreselected(category);
    setTab('log');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 pt-safe pb-3 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold leading-tight">Howse Budget</h1>
            {auth.userEmail && (
              <p className="text-blue-200 text-xs truncate max-w-[200px]">{auth.userEmail}</p>
            )}
          </div>
          <button
            onClick={auth.signOut}
            className="text-blue-200 text-xs font-medium bg-blue-800 rounded-lg px-3 py-1.5 hover:bg-blue-900 active:bg-blue-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="pt-4">
          {tab === 'dashboard' ? (
            <Dashboard sheets={sheets} onLogExpense={handleLogExpense} />
          ) : (
            <LogExpense
              token={auth.token}
              sheets={sheets}
              preselectedCategory={preselected}
              onClearPreselect={() => setPreselected(null)}
            />
          )}
        </div>
      </main>

      {/* Bottom tab bar */}
      <nav className="bg-white border-t border-gray-200 flex pb-safe sticky bottom-0 z-10 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <TabButton
          active={tab === 'dashboard'}
          onClick={() => setTab('dashboard')}
          icon="📊"
          label="Dashboard"
        />
        <TabButton
          active={tab === 'log'}
          onClick={() => setTab('log')}
          icon="➕"
          label="Log Expense"
        />
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${
        active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
      {active && <span className="absolute bottom-0 h-0.5 w-12 bg-blue-600 rounded-t-full" />}
    </button>
  );
}
