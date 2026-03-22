import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/80',
    success: 'bg-green-100 text-green-800 hover:bg-green-100/80',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80',
    destructive: 'bg-red-100 text-red-800 hover:bg-red-100/80',
    outline: 'text-slate-950 border border-slate-200 hover:bg-slate-100',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
