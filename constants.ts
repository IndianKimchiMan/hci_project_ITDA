import { RelationshipMode } from './types';

export const RELATIONSHIP_THEMES: { [key in RelationshipMode]: { light: string, medium: string, dark: string, text: string, mediumText: string } } = {
  [RelationshipMode.WORK]: {
    light: 'bg-blue-100',
    medium: 'bg-blue-500',
    dark: 'bg-blue-700',
    text: 'text-blue-600',
    mediumText: 'text-white',
  },
  [RelationshipMode.ROMANCE]: {
    light: 'bg-pink-100',
    medium: 'bg-pink-500',
    dark: 'bg-pink-700',
    text: 'text-pink-600',
    mediumText: 'text-white',
  },
  [RelationshipMode.FRIEND]: {
    light: 'bg-teal-100',
    medium: 'bg-teal-500',
    dark: 'bg-teal-700',
    text: 'text-teal-600',
    mediumText: 'text-white',
  },
  [RelationshipMode.OTHER]: {
    light: 'bg-gray-100',
    medium: 'bg-gray-500',
    dark: 'bg-gray-700',
    text: 'text-gray-600',
    mediumText: 'text-white',
  },
};