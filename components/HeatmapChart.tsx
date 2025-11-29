import React from 'react';
import { RelationshipMode } from '../types';
import { RELATIONSHIP_THEMES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface HeatmapChartProps {
  data: number[]; // Array of 24 numbers for each hour
  mode: RelationshipMode;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, mode }) => {
    const { t } = useLanguage();
    const theme = RELATIONSHIP_THEMES[mode];

    const maxValue = Math.max(...data, 1); // Avoid division by zero

    const getColor = (value: number) => {
        const intensity = Math.min(value / maxValue, 1);
        if (intensity < 0.01) return 'bg-gray-100';
        if (intensity < 0.25) return `${theme.light} opacity-40`;
        if (intensity < 0.5) return `${theme.light} opacity-60`;
        if (intensity < 0.75) return `${theme.light} opacity-80`;
        return theme.medium;
    };
    
    // Split hours into two rows for better mobile view
    const hours_row1 = Array.from({ length: 12 }, (_, i) => i);
    const hours_row2 = Array.from({ length: 12 }, (_, i) => i + 12);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full">
            <h3 className="text-xl font-bold text-gray-800">{t('responseHeatmap')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('responseHeatmapDesc')}</p>
            <div className="flex flex-col gap-1">
                <div className="grid grid-cols-12 gap-1">
                    {hours_row1.map(hour => (
                        <div key={hour} className="relative group">
                            <div className={`w-full aspect-square rounded ${getColor(data[hour])} smooth-transition`}></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 smooth-transition">
                                {data[hour]}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-12 gap-1">
                    {hours_row2.map(hour => (
                        <div key={hour} className="relative group">
                            <div className={`w-full aspect-square rounded ${getColor(data[hour])} smooth-transition`}></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 smooth-transition">
                                {data[hour]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                <span>00:00</span>
                <span>12:00</span>
                <span>23:00</span>
            </div>
        </div>
    );
};

export default HeatmapChart;
