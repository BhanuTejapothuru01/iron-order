import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'amber' | 'slate' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  icon,
}) => {
  const variants = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    red: 'bg-rose-50 text-rose-700 border-rose-200/60',
    blue: 'bg-sky-50 text-sky-700 border-sky-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
};
