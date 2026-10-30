import React from 'react';

interface RiskBadgeProps {
  category: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  score?: number;
  className?: string;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  category, 
  score, 
  className = '', 
  showScore = true 
}) => {
  let bg = 'bg-[#438A69]/15 text-[#438A69] border-[#438A69]/30';
  let dot = 'bg-[#438A69]';

  if (category === 'Critical') {
    bg = 'bg-[#B94B48]/15 text-[#B94B48] border-[#B94B48]/30 font-semibold';
    dot = 'bg-[#B94B48] animate-pulse';
  } else if (category === 'High') {
    bg = 'bg-[#D18A35]/15 text-[#D18A35] border-[#D18A35]/30 font-semibold';
    dot = 'bg-[#D18A35]';
  } else if (category === 'Medium') {
    bg = 'bg-[#D2B64B]/15 text-[#8F781A] border-[#D2B64B]/35';
    dot = 'bg-[#D2B64B]';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${bg} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      <span>{category}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-[11px] opacity-90">({score})</span>
      )}
    </span>
  );
};

