import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: 'High' | 'Medium' | 'Low' | string;
  explanation?: string;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ 
  level, 
  explanation, 
  className = '' 
}) => {
  let color = 'text-[#267C78] bg-[#267C78]/10 border-[#267C78]/25';
  let Icon = ShieldCheck;

  if (level === 'Medium') {
    color = 'text-[#D69A42] bg-[#D69A42]/10 border-[#D69A42]/25';
    Icon = Shield;
  } else if (level === 'Low') {
    color = 'text-[#C75C54] bg-[#C75C54]/10 border-[#C75C54]/25';
    Icon = ShieldAlert;
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border ${color} ${className}`}
      title={explanation || `Data Confidence: ${level}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="font-medium">{level} Confidence</span>
    </div>
  );
};

