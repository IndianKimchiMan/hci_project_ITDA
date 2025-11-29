import React, { useEffect, useState } from 'react';
import { RELATIONSHIP_THEMES } from '../constants';
import { RelationshipMode } from '../types';
import { HeartIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface RelationshipGaugeProps {
  score: number;
  mode: RelationshipMode;
}

const RelationshipGauge: React.FC<RelationshipGaugeProps> = ({ score, mode }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const { t } = useLanguage();
  const theme = RELATIONSHIP_THEMES[mode];

  useEffect(() => {
    // Smoothly animate score changes
    const timeoutId = setTimeout(() => setDisplayScore(score), 100);
    return () => clearTimeout(timeoutId);
  }, [score]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className={`relative w-64 h-64 rounded-full flex items-center justify-center p-4 shadow-lg ${theme.light} smooth-transition`}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className={`${theme.text}`}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-sm font-semibold ${theme.text}`}>{t('relationshipGauge')}</span>
        <span className={`text-5xl font-bold ${theme.text}`}>{Math.round(displayScore)}</span>
        <HeartIcon className={`w-8 h-8 mt-2 ${theme.text}`} />
      </div>
    </div>
  );
};

export default RelationshipGauge;