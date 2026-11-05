import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Settings2,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { initials } from '../lib/format';
import { cn } from '../lib/cn';
import Logo from '../components/ui/Logo';
import TransactionModal from '../components/transactions/TransactionModal';

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/settings', label: 'Settings', icon: Settings2 },
];

function SidebarNav({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {navigation.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => onNavigate?.()}
          className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
        >
          {({ isActive }) => (
            <>
              <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-mint-500 dark:bg-mint-400" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { openTransactionModal, transactionModal, closeTransactionModal } = useUI();

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f4f7f3] dark:bg-coal-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-slate-200/70 bg-white/80 px-4 py-6 backdrop-blur-xl dark:border-white/[0.06] dark:bg-coal-900/80 lg:flex">
        <Link to="/" className="px-2">
          <Logo />
        </Link>

        <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400 dark:text-slate-500">
          Workspace
        </p>
        <SidebarNav />

        <div className="relative mt-auto overflow-hidden rounded-2xl bg-[#0b1b14] p-4 text-white">
          <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-mint-400/20 blur-2xl" />
          <div className="relative">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-mint-300">
              <Sparkles size={15} />
            </span>
            <p className="mt-3 text-[13px] font-semibold leading-5">
              Small habits make a big difference.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-white/40">
              Review your top spending category every Sunday.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200/70 p-2.5 dark:border-white/[0.07]">
          <Link
            to="/settings"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-100 text-xs font-bold text-mint-800 dark:bg-mint-500/15 dark:text-mint-300"
          >
            {initials(user?.name)}
          </Link>
          <Link to="/settings" className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
              {user?.name}
            </p>
            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{user?.email}</p>
          </Link>
          <button type="button" className="icon-btn" onClick={logout} aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-[#f4f7f3]/85 backdrop-blur-xl dark:border-white/[0.05] dark:bg-coal-950/85">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Link to="/" className="lg:hidden">
                <Logo markOnly />
              </Link>
              <div className="hidden sm:block">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  Personal workspace
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                  {today}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                type="button"
                className="icon-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link to="/settings" className="lg:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-100 text-[11px] font-bold text-mint-800 dark:bg-mint-500/15 dark:text-mint-300">
                  {initials(user?.name)}
                </span>
              </Link>
              <button
                type="button"
                className="btn-primary"
                onClick={() => openTransactionModal()}
              >
                <Plus size={17} strokeWidth={2.5} />
                <span className="hidden xs:inline sm:inline">Add transaction</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/90 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl dark:border-white/[0.07] dark:bg-coal-900/90 lg:hidden">
        <div className="mx-auto flex max-w-md items-center">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('mobile-nav-link', isActive && 'mobile-nav-link-active')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-12 items-center justify-center rounded-xl transition-colors',
                      isActive && 'bg-mint-50 dark:bg-mint-500/10'
                    )}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <TransactionModal
        open={transactionModal.open}
        transaction={transactionModal.transaction}
        onClose={closeTransactionModal}
      />
    </div>
  );
}
