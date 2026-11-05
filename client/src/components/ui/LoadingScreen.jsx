import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#f4f7f3] dark:bg-coal-950">
      <Logo />
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-mint-500" />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
