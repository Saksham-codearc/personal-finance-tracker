import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react';
import Logo from '../components/ui/Logo';

export default function AuthLayout({ children, footer }) {
  return (
    <div className="min-h-screen bg-[#f4f7f3] dark:bg-coal-950 lg:grid lg:grid-cols-[1.08fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#07120e] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -left-28 -top-32 h-96 w-96 rounded-full bg-mint-500/20 blur-[100px]" />
        <div className="absolute -bottom-52 right-[-100px] h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-[110px]" />

        <div className="relative z-10 flex items-center justify-between">
          <Logo light />
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/60 backdrop-blur">
            <ShieldCheck size={13} className="text-mint-400" />
            Private by design
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-[530px] py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint-400/20 bg-mint-400/10 px-3 py-1.5 text-xs font-semibold text-mint-300">
            <Sparkles size={13} />
            Your money, finally making sense
          </div>
          <h1 className="font-display text-[46px] font-extrabold leading-[1.04] tracking-[-0.045em] text-balance xl:text-[56px]">
            Money clarity,
            <br />
            without the
            <br />
            <span className="bg-gradient-to-r from-mint-300 via-mint-400 to-emerald-200 bg-clip-text text-transparent">
              spreadsheet.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-white/55">
            Track every rupee, understand your spending patterns, and build a budget that actually
            fits your life.
          </p>

          <div className="relative mt-10 max-w-[470px]">
            <div className="absolute -inset-4 rounded-[30px] border border-white/[0.05] bg-white/[0.02]" />
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    Available balance
                  </p>
                  <p className="mt-1.5 font-display text-3xl font-bold tracking-[-0.03em]">
                    ₹1,24,580
                  </p>
                </div>
                <span className="badge bg-mint-400/10 text-mint-300">
                  <TrendingDown size={12} />
                  12.4% less spend
                </span>
              </div>

              <div className="mt-6 flex h-24 items-end gap-2.5">
                {[44, 68, 52, 82, 62, 94, 74, 88, 58, 76, 48, 66].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col gap-1">
                    <div
                      className={`w-full rounded-t-md ${
                        index === 5
                          ? 'bg-gradient-to-t from-mint-500 to-mint-300'
                          : 'bg-white/10'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-medium text-white/30">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Nov</span>
              </div>
            </div>

            <div className="absolute -right-7 -top-8 hidden animate-float rounded-2xl border border-white/10 bg-[#10231b]/90 p-3.5 shadow-xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint-400/15 text-mint-300">
                  <ArrowUpRight size={15} />
                </span>
                <div>
                  <p className="text-[10px] text-white/40">Savings rate</p>
                  <p className="text-sm font-bold">32.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 border-t border-white/[0.07] pt-7">
          {[
            ['6 months', 'Spending history'],
            ['12+', 'Smart categories'],
            ['100%', 'Yours to control'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-display text-lg font-bold text-white">{value}</p>
              <p className="mt-0.5 text-[11px] text-white/35">{label}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0 lg:py-14">
        <div className="absolute left-5 top-6 lg:hidden">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="w-full max-w-[420px] pt-14 lg:pt-0">
          {children}
          {footer}
        </div>
      </main>
    </div>
  );
}
