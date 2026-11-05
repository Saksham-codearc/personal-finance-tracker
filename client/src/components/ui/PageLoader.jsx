import { LoaderCircle } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <LoaderCircle size={26} className="animate-spin text-mint-600 dark:text-mint-400" />
    </div>
  );
}
