import React from 'react';
import { RelationshipMode } from '../types';
import { RELATIONSHIP_THEMES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface SentimentChartProps {
  data: { time_percentage: number; sentiment_score: number }[];
  mode: RelationshipMode;
}

const SentimentChart: React.FC<SentimentChartProps> = ({ data, mode }) => {
    const { t } = useLanguage();
    const theme = RELATIONSHIP_THEMES[mode];

    const width = 500;
    const height = 250;
    const padding = 40;

    const points = data
        .map(p => {
            const x = (p.time_percentage / 100) * (width - padding * 2) + padding;
            // sentiment_score is from -1 to 1. Map it to 0 (bottom) to 1 (top)
            const y = (1 - (p.sentiment_score + 1) / 2) * (height - padding * 2) + padding;
            return `${x},${y}`;
        })
        .join(' ');

    const positiveColor = 'text-green-500';
    const negativeColor = 'text-red-500';
    const neutralColor = 'text-gray-400';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full">
            <h3 className="text-xl font-bold text-gray-800">{t('sentimentFlow')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('sentimentFlowDesc')}</p>
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    {/* Y-axis labels */}
                    <text x={padding - 10} y={padding} dy="0.32em" textAnchor="end" className={`text-xs font-semibold ${positiveColor} fill-current`}>{t('positive')}</text>
                    <text x={padding - 10} y={height / 2} dy="0.32em" textAnchor="end" className={`text-xs font-semibold ${neutralColor} fill-current`}>{t('neutral')}</text>
                    <text x={padding - 10} y={height - padding} dy="0.32em" textAnchor="end" className={`text-xs font-semibold ${negativeColor} fill-current`}>{t('negative')}</text>

                    {/* Guideline for neutral */}
                    <line
                        x1={padding}
                        y1={height / 2}
                        x2={width - padding}
                        y2={height / 2}
                        className="stroke-current text-gray-200"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                    />

                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="sentimentGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="50%" stopColor="#a8a29e" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                    </defs>

                    {/* Line path */}
                    <polyline
                        fill="none"
                        stroke="url(#sentimentGradient)"
                        strokeWidth="3"
                        points={points}
                        className="smooth-transition"
                        style={{
                            strokeDasharray: 1000,
                            strokeDashoffset: 1000,
                            animation: 'dash 2s ease-out forwards',
                        }}
                    />
                    
                     {/* Keyframes for animation */}
                    <style>{`
                        @keyframes dash {
                            to {
                                stroke-dashoffset: 0;
                            }
                        }
                    `}</style>
                </svg>
            </div>
        </div>
    );
};

export default SentimentChart;
