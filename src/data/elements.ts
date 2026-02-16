import type { ElementMeta } from '../types/card';

export const elements: Record<string, ElementMeta> = {
  earth: {
    id: 'earth',
    name: 'Earth',
    colorHex: '#1a407d',
    bgColorHex: '#ecd6de',
    description: 'Grounding, stability, and connection to the physical world',
  },
  fire: {
    id: 'fire',
    name: 'Fire',
    colorHex: '#ec1f51',
    bgColorHex: '#f8f1f9',
    description: 'Passion, transformation, and creative energy',
  },
  water: {
    id: 'water',
    name: 'Water',
    colorHex: '#1a407d',
    bgColorHex: '#cce4eb',
    description: 'Emotion, intuition, and flowing adaptability',
  },
  air: {
    id: 'air',
    name: 'Air',
    colorHex: '#1a407d',
    bgColorHex: '#f0faf4',
    description: 'Thought, communication, and intellectual clarity',
  },
};

export const elementOrder: Array<ElementMeta['id']> = ['earth', 'fire', 'water', 'air'];
