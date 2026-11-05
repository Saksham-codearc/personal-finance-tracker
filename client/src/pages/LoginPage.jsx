import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowRight, LoaderCircle, Sparkles } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import PasswordInput from '../components/ui/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, healthApi } from '../lib/api';

const DEMO = { email: 'demo@finora.app', password: 'Demo@1234' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoAvailable, setDemoAvailable] = useState(false);

  useEffect(() => {
    healthApi
      .get()
      .then((response) => setDemoAvailable(Boolean(response.data.data.demo)))
      .catch(() => setDemoAvailable(false));
  }, []);

  const destination = location.state?.from || '/';

  function validate() {
    const next = {};
    if (!form.email) next.email = 'Email is required.';
    if (!form.password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form);
      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setDemoLoading(true);
    setServerError('');
    try {
      await login(DEMO);
      toast.success('Welcome to the demo workspace');
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to open the demo account.'));
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-slide-up">
        <p className="text-sm font-semibold text-mint-700 dark:text-mint-400">Welcome back</p>
        <h1 className="mt-2 font-display text-[32px] font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white">
          Sign in to Finora
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Pick up where you left off and keep your financial goals moving.
        </p>

        {serverError && (
          <div className="mt-5 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }));
                setErrors((current) => ({ ...current, email: undefined }));
                setServerError('');
              }}
              className={errors.email ? 'input input-error' : 'input'}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0" htmlFor="password">
                Password
              </label>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => {
                setForm((current) => ({ ...current, password: event.target.value }));
                setErrors((current) => ({ ...current, password: undefined }));
                setServerError('');
              }}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button type="submit" className="btn-primary mt-2 w-full py-3" disabled={loading}>
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        {demoAvailable && (
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-mint-200/80 bg-mint-50/70 p-4 dark:border-mint-500/20 dark:bg-mint-500/[0.06]">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-mint-300/20 blur-xl" />
            <div className="relative flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-600 text-white">
                <Sparkles size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                  Just exploring?
                </p>
                <p className="mt-0.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Open a ready-made account with six months of sample data.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary shrink-0 px-3 py-2 text-[11px]"
                onClick={handleDemoLogin}
                disabled={demoLoading}
              >
                {demoLoading ? <LoaderCircle size={14} className="animate-spin" /> : 'Open demo'}
              </button>
            </div>
          </div>
        )}

        <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-mint-700 hover:text-mint-800 dark:text-mint-400 dark:hover:text-mint-300"
          >
            Create one for free
          </Link>
        </p>

        <p className="mt-10 text-center text-[11px] text-slate-400 dark:text-slate-600">
          Secure JWT authentication · Your data stays private
        </p>
      </div>
    </AuthLayout>
  );
}
