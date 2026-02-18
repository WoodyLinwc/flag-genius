import React, { useState } from "react";
import { GameMode, GameState, StudyType, Language } from "./types";
import { Translations } from "./translations";
import {
  getWrongCount,
  getRightCount,
  clearWrongCodes,
  clearRightCodes,
} from "./storage";
import GameScreen from "./components/GameScreen";
import StudyScreen from "./components/StudyScreen";
import {
  Globe,
  MapPin,
  Flag,
  HelpCircle,
  BookOpen,
  XCircle,
  CheckCircle,
  ChevronLeft,
  Trash2,
} from "lucide-react";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.FLAG_TO_COUNTRY);
  const [studyType, setStudyType] = useState<StudyType>(StudyType.WRONG);
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return (localStorage.getItem("flaggenius_lang") as Language) || "en";
    } catch {
      return "en";
    }
  });
  const [confirmClear, setConfirmClear] = useState<StudyType | null>(null);
  const [counts, setCounts] = useState({
    wrong: getWrongCount(),
    right: getRightCount(),
  });

  const t = Translations[language];

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameState(GameState.PLAYING);
  };

  const startStudy = (type: StudyType) => {
    setStudyType(type);
    setGameState(GameState.STUDYING);
  };

  const goBack = () => setGameState(GameState.MENU);
  const goToStudySelect = () => {
    refreshCounts();
    setGameState(GameState.STUDY_SELECT);
  };
  const goBackToStudySelect = () => {
    refreshCounts();
    setGameState(GameState.STUDY_SELECT);
  };

  const handleClear = (type: StudyType) => {
    if (type === StudyType.WRONG) clearWrongCodes();
    else clearRightCodes();
    setCounts({ wrong: getWrongCount(), right: getRightCount() });
    setConfirmClear(null);
  };

  const refreshCounts = () =>
    setCounts({ wrong: getWrongCount(), right: getRightCount() });

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === "en" ? "zh" : "en";
      try {
        localStorage.setItem("flaggenius_lang", next);
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#2a233e] flex flex-col font-sans relative">
      {/* Pixel Art Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `radial-gradient(#ffffff 2px, transparent 2px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <header className="relative z-10 w-full p-4 md:p-6 flex justify-between items-center bg-[#3e2723] border-b-4 border-[#271c19] shadow-lg">
        <button
          onClick={goBack}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity active:translate-y-0.5"
        >
          <div className="bg-[#4a90e2] p-2 border-2 border-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#f5f5f5] font-pixel-title tracking-wide drop-shadow-md">
            {t.title} <span className="text-[#76c442]">{t.subtitle}</span>
          </h1>
        </button>

        <button
          onClick={toggleLanguage}
          className="bg-[#d2b48c] border-2 border-[#8b4513] text-[#5c4033] px-3 py-1 font-['VT323'] text-xl hover:bg-[#e6ccb2] active:translate-y-1 shadow-[2px_2px_0_0_#8b4513] whitespace-nowrap"
        >
          {language === "en" ? "中文" : "EN"}
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* ── MAIN MENU ── */}
        {gameState === GameState.MENU && (
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
              {/* Flag → Country */}
              <div
                className="bg-[#d2b48c] border-4 border-[#8b4513] p-6 cursor-pointer shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(0,0,0,0.5)] transition-all group relative"
                onClick={() => startGame(GameMode.FLAG_TO_COUNTRY)}
              >
                <div className="absolute top-2 right-2">
                  <span className="bg-[#e25c5c] border border-[#7c1a1a] text-white text-xs font-pixel-title px-2 py-1 shadow-[2px_2px_0_0_#7c1a1a]">
                    {t.popular}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#4a90e2] border-2 border-[#1a4b7c] flex items-center justify-center text-4xl shadow-inner">
                    <Flag className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#5c4033] font-pixel-title">
                    {t.modeFlagToCountry}
                  </h3>
                </div>
                <p className="text-[#3e2723] text-xl font-['VT323'] leading-tight">
                  {t.modeFlagToCountryDesc}
                </p>
              </div>

              {/* Country → Flag */}
              <div
                className="bg-[#a5d6a7] border-4 border-[#2e7d32] p-6 cursor-pointer shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(0,0,0,0.5)] transition-all group relative"
                onClick={() => startGame(GameMode.COUNTRY_TO_FLAG)}
              >
                <div className="absolute top-2 right-2">
                  <span className="bg-[#4a90e2] border border-[#1a4b7c] text-white text-xs font-pixel-title px-2 py-1 shadow-[2px_2px_0_0_#1a4b7c]">
                    {t.classic}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#f5f5f5] border-2 border-[#9e9e9e] flex items-center justify-center shadow-inner">
                    <HelpCircle className="w-8 h-8 text-[#5c4033]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1b5e20] font-pixel-title">
                    {t.modeCountryToFlag}
                  </h3>
                </div>
                <p className="text-[#1b5e20] text-xl font-['VT323'] leading-tight">
                  {t.modeCountryToFlagDesc}
                </p>
              </div>

              {/* Study Mode */}
              <div
                className="bg-[#2a233e] border-4 border-[#b39ddb] p-6 cursor-pointer shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(0,0,0,0.5)] transition-all group relative"
                onClick={goToStudySelect}
              >
                <div className="absolute top-2 right-2">
                  <span className="bg-[#b39ddb] border border-[#7c6a9e] text-[#2a233e] text-xs font-pixel-title px-2 py-1 shadow-[2px_2px_0_0_#7c6a9e]">
                    {t.studyBadge}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#b39ddb] border-2 border-[#7c6a9e] flex items-center justify-center shadow-inner">
                    <BookOpen className="w-8 h-8 text-[#2a233e]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#ede7f6] font-pixel-title">
                    {t.studyMode}
                  </h3>
                </div>
                <p className="text-[#b39ddb] text-xl font-['VT323'] leading-tight">
                  {t.studyModeDesc}
                </p>
                {/* Show counts if any data exists */}
                {(counts.wrong > 0 || counts.right > 0) && (
                  <div className="flex gap-3 mt-3">
                    {counts.wrong > 0 && (
                      <span className="flex items-center gap-1 bg-[#3e2723] border border-[#e25c5c] px-2 py-0.5 text-[#e25c5c] font-['VT323'] text-lg">
                        <XCircle className="w-3 h-3" /> {counts.wrong}
                      </span>
                    )}
                    {counts.right > 0 && (
                      <span className="flex items-center gap-1 bg-[#1b5e20] border border-[#76c442] px-2 py-0.5 text-[#76c442] font-['VT323'] text-lg">
                        <CheckCircle className="w-3 h-3" /> {counts.right}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STUDY SELECT ── */}
        {gameState === GameState.STUDY_SELECT && (
          <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center animate-fade-in-up">
            <div className="space-y-6 text-center md:text-left">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 text-[#d2b48c] font-['VT323'] text-xl hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> {t.mainMenu}
              </button>
              <h2 className="text-4xl md:text-5xl font-pixel-title text-[#f5f5f5] leading-tight drop-shadow-[4px_4px_0_#271c19]">
                {t.studySelectTitle}
              </h2>
              <p className="text-2xl text-[#d2b48c] max-w-lg leading-relaxed font-['VT323']">
                {t.studySelectDesc}
              </p>
            </div>

            <div className="grid gap-6 w-full max-w-md mx-auto">
              {/* Review Wrong */}
              <div className="relative">
                <div
                  className="bg-[#3e2723] border-4 border-[#e25c5c] p-6 cursor-pointer shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(0,0,0,0.5)] transition-all pr-14"
                  onClick={() => startStudy(StudyType.WRONG)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#e25c5c] border-2 border-[#7c1a1a] flex items-center justify-center shadow-inner">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#f5f5f5] font-pixel-title">
                        {t.reviewWrong}
                      </h3>
                      <p className="text-[#e25c5c] font-['VT323'] text-2xl mt-1">
                        {counts.wrong} {t.countries}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#a1887f] text-xl font-['VT323'] leading-tight">
                    {t.reviewWrongDesc}
                  </p>
                </div>
                {counts.wrong > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmClear(StudyType.WRONG);
                    }}
                    className="absolute top-3 right-3 bg-[#5c1a1a] border-2 border-[#e25c5c] text-[#e25c5c] p-2 hover:bg-[#e25c5c] hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]"
                    title={t.clearRecords}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Review Right */}
              <div className="relative">
                <div
                  className="bg-[#1b3a1f] border-4 border-[#76c442] p-6 cursor-pointer shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(0,0,0,0.5)] transition-all pr-14"
                  onClick={() => startStudy(StudyType.RIGHT)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#76c442] border-2 border-[#3a6b1a] flex items-center justify-center shadow-inner">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#f5f5f5] font-pixel-title">
                        {t.reviewRight}
                      </h3>
                      <p className="text-[#76c442] font-['VT323'] text-2xl mt-1">
                        {counts.right} {t.countries}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#a5d6a7] text-xl font-['VT323'] leading-tight">
                    {t.reviewRightDesc}
                  </p>
                </div>
                {counts.right > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmClear(StudyType.RIGHT);
                    }}
                    className="absolute top-3 right-3 bg-[#1a3a1a] border-2 border-[#76c442] text-[#76c442] p-2 hover:bg-[#76c442] hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]"
                    title={t.clearRecords}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PLAYING ── */}
        {gameState === GameState.PLAYING && (
          <GameScreen mode={gameMode} language={language} onBack={goBack} />
        )}

        {/* ── STUDYING ── */}
        {gameState === GameState.STUDYING && (
          <StudyScreen
            studyType={studyType}
            language={language}
            onBack={goBackToStudySelect}
          />
        )}

        {/* ── CLEAR CONFIRMATION MODAL ── */}
        {confirmClear !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmClear(null)}
          >
            <div
              className={`
              mx-4 w-full max-w-sm border-4 p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.6)]
              ${
                confirmClear === StudyType.WRONG
                  ? "bg-[#3e2723] border-[#e25c5c]"
                  : "bg-[#1b3a1f] border-[#76c442]"
              }
            `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div
                  className={`w-16 h-16 border-2 flex items-center justify-center ${
                    confirmClear === StudyType.WRONG
                      ? "bg-[#e25c5c] border-[#7c1a1a]"
                      : "bg-[#76c442] border-[#3a6b1a]"
                  }`}
                >
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-center font-pixel-title text-2xl text-[#f5f5f5] leading-snug mb-2">
                {confirmClear === StudyType.WRONG
                  ? t.confirmClearWrong
                  : t.confirmClearRight}
              </h3>
              <p className="text-center font-['VT323'] text-xl text-[#a1887f] mb-8">
                {t.confirmClearDesc}
              </p>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConfirmClear(null)}
                  className="py-3 px-4 border-2 border-[#d2b48c] bg-transparent text-white font-['VT323'] text-2xl hover:bg-[#d2b48c] hover:text-[#3e2723] transition-colors"
                >
                  {t.confirmNo}
                </button>
                <button
                  onClick={() => handleClear(confirmClear)}
                  className={`py-3 px-4 border-2 font-['VT323'] text-2xl text-white transition-colors ${
                    confirmClear === StudyType.WRONG
                      ? "bg-[#e25c5c] border-[#e25c5c] hover:bg-[#c0392b] hover:border-[#c0392b]"
                      : "bg-[#76c442] border-[#76c442] hover:bg-[#5a9e30] hover:border-[#5a9e30]"
                  }`}
                >
                  {t.confirmYes}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 p-6 text-center text-[#d2b48c] text-lg font-['VT323']">
        <p>
          &copy; {new Date().getFullYear()} FlagGenius. Built with React &
          Tailwind.
        </p>
      </footer>

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
