import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: number;
  variant?: 'default' | 'primary' | 'success' | 'accent';
}

export function StatCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'gradient-primary text-primary-foreground',
    success: 'gradient-success text-success-foreground',
    accent: 'gradient-accent text-accent-foreground',
  };

  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        variantStyles[variant]
      )}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full rounded-full bg-current transform translate-x-8 -translate-y-8" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn(
              "text-sm font-medium mb-1",
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            )}>
              {title}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{value}</h3>
            {subtitle && (
              <p className={cn(
                "text-sm mt-1",
                variant === 'default' ? 'text-muted-foreground' : 'opacity-70'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            variant === 'default' ? 'bg-muted' : 'bg-white/20'
          )}>
            {icon}
          </div>
        </div>

        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1.5 mt-4 text-sm font-medium",
            variant === 'default' 
              ? (isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground')
              : 'opacity-90'
          )}>
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? '+' : ''}{trend.toFixed(1)}% so với kỳ trước</span>
          </div>
        )}
      </div>
    </div>
  );
}
