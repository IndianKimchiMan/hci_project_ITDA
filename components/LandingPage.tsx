import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChartIcon, ChatBubbleIcon, SparklesIcon, TrendingUpIcon, MapIcon } from './icons';

interface LandingPageProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 text-center flex flex-col items-center smooth-transition hover:-translate-y-2 hover:shadow-xl">
        <div className="mb-4 text-purple-500">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

const ProblemCard: React.FC<{ title: string; description: string; color: string; }> = ({ title, description, color }) => (
    <div className="text-center">
        <h4 className={`text-lg font-bold ${color}`}>{title}</h4>
        <p className="text-gray-600 mt-2 max-w-xs mx-auto">{description}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-white">
            <div className="container mx-auto px-4 py-12 md:py-20 text-center fade-in">
                <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 pb-2">It-Da</h1>
                <p className="text-xl md:text-2xl font-light text-gray-600 mt-2">From Interaction to Data</p>
                <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">{t('landingTitle')}</p>
                <button
                    onClick={onStart}
                    className="mt-10 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg text-lg smooth-transition hover:scale-105 hover:shadow-xl"
                >
                    <SparklesIcon className="w-6 h-6 inline-block mr-2" />
                    {t('landingCTA')}
                </button>

                <div className="mt-20 md:mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard icon={<ChatBubbleIcon className="w-10 h-10"/>} title={t('feature1Title')} description={t('feature1Desc')} />
                    <FeatureCard icon={<BarChartIcon className="w-10 h-10"/>} title={t('feature2Title')} description={t('feature2Desc')} />
                    <FeatureCard icon={<TrendingUpIcon className="w-10 h-10"/>} title={t('feature3Title')} description={t('feature3Desc')} />
                    <FeatureCard icon={<MapIcon className="w-10 h-10"/>} title={t('feature4Title')} description={t('feature4Desc')} />
                </div>
                
                <div className="mt-20 md:mt-28 p-8 bg-white/50 rounded-3xl shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-800">{t('whyTitle')}</h2>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
                        <ProblemCard title={t('problem1Title')} description={t('problem1Desc')} color="text-pink-500" />
                        <ProblemCard title={t('problem2Title')} description={t('problem2Desc')} color="text-orange-500" />
                        <ProblemCard title={t('problem3Title')} description={t('problem3Desc')} color="text-blue-500" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
