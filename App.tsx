import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResult, RelationshipMode, StoredAnalysis } from './types';
import { RELATIONSHIP_THEMES } from './constants';
import { analyzeChat, extractTextFromImage } from './services/geminiService';
import { getAllAnalyses, saveAnalysis } from './services/storageService';
import AnalysisDashboard from './components/AnalysisDashboard';
import LandingPage from './components/LandingPage';
import RelationshipMap from './components/RelationshipMap';
import { SparklesIcon, ArrowLeftIcon, PlusIcon } from './components/icons';
import { useLanguage } from './contexts/LanguageContext';
import ChatInputForm from './components/ChatInputForm';

type View = 'landing' | 'map' | 'input' | 'dashboard';

const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const toggleLanguage = () => setLanguage(language === 'ko' ? 'en' : 'ko');
    return (
        <button
            onClick={toggleLanguage}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-600 shadow-md hover:bg-gray-100 smooth-transition z-20"
        >
            {language === 'ko' ? 'EN' : '한국어'}
        </button>
    );
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<StoredAnalysis | null>(null);
  const [prefilledData, setPrefilledData] = useState<{ name: string; mode: RelationshipMode } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { language, t } = useLanguage();

  useEffect(() => {
    // Load existing analyses from storage on initial load
    setAnalyses(getAllAnalyses());
  }, []);

  const handleNewAnalysis = async (chatText: string, mode: RelationshipMode, speaker1Name: string, speaker2Name: string) => {
    if (!chatText.trim()) {
      setError(t('errorInputRequired'));
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeChat(chatText, mode, language);
      const newAnalysis: StoredAnalysis = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        mode,
        speaker1Name,
        speaker2Name,
        result
      };
      saveAnalysis(newAnalysis);
      setAnalyses(getAllAnalyses()); // Re-fetch all analyses to update the map
      setView('map'); // Go back to map after successful analysis
      setPrefilledData(null); // Clear prefilled data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
       // Stay on the input page if there's an error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, onTextExtracted: (text: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setError(null);
    try {
        const part = await fileToGenerativePart(file);
        const extracted = await extractTextFromImage(part.inlineData.data, part.inlineData.mimeType);
        onTextExtracted(`--- ${t('imageChatExtraction')} ---\n` + extracted);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
    } finally {
        setIsExtracting(false);
        if(event.target) {
            event.target.value = "";
        }
    }
  };

  const handleSelectAnalysis = (analysis: StoredAnalysis) => {
    setCurrentAnalysis(analysis);
    setView('dashboard');
  };

  const handleStartAdd = (name: string, mode: RelationshipMode) => {
    setPrefilledData({ name, mode });
    setView('input');
  };

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onStart={() => setView('map')} />;
      case 'map':
        return <RelationshipMap analyses={analyses} onAdd={handleStartAdd} onSelect={handleSelectAnalysis} onBack={() => setView('landing')} />;
      case 'input':
        const title = prefilledData
          ? t('chatInputTitleFor', { name: prefilledData.name })
          : t('chatInputTitle');
        return (
            <div className={`min-h-screen w-full smooth-transition bg-gradient-to-br from-purple-50 via-pink-50 to-white relative`}>
                <button
                    onClick={() => { setView('map'); setPrefilledData(null); }}
                    className="absolute top-6 left-6 flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-full shadow-md hover:bg-gray-100 smooth-transition z-10"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    {t('backToMap')}
                </button>
                <div className="container mx-auto px-4 py-16 md:py-20 flex flex-col items-center">
                    <div className="text-center w-full">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{title}</h1>
                        <p className="text-gray-600 mb-8">{t('chatInputSubtitle')}</p>
                    </div>
                    <ChatInputForm
                        onAnalyze={handleNewAnalysis}
                        isLoading={isLoading}
                        isExtracting={isExtracting}
                        handleImageUpload={handleImageUpload}
                        prefilledData={prefilledData}
                    />
                    <p className="text-center text-sm text-gray-500 mt-6">{t('tip')}</p>
                    {error && <div className="max-w-3xl w-full mx-auto mt-4 p-4 text-center text-red-700 bg-red-100 border border-red-400 rounded-lg fade-in">{error}</div>}
                    {isLoading && (
                        <div className="text-center p-10 fade-in">
                            <SparklesIcon className={`w-12 h-12 text-purple-500 mx-auto animate-pulse`} />
                            <p className="mt-4 text-lg font-semibold text-gray-700 whitespace-pre-line">{t('loadingMessage')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
      case 'dashboard':
        if (!currentAnalysis) {
            setView('map'); // Should not happen, but as a fallback
            return null;
        }
        const theme = RELATIONSHIP_THEMES[currentAnalysis.mode];
        return (
            <div className={`min-h-screen w-full smooth-transition ${theme.light} relative`}>
                <div className="container mx-auto px-4 py-8 pb-28">
                    <AnalysisDashboard
                        result={currentAnalysis.result}
                        mode={currentAnalysis.mode}
                    />
                    <div className="text-center mt-8">
                        <button
                            onClick={() => setView('map')}
                            className="px-6 py-2 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 smooth-transition"
                        >
                            {t('backToMap')}
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => handleStartAdd(currentAnalysis.speaker2Name, currentAnalysis.mode)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center smooth-transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 z-10"
                    aria-label={t('addMoreConversation')}
                >
                    <PlusIcon className="w-8 h-8" />
                </button>
            </div>
        )
      default:
        return <LandingPage onStart={() => setView('map')} />;
    }
  };

  return (
    <>
      <LanguageToggle />
      {renderContent()}
    </>
  );
};

export default App;