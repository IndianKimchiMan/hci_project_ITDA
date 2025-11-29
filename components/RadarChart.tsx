import React from 'react';
import { AnalysisResult, RelationshipMode } from '../types';
import { RELATIONSHIP_THEMES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface RadarChartProps {
  result: AnalysisResult;
  mode: RelationshipMode;
}

const RadarChart: React.FC<RadarChartProps> = ({ result, mode }) => {
    const { t } = useLanguage();
    const theme = RELATIONSHIP_THEMES[mode];

    const themeColor = {
        'bg-pink-500': '#ec4899',
        'bg-orange-500': '#f97316',
        'bg-teal-500': '#14b8a6',
        'bg-blue-500': '#3b82f6',
    }[theme.medium] || '#9ca3af';

    // 1. Calculate the 5 metric scores (0-100)
    const intimacy = result.intimacyScore;
    const balance = 100 - Math.abs(result.balanceRatio.speaker1.percentage - result.balanceRatio.speaker2.percentage);
    const positivity = result.sentiment.positive;

    const sentimentScores = result.sentimentFlow.map(p => p.sentiment_score);
    const mean = sentimentScores.reduce((a, b) => a + b, 0) / (sentimentScores.length || 1);
    const variance = sentimentScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (sentimentScores.length || 1);
    const stdDev = Math.sqrt(variance);
    // Normalize stdDev (max is 1 for scores in [-1, 1]) to a 0-100 stability score
    const stability = Math.max(0, (1 - stdDev) * 100);

    const myResponseTime = result.avgResponseTime.speaker1.time; // Assuming speaker1 is the user
    // Normalize response time. 0 mins = 100 score, 120+ mins = 0 score.
    const responsiveness = myResponseTime === null ? 50 : Math.max(0, 100 - (myResponseTime / 120) * 100);

    const data = [
      { axis: t('radarIntimacy'), value: intimacy },
      { axis: t('radarBalance'), value: balance },
      { axis: t('radarPositivity'), value: positivity },
      { axis: t('radarStability'), value: stability },
      { axis: t('radarResponsiveness'), value: responsiveness },
    ];
    
    // 2. SVG and Chart constants
    const size = 300;
    const center = size / 2;
    const radius = size * 0.35;
    const numAxes = 5;
    const angleSlice = (Math.PI * 2) / numAxes;

    // 3. Functions to calculate point coordinates
    const getPoint = (angle: number, value: number) => {
      const r = radius * (value / 100);
      return {
        x: center + r * Math.cos(angle - Math.PI / 2),
        y: center + r * Math.sin(angle - Math.PI / 2),
      };
    };

    // 4. Generate points and paths
    const axisPoints = data.map((_, i) => getPoint(angleSlice * i, 100));
    const dataPoints = data.map((d, i) => getPoint(angleSlice * i, d.value));
    const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full">
            <h3 className="text-xl font-bold text-gray-800">{t('radarChartTitle')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('radarChartDesc')}</p>
            <div className="w-full h-auto flex justify-center items-center">
                <svg viewBox={`0 0 ${size} ${size}`}>
                    <g>
                        {/* Grid Lines */}
                        {[0.25, 0.5, 0.75, 1].map(level => (
                            <polygon
                                key={level}
                                points={axisPoints.map(p => `${center + (p.x - center) * level},${center + (p.y - center) * level}`).join(' ')}
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="1"
                            />
                        ))}
                        
                        {/* Axes Lines */}
                        {axisPoints.map((p, i) => (
                            <line
                                key={i}
                                x1={center}
                                y1={center}
                                x2={p.x}
                                y2={p.y}
                                stroke="#d1d5db"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Data Polygon */}
                        <polygon
                            points={dataPath}
                            fill={themeColor}
                            fillOpacity="0.4"
                            stroke={themeColor}
                            strokeWidth="2"
                            className="smooth-transition"
                            style={{
                                transformOrigin: 'center center',
                                animation: 'scaleIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                            }}
                        />

                        {/* Data Points */}
                        {dataPoints.map((p, i) => (
                           <circle key={i} cx={p.x} cy={p.y} r="4" fill={themeColor} />
                        ))}

                        {/* Labels */}
                        {axisPoints.map((p, i) => {
                             const labelOffset = 1.15;
                             const labelX = center + (p.x - center) * labelOffset;
                             const labelY = center + (p.y - center) * labelOffset;
                             return (
                                 <text
                                     key={i}
                                     x={labelX}
                                     y={labelY}
                                     textAnchor="middle"
                                     dy="0.3em"
                                     className="text-[10px] font-bold fill-current text-gray-600"
                                 >
                                     {data[i].axis}
                                 </text>
                             );
                        })}
                    </g>
                     {/* Keyframes for animation */}
                    <style>{`
                        @keyframes scaleIn {
                            from {
                                transform: scale(0);
                            }
                            to {
                                transform: scale(1);
                            }
                        }
                    `}</style>
                </svg>
            </div>
        </div>
    );
};

export default RadarChart;
