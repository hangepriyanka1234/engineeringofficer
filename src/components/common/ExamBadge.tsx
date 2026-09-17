import React from 'react';
import { ExamTargetId } from '../../types';
import { EXAM_CATALOGUE } from '../../data/mockData';

interface ExamBadgeProps {
  examId: ExamTargetId | string;
  size?: 'sm' | 'md' | 'lg';
}

export const ExamBadge: React.FC<ExamBadgeProps> = ({ examId, size = 'sm' }) => {
  const exam = EXAM_CATALOGUE.find((e) => e.id === examId);
  const shortName = exam ? exam.shortName : examId.toUpperCase();
  const level = exam ? exam.level : 'State';

  const levelStyles: Record<string, string> = {
    Central: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    State: 'bg-sky-50 text-sky-800 border-sky-200',
    'Local Body': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    PSU: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const badgeStyle = levelStyles[level] || 'bg-slate-100 text-slate-700 border-slate-200';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold border ${badgeStyle} ${sizeStyles[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
      {shortName}
    </span>
  );
};
