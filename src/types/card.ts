export type Element = 'earth' | 'fire' | 'water' | 'air';

export interface OracleCard {
  id: string;
  word: string;
  quote: string;
  element: Element;
  svgPath: string;
  order: number;
}

export interface ElementMeta {
  id: Element;
  name: string;
  colorHex: string;
  bgColorHex: string;
  pageColorHex: string;
  description: string;
}

export type ElementFilter = Element | 'all';

export type DrawMode = 'single' | 'triple';
