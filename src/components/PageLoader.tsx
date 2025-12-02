import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

const PageLoader = ({ message = 'Memuat...' }: PageLoaderProps) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
        <Loader2 className="h-12 w-12 animate-spin text-primary absolute top-0 left-0" />
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
    </div>
  );
};

export default PageLoader;
