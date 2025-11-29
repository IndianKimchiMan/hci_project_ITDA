import React, { useState, useRef } from 'react';
import { RelationshipMode } from '../types';
import { AnalyzeIcon, UploadIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatInputFormProps {
  onAnalyze: (chatText: string, mode: RelationshipMode, speaker1Name: string, speaker2Name: string) => void;
  isLoading: boolean;
  isExtracting: boolean;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, onTextExtracted: (text: string) => void) => void;
  prefilledData: { name: string; mode: RelationshipMode } | null;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
  onAnalyze,
  isLoading,
  isExtracting,
  handleImageUpload,
  prefilledData,
}) => {
  const { t } = useLanguage();
  const [chatText, setChatText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeClick = () => {
    if (prefilledData) {
      onAnalyze(chatText, prefilledData.mode, t('me'), prefilledData.name);
    }
  };
  
  const onTextExtracted = (text: string) => {
      setChatText(prev => prev + (prev ? '\n' : '') + text);
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-xl border border-gray-100 fade-in space-y-6">
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('chatContentLabel')}</label>
            <textarea
                rows={15}
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder={t('chatContentPlaceholder')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 smooth-transition text-sm"
            />
        </div>
      
        <div className="flex flex-col sm:flex-row gap-4">
            <button
                onClick={handleAnalyzeClick}
                disabled={isLoading || isExtracting || !chatText.trim() || !prefilledData}
                className="w-full flex items-center justify-center py-3 px-4 font-bold text-white rounded-lg smooth-transition bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('analyzingButton')}
                    </>
                ) : (
                    <>
                        <AnalyzeIcon className="w-5 h-5 mr-2" />
                        {t('analyzeButton')}
                    </>
                )}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e, onTextExtracted)}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                disabled={isExtracting}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="w-full sm:w-auto flex items-center justify-center py-3 px-4 font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 smooth-transition"
            >
                {isExtracting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {t('extractingTextButton')}
                    </>
                ) : (
                    <>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        {t('uploadImageButton')}
                    </>
                )}
            </button>
        </div>
    </div>
  );
};

export default ChatInputForm;