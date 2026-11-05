import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Check,
  LoaderCircle,
  LogOut,
  Mail,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../lib/api';
import { formatDate, initials } from '../lib/format';
import { cn } from '../lib/cn';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const dirty = name.trim() !== (user?.name || '');

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success('Profile updated');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update your profile.'));
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    toast.success('Signed out safely');
    navigate('/login', { replace: true });
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Your workspace"
        title="Settings"
        description="Manage your profile, theme, and account security."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <UserRound size={17} className="text-mint-600 dark:text-mint-400" />
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Profile
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-slate-400">
            This is how you appear in your Finora workspace.
          </p>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-mint-400 to-mint-700 font-display text-2xl font-extrabold text-white shadow-[0_16px_40px_-16px_rgba(7,149,95,0.7)]">
              {initials(user?.name)}
            </div>
            <div>
              <p className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {user?.name}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Mail size={13} />
                {user?.email}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Member since {formatDate(user?.createdAt, { month: 'long', day: undefined })}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="mt-7 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="profile-name">
                  Display name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError('');
                  }}
                  className="input"
                  maxLength={60}
                />
              </div>
              <div>
                <label className="label" htmlFor="profile-email">
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="input cursor-not-allowed bg-slate-50 text-slate-500 dark:bg-white/[0.02] dark:text-slate-400"
                />
                <p className="mt-1.5 text-[10px] text-slate-400">Email cannot be changed in this demo.</p>
              </div>
            </div>

            {error && <p className="field-error">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={!dirty || saving}
              >
                {saving && <LoaderCircle size={16} className="animate-spin" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-mint-600 dark:text-mint-400" />
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Account security
            </h2>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-slate-400">
            Your session is secured with a signed JSON Web Token and expires automatically.
          </p>

          <div className="mt-5 rounded-2xl border border-mint-200/70 bg-mint-50/60 p-4 dark:border-mint-500/20 dark:bg-mint-500/[0.06]">
            <div className="flex items-center gap-2 text-mint-800 dark:text-mint-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-600 text-white">
                <Check size={12} strokeWidth={3} />
              </span>
              <span className="text-[12px] font-bold">Protected session</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-mint-900/60 dark:text-mint-200/60">
              Passwords are hashed with bcrypt. API routes require a valid token and every record is
              scoped to your account.
            </p>
          </div>

          <div className="mt-5 space-y-3 text-[12px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/[0.05]">
              <span className="text-slate-400">Authentication</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">JWT · 7 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Data ownership</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Private</span>
            </div>
          </div>

          <button type="button" className="btn-danger mt-6 w-full" onClick={handleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </section>

        <section className="card p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Appearance
          </h2>
          <p className="mt-1 text-[12px] text-slate-400">
            Choose how Finora looks on this device. Your choice is saved automatically.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm font-semibold transition-all',
                  mode === value
                    ? 'border-mint-500 bg-mint-50 text-mint-800 dark:border-mint-400/60 dark:bg-mint-500/10 dark:text-mint-300'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/[0.04]'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    mode === value
                      ? 'bg-white text-mint-600 shadow-sm dark:bg-coal-800 dark:text-mint-400'
                      : 'bg-slate-100 dark:bg-white/[0.05]'
                  )}
                >
                  <Icon size={18} />
                </span>
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            About Finora
          </h2>
          <p className="mt-2 text-[12px] leading-6 text-slate-500 dark:text-slate-400">
            A full-stack personal finance tracker built with React, Tailwind CSS, Express, MongoDB,
            and Recharts.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] dark:border-white/[0.05]">
            <span className="text-slate-400">Version</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">1.0.0</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Currency</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">INR (₹)</span>
          </div>
        </section>
      </div>
    </div>
  );
}
