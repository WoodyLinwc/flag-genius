import React, { useState } from 'react';
import { GameMode, GameState, Language } from './types';
import { Translations } from './translations';
import GameScreen from './components/GameScreen';
import { Globe, MapPin, Flag, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.FLAG_TO_COUNTRY);
  const [language, setLanguage] = useState<Language>('en');

  const t = Translations[language];

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameState(GameState.PLAYING);
  };

  const goBack = () => {
    setGameState(GameState.MENU);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen w-full bg-[#2a233e] flex flex-col font-sans relative">
      {/* Pixel Art Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `radial-gradient(#ffffff 2px, transparent 2px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <header className="relative z-10 w-full p-4 md:p-6 flex justify-between items-center bg-[#3e2723] border-b-4 border-[#271c19] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-[#4a90e2] p-2 border-2 border-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
             <Globe className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#f5f5f5] font-pixel-title tracking-wide drop-shadow-md">
            {t.title} <span className="text-[#76c442]">{t.subtitle}</span>
          </h1>
        </div>
        
        <button 
          onClick={toggleLanguage}
          className="bg-[#d2b48c] border-2 border-[#8b4513] text-[#5c4033] px-3 py-1 font-['VT323'] text-xl hover:bg-[#e6ccb2] active:translate-y-1 shadow-[2px_2px_0_0_#8b4513]"
        >
          {language === 'en' ? '中文' : 'EN'}
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {gameState === GameState.MENU ? (
          <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center animate-fade-in-up">
            
            <div className="space-y-8 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4a2c2a] border-2 border-[#d2b48c] text-[#d2b48c] text-sm font-bold font-pixel-title shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] transform -rotate-2">
                    <MapPin className="w-4 h-4" />
                    {t.poweredBy}
                </div>
                <h2 className="text-4xl md:text-6xl font-pixel-title text-[#f5f5f5] leading-tight drop-shadow-[4px_4px_0_#271c19]">
                    {t.heroTitle} <br />
                    <span className="text-[#4a90e2]">{t.heroTitleHighlight}</span>
                </h2>
                <p className="text-2xl text-[#d2b48c] max-w-lg leading-relaxed font-['VT323']">
                    {t.heroDesc}
                </p>
            </div>

            <div className="grid gap-6 w-full max-w-md mx-auto">
                <div 
                  className="bg-[#d2b48c] border-4 border-[#8b4513] p-6 cursor-pointer shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(0,0,0,0.5)] transition-all group relative"
                  onClick={() => startGame(GameMode.FLAG_TO_COUNTRY)}
                >
                    <div className="absolute top-2 right-2">
                        <span className="bg-[#e25c5c] border border-[#7c1a1a] text-white text-xs font-pixel-title px-2 py-1 shadow-[2px_2px_0_0_#7c1a1a]">{t.popular}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-[#4a90e2] border-2 border-[#1a4b7c] flex items-center justify-center text-4xl shadow-inner">
                             <Flag className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-[#5c4033] font-pixel-title">{t.modeFlagToCountry}</h3>
                    </div>
                    <p className="text-[#3e2723] text-xl font-['VT323'] leading-tight">{t.modeFlagToCountryDesc}</p>
                </div>

                <div 
                  className="bg-[#a5d6a7] border-4 border-[#2e7d32] p-6 cursor-pointer shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(0,0,0,0.5)] transition-all group relative"
                  onClick={() => startGame(GameMode.COUNTRY_TO_FLAG)}
                >
                    <div className="absolute top-2 right-2">
                        <span className="bg-[#4a90e2] border border-[#1a4b7c] text-white text-xs font-pixel-title px-2 py-1 shadow-[2px_2px_0_0_#1a4b7c]">{t.classic}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-[#f5f5f5] border-2 border-[#9e9e9e] flex items-center justify-center shadow-inner">
                             <HelpCircle className="w-8 h-8 text-[#5c4033]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1b5e20] font-pixel-title">{t.modeCountryToFlag}</h3>
                    </div>
                    <p className="text-[#1b5e20] text-xl font-['VT323'] leading-tight">{t.modeCountryToFlagDesc}</p>
                </div>
            </div>

          </div>
        ) : (
          <GameScreen mode={gameMode} language={language} onBack={goBack} />
        )}
      </main>

      <footer className="relative z-10 p-6 text-center text-[#d2b48c] text-lg font-['VT323']">
        <p>&copy; {new Date().getFullYear()} FlagGenius. Built with React & Tailwind.</p>
      </footer>

      {/* Animation Global Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;