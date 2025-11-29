import React, { useState } from 'react';
import { StoredAnalysis, RelationshipMode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusIcon, ArrowLeftIcon } from './icons';
import { RELATIONSHIP_THEMES } from '../constants';

interface RelationshipMapProps {
  analyses: StoredAnalysis[];
  onAdd: (name: string, mode: RelationshipMode) => void;
  onSelect: (analysis: StoredAnalysis) => void;
  onBack: () => void;
}

const AddPersonModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, mode: RelationshipMode) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [mode, setMode] = useState<RelationshipMode>(RelationshipMode.FRIEND);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (name.trim()) {
            onAdd(name, mode);
            setName('');
            setMode(RelationshipMode.FRIEND);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{t('addPersonModalTitle')}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="person-name" className="block text-sm font-bold text-gray-700 mb-1">{t('nameLabel')}</label>
                        <input
                            id="person-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            // FIX: Replaced invalid translation key 'speaker2Name' with 'namePlaceholder'.
                            placeholder={t('namePlaceholder')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 smooth-transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="relationship-type" className="block text-sm font-bold text-gray-700 mb-1">{t('relationshipTypeLabel')}</label>
                        <select
                            id="relationship-type"
                            value={mode}
                            onChange={(e) => setMode(e.target.value as RelationshipMode)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 smooth-transition"
                        >
                            {Object.values(RelationshipMode).map((m) => (
                                <option key={m} value={m}>{t(m as any)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 smooth-transition">{t('cancelButton')}</button>
                    <button onClick={handleSubmit} disabled={!name.trim()} className="px-6 py-2 text-white font-bold rounded-lg bg-purple-500 hover:bg-purple-600 smooth-transition disabled:bg-gray-300">{t('addButton')}</button>
                </div>
            </div>
        </div>
    );
};

const RelationshipMap: React.FC<RelationshipMapProps> = ({ analyses, onAdd, onSelect, onBack }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const width = 1600;
  const height = 1600;
  const center = { x: width / 2, y: height / 2 };
  const mainRadius = Math.min(width, height) / 3;
  const clusterRadius = 220;
  const meNodeRadius = 90;
  const relationshipNodeRadius = 80;
  const categoryNodeRadius = 75;


  const themeColors = Object.entries(RELATIONSHIP_THEMES).reduce((acc, [key, value]) => {
    const colorMap: { [key: string]: string } = {
        'bg-blue-500': '#3b82f6',   // WORK
        'bg-pink-500': '#ec4899',    // ROMANCE
        'bg-teal-500': '#14b8a6',   // FRIEND
        'bg-gray-500': '#6b7280',   // OTHER
    };
    acc[key] = colorMap[value.medium] || '#9ca3af';
    return acc;
  }, {} as { [key: string]: string });
  
  const categories = [
    { mode: RelationshipMode.WORK, angle: -90, name: t('WORK' as any) },
    { mode: RelationshipMode.FRIEND, angle: 0, name: t('FRIEND' as any) },
    { mode: RelationshipMode.OTHER, angle: 90, name: t('OTHER' as any) },
    { mode: RelationshipMode.ROMANCE, angle: 180, name: t('ROMANCE' as any) },
  ];

  const categoryAnchors = categories.map(cat => ({
      ...cat,
      x: center.x + mainRadius * Math.cos(cat.angle * Math.PI / 180),
      y: center.y + mainRadius * Math.sin(cat.angle * Math.PI / 180),
  }));

  const analysesByMode = analyses.reduce((acc, analysis) => {
    if (Object.values(RelationshipMode).includes(analysis.mode)) {
        (acc[analysis.mode] = acc[analysis.mode] || []).push(analysis);
    }
    return acc;
  }, {} as { [key in RelationshipMode]?: StoredAnalysis[] });

  const handleAddPerson = (name: string, mode: RelationshipMode) => {
    onAdd(name, mode);
    setIsModalOpen(false);
  };


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4 fade-in overflow-hidden relative">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('relationshipMapTitle')}</h2>
        
        <div className="relative w-[90vw] h-[90vw] max-w-5xl max-h-5xl">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <defs>
                     <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Lines from Me to Categories */}
                {categoryAnchors.map(anchor => (
                    <line
                        key={`line-to-${anchor.mode}`}
                        x1={center.x}
                        y1={center.y}
                        x2={anchor.x}
                        y2={anchor.y}
                        stroke="#d1d5db"
                        strokeWidth={6}
                    />
                ))}

                {/* Lines from Categories to People */}
                {categoryAnchors.map(({ mode, x: anchorX, y: anchorY }) => {
                    const groupAnalyses = analysesByMode[mode] || [];
                    const numNodes = groupAnalyses.length;

                    return groupAnalyses.map((node, index) => {
                        let nodeX = anchorX;
                        let nodeY = anchorY;
                        if (numNodes > 0) {
                            const angle = (index / numNodes) * 2 * Math.PI + (mode === RelationshipMode.FRIEND ? Math.PI / 4 : 0); // Offset to avoid overlap
                            nodeX += clusterRadius * Math.cos(angle);
                            nodeY += clusterRadius * Math.sin(angle);
                        }
                        return (
                            <line
                                key={`line-from-${mode}-to-${node.id}`}
                                x1={anchorX}
                                y1={anchorY}
                                x2={nodeX}
                                y2={nodeY}
                                stroke="#d1d5db"
                                strokeWidth={4}
                            />
                        );
                    });
                })}

                {/* Center Node (Me) */}
                <g transform={`translate(${center.x}, ${center.y})`} className="cursor-default">
                    <circle r={meNodeRadius + 5} fill="white" filter="url(#glow)" />
                    <circle r={meNodeRadius} fill="white" stroke="#8b5cf6" strokeWidth="6" />
                    <text textAnchor="middle" dy=".3em" className="text-4xl font-bold fill-current text-gray-800">{t('me')}</text>
                </g>

                {/* Category and Relationship Nodes */}
                {categoryAnchors.map(({ mode, name, x: anchorX, y: anchorY }) => {
                    const groupAnalyses = analysesByMode[mode] || [];
                    const numNodes = groupAnalyses.length;

                    return (
                        <g key={mode}>
                            {/* Category Node */}
                            <g transform={`translate(${anchorX}, ${anchorY})`} className="cursor-default">
                                <circle
                                    r={categoryNodeRadius}
                                    fill="white"
                                    stroke={themeColors[mode]}
                                    strokeWidth="5"
                                />
                                <text
                                    textAnchor="middle"
                                    dy=".3em"
                                    className="text-2xl font-bold"
                                    style={{ fill: themeColors[mode] }}
                                >
                                    {name}
                                </text>
                            </g>

                            {/* Relationship Nodes */}
                            {groupAnalyses.map((node, index) => {
                                let nodeX = anchorX;
                                let nodeY = anchorY;
                                if (numNodes > 0) {
                                    const angle = (index / numNodes) * 2 * Math.PI + (mode === RelationshipMode.FRIEND ? Math.PI / 4 : 0); // Offset to avoid overlap
                                    nodeX += clusterRadius * Math.cos(angle);
                                    nodeY += clusterRadius * Math.sin(angle);
                                }
                                return (
                                    <g key={node.id} transform={`translate(${nodeX}, ${nodeY})`}
                                       onClick={() => onSelect(node)}
                                       className="cursor-pointer group">
                                        <circle
                                            r={relationshipNodeRadius + 5}
                                            fill="white"
                                            className="opacity-0 group-hover:opacity-100 smooth-transition"
                                            style={{ filter: 'url(#glow)' }}
                                        />
                                        <circle
                                            r={relationshipNodeRadius}
                                            fill="white"
                                            stroke={themeColors[node.mode]}
                                            strokeWidth="6"
                                            className="smooth-transition group-hover:scale-110"
                                        />
                                        <text textAnchor="middle" dy={-12} className="text-2xl font-bold fill-current text-gray-700">
                                            {node.speaker2Name}
                                        </text>
                                         <text textAnchor="middle" dy={20} className="text-xl fill-current text-gray-500 font-semibold">
                                            {node.result.intimacyScore}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}
            </svg>
        </div>
        
        <button
            onClick={onBack}
            className="absolute top-6 left-6 flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-full shadow-md hover:bg-gray-100 smooth-transition"
        >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            {t('backToHome')}
        </button>

        <button
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center smooth-transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
            aria-label={t('addPerson')}
        >
            <PlusIcon className="w-8 h-8" />
        </button>

        <AddPersonModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddPerson}
        />
    </div>
  );
};

export default RelationshipMap;