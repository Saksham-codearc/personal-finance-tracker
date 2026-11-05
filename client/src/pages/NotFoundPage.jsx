import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import Logo from '../components/ui/Logo';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7f3] px-6 text-center dark:bg-coal-950">
      <Logo />
      <div className="mt-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-mint-100 text-mint-700 dark:bg-mint-500/10 dark:text-mint-400">
        <Compass size={34} />
      </div>
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        The page you are looking for may have moved, or the link might be out of date.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <ArrowLeft size={16} />
        Back to overview
      </Link>
    </div>
  );
}
