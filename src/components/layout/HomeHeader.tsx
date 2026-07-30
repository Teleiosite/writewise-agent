import { ShieldCheck } from "lucide-react";

interface HomeHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export function HomeHeader({ title, description, badge }: HomeHeaderProps) {
  return (
    <div className="mb-8 font-sans">
      {badge && (
        <div className="mono-badge mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>
      )}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black dark:text-white mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
