export type Language = 'en' | 'zh';

export interface Country {
  code: string;
  name: string;
  nameZh: string;
  emoji: string;
  funFacts: string[];
  funFactsZh: string[];
}

export enum GameMode {
  FLAG_TO_COUNTRY = 'FLAG_TO_COUNTRY',
  COUNTRY_TO_FLAG = 'COUNTRY_TO_FLAG',
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
}

export interface Question {
  target: Country;
  options: Country[];
}