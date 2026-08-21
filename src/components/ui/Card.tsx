import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  glass = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        glass ? 'glass-panel border-white/40' : 'bg-white border-slate-100 shadow-sm'
      } ${
        hoverable ? 'hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
