import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`glass-card rounded-2xl p-8 ${className}`}>
      {children}
    </div>
  );
}
