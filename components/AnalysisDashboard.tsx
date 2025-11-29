import React from 'react';
import { AnalysisResult, RelationshipMode } from '../types';
import RelationshipGauge from './RelationshipGauge';
import { ChatBubblePlusIcon, TagIcon } from './icons';
import { RELATIONSHIP_THEMES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import SentimentChart from './SentimentChart';
import RadarChart from './RadarChart';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  mode: RelationshipMode;
}

const ThermometerGauge: React.FC<{ label: string; value: number; themeColor: string; }> = ({ label, value, themeColor }) => {
  const height = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg border border-gray-100 h-full">
      <span className="text-xl font-bold text-gray-800">{Math.round(value)}</span>
      <div className="w-6 h-32 bg-gray-200 rounded-full my-2 flex flex-col-reverse overflow-hidden">
        <div className={`${themeColor} smooth-transition`} style={{ height: `${height}%`, transition: 'height 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
      </div>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
    </div>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, mode }) => {
  const { t } = useLanguage();
  const theme = RELATIONSHIP_THEMES[mode];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-8 fade-in">
      {/* Top Section: Gauge and Summary */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <RelationshipGauge score={result.intimacyScore} mode={mode} />
        <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800">{t('analysisResults')}</h2>
            <p className={`mt-2 text-lg font-medium ${theme.text}`}>{result.summary}</p>
             <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
                <p className="font-bold">{t('recommendationTitle')}</p>
                <p>{result.recommendation}</p>
            </div>
        </div>
      </div>

      {/* Core Metrics Thermometers */}
      <div className="grid grid-cols-3 gap-4 md:gap-8">
        <ThermometerGauge label={t('participation')} value={result.balanceRatio.speaker1.percentage} themeColor={theme.medium} />
        <ThermometerGauge label={t('positivity')} value={result.sentiment.positive} themeColor={theme.medium} />
        <ThermometerGauge label={t('intimacy')} value={result.intimacyScore} themeColor={theme.medium} />
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <SentimentChart data={result.sentimentFlow} mode={mode} />
          <RadarChart result={result} mode={mode} />
      </div>

       {/* Next Step Suggestions Section */}
       <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
         <h3 className="text-xl font-bold text-gray-800 mb-4">{t('nextStepTitle')}</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <div className="flex items-center text-gray-700 mb-3">
                <ChatBubblePlusIcon className="w-6 h-6 mr-2 text-purple-500" />
                <h4 className="font-bold">{t('suggestedRepliesTitle')}</h4>
              </div>
              <div className="space-y-2">
                {result.suggestedReplies.map((reply, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg text-sm text-purple-800">{reply}</div>
                ))}
              </div>
           </div>
           <div>
              <div className="flex items-center text-gray-700 mb-3">
                <TagIcon className="w-6 h-6 mr-2 text-indigo-500" />
                <h4 className="font-bold">{t('suggestedTopicsTitle')}</h4>
              </div>
              <div className="space-y-2">
                {result.suggestedTopics.map((topic, index) => (
                    <div key={index} className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800">{topic}</div>
                ))}
              </div>
           </div>
         </div>
       </div>
    </div>
  );
};

export default AnalysisDashboard;