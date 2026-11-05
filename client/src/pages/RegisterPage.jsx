import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowRight, LoaderCircle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import PasswordInput from '../components/ui/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { cn } from '../lib/cn';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecks = {
    length: form.password.length >= 8,
    letter: /[A-Za-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  };

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError('');
  }

  function validate() {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = 'Enter your full name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!passwordChecks.length || !passwordChecks.letter || !passwordChecks.number) {
      next.password = 'Use at least 8 characters with a letter and a number.';
    }
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Your account is ready');
      navigate('/', { replace: true });
    } catch (error) {
      const fieldErrors = error.response?.data?.fields;
      if (fieldErrors) setErrors(fieldErrors);
      setServerError(getErrorMessage(error, 'Unable to create your account.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-slide-up">
        <p className="text-sm font-semibold text-mint-700 dark:text-mint-400">Start fresh</p>
        <h1 className="mt-2 font-display text-[32px] font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          One clear view of your money. Free to start, no card required.
        </p>

        {serverError && (
          <div className="mt-5 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Aarav Mehta"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className={errors.name ? 'input input-error' : 'input'}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

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
              onChange={(event) => updateField('email', event.target.value)}
              className={errors.email ? 'input input-error' : 'input'}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              className={errors.password ? 'input-error' : ''}
            />
            {form.password && (
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                {[
                  ['length', '8+ characters'],
                  ['letter', 'One letter'],
                  ['number', 'One number'],
                ].map(([key, label]) => (
                  <span
                    key={key}
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] font-medium',
                      passwordChecks[key]
                        ? 'text-mint-700 dark:text-mint-400'
                        : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        passwordChecks[key] ? 'bg-mint-500' : 'bg-slate-300 dark:bg-slate-600'
                      )}
                    />
                    {label}
                  </span>
                ))}
              </div>
            )}
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn-primary mt-2 w-full py-3" disabled={loading}>
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : null}
            {loading ? 'Creating account…' : 'Create account'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-mint-700 hover:text-mint-800 dark:text-mint-400 dark:hover:text-mint-300"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-10 text-center text-[11px] leading-5 text-slate-400 dark:text-slate-600">
          By creating an account, you agree to keep your login details secure.
        </p>
      </div>
    </AuthLayout>
  );
}
