import React, { useState, useEffect, useCallback } from 'react';
import { Country, GameMode, Question, Language } from '../types';
import { COUNTRIES } from '../constants';
import { Translations } from '../translations';
import Button from './Button';
import { Sparkles, ArrowRight, RefreshCw, Trophy, Home } from 'lucide-react';

interface GameScreenProps {
  mode: GameMode;
  language: Language;
  onBack: () => void;
}

const QUESTIONS_PER_ROUND = 10;

const GameScreen: React.FC<GameScreenProps> = ({ mode, language, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<Country | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [funFactIndex, setFunFactIndex] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const t = Translations[language];

  const generateQuestion = useCallback(() => {
    const targetIndex = Math.floor(Math.random() * COUNTRIES.length);
    const target = COUNTRIES[targetIndex];

    const options = [target];
    while (options.length < 5) {
      const distractorIndex = Math.floor(Math.random() * COUNTRIES.length);
      const distractor = COUNTRIES[distractorIndex];
      if (!options.find(o => o.code === distractor.code)) {
        options.push(distractor);
      }
    }

    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

    setQuestion({ target, options: shuffledOptions });
    setSelectedOption(null);
    setIsCorrect(null);
    setFunFactIndex(null);
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleOptionClick = (option: Country) => {
    if (selectedOption || !question) return;

    setSelectedOption(option);
    const correct = option.code === question.target.code;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 1);
    }

    // Set a random fact index from the target country
    // We assume English facts exist to determine the count
    const factsCount = question.target.funFacts.length;
    if (factsCount > 0) {
      setFunFactIndex(Math.floor(Math.random() * factsCount));
    } else {
      setFunFactIndex(-1); // Special value for default/fallback
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 >= QUESTIONS_PER_ROUND) {
      setIsGameOver(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      generateQuestion();
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setIsGameOver(false);
    generateQuestion();
  };

  const getCountryName = (c: Country) => language === 'zh' ? c.nameZh : c.name;

  // Helper to get text based on current language and stored index
  const getFunFactText = () => {
    if (funFactIndex === null || !question) return null;
    
    if (funFactIndex === -1) {
         return language === 'zh' ? "这个国家非常独特！" : "This is a unique country!";
    }

    const facts = language === 'zh' ? question.target.funFactsZh : question.target.funFacts;
    
    // Safety check if index is out of bounds for the current language array
    if (facts && facts[funFactIndex]) {
        return facts[funFactIndex];
    }
    
    return language === 'zh' ? "这个国家非常独特！" : "This is a unique country!";
  };

  const funFactText = getFunFactText();

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 animate-fade-in">
        <div className="bg-[#e6ccb2] border-4 border-[#8b4513] p-8 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative">
          {/* Decorative Corner Screws */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b4513]"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b4513]"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b4513]"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b4513]"></div>

          <div className="bg-[#ffeb3b] w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4 border-[#f57f17] shadow-[4px_4px_0px_0px_#f57f17]">
            <Trophy className="w-10 h-10 text-[#f57f17]" />
          </div>
          <h2 className="text-3xl font-pixel-title text-[#8b4513] mb-4 leading-normal">{t.gameOver}</h2>
          <p className="text-[#5c4033] mb-8 text-2xl font-['VT323']">
            {t.youScored} <span className="text-[#d32f2f] font-bold text-3xl">{score}</span> {t.outOf} <span className="text-3xl">{QUESTIONS_PER_ROUND}</span>
          </p>
          
          <div className="space-y-4">
             <Button variant="primary" fullWidth onClick={handleRestart}>
               <RefreshCw className="w-5 h-5 mr-2" />
               {t.playAgain}
             </Button>
             <Button variant="secondary" fullWidth onClick={onBack}>
               <Home className="w-5 h-5 mr-2" />
               {t.mainMenu}
             </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return <div className="text-center p-10 text-[#d2b48c] font-pixel-title text-xl">{t.loading}</div>;

  const isFlagMode = mode === GameMode.FLAG_TO_COUNTRY;
  const gridClasses = !isFlagMode 
    ? "grid-cols-3 sm:grid-cols-5" 
    : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="max-w-2xl mx-auto px-4 w-full">
      {/* Header Panel */}
      <div className="flex items-center justify-between mb-4 bg-[#5c4033] p-3 border-4 border-[#3e2723] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
        <button onClick={onBack} className="text-[#d2b48c] hover:text-white transition-colors">
            <Home className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
             <span className="text-xs font-bold tracking-wider text-[#d2b48c] uppercase font-pixel-title">{t.round}</span>
             <span className="text-white font-['VT323'] text-2xl">{currentQuestionIndex + 1} / {QUESTIONS_PER_ROUND}</span>
        </div>
        <div className="flex flex-col items-center">
            <span className="text-xs font-bold tracking-wider text-[#d2b48c] uppercase font-pixel-title">{t.score}</span>
            <span className="text-[#76c442] font-bold font-['VT323'] text-2xl">{score}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#e6ccb2] border-4 border-[#8b4513] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative transition-all duration-300">
        <div className="p-4 md:p-6 text-center border-b-4 border-[#8b4513] bg-[#d2b48c]">
          <h2 className="text-[#5c4033] uppercase text-sm font-bold mb-2 font-pixel-title">
            {isFlagMode ? t.identifyFlag : t.identifyCountry}
          </h2>
          
          <div className="flex justify-center items-center min-h-[80px] md:min-h-[120px]">
            {isFlagMode ? (
              <span className="text-8xl md:text-9xl filter drop-shadow-md transform hover:scale-105 transition-transform duration-300 emoji-flag cursor-default select-none">
                {question.target.emoji}
              </span>
            ) : (
              <h1 className="text-4xl md:text-6xl font-['VT323'] text-[#2c1b18] uppercase leading-none">
                {getCountryName(question.target)}
              </h1>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div className={`p-4 grid gap-3 bg-[#e6ccb2] ${gridClasses}`}>
          {question.options.map((option) => {
            const isSelected = selectedOption?.code === option.code;
            const isTarget = option.code === question.target.code;
            
            let variant: 'primary' | 'secondary' | 'success' | 'danger' = 'secondary';
            
            if (selectedOption) {
              if (isTarget) variant = 'success';
              else if (isSelected && !isTarget) variant = 'danger';
              else variant = 'secondary';
            }

            const opacityClass = selectedOption && !isTarget && !isSelected ? 'opacity-50' : 'opacity-100';

            return (
              <Button
                key={option.code}
                variant={variant}
                fullWidth
                disabled={!!selectedOption}
                onClick={() => handleOptionClick(option)}
                className={`text-xl py-3 group ${opacityClass} relative ${!isFlagMode ? 'justify-center' : 'justify-between'}`}
              >
                 <span className={`${!isFlagMode ? 'text-4xl emoji-flag' : ''}`}>
                    {!isFlagMode ? option.emoji : ''}
                 </span>
                 <span className={`flex-1 text-left ${isFlagMode ? 'text-center' : 'hidden'}`}>
                    {isFlagMode ? getCountryName(option) : ''}
                 </span>
                 
                 {selectedOption && isTarget && (
                     <div className="absolute right-2 top-2 bg-white/30 rounded p-0.5 pointer-events-none">
                         ✓
                     </div>
                 )}
              </Button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {selectedOption && (
          <div className="bg-[#3e2723] p-4 border-t-4 border-[#8b4513] text-[#d2b48c] animate-slide-up">
             <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                 <div className="text-center md:text-left">
                    <h3 className={`text-xl font-bold font-pixel-title ${isCorrect ? 'text-[#76c442]' : 'text-[#e25c5c]'}`}>
                        {isCorrect ? t.correct : t.wrong}
                    </h3>
                    {!isCorrect && (
                        <p className="text-[#a1887f] text-lg mt-1 font-['VT323'] flex items-center justify-center md:justify-start gap-2">
                            {t.correctAnswerWas} 
                            <span className={`text-[#fff8e1] font-bold ${!isFlagMode ? 'text-3xl emoji-flag' : ''}`}>
                                {isFlagMode ? getCountryName(question.target) : question.target.emoji}
                            </span>
                        </p>
                    )}
                 </div>
                 <Button onClick={handleNext} variant="primary" className="w-full md:w-auto min-w-[140px] py-2">
                    {t.next} <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
             </div>

             {/* Fun Fact Section */}
             {funFactText && (
               <div className="mt-2 bg-[#2a233e] p-3 border-2 border-[#5c4033] relative">
                  <div className="flex items-start gap-3">
                      <div className="mt-1">
                          <Sparkles className="w-5 h-5 text-[#b39ddb]" />
                      </div>
                      <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#b39ddb] mb-1 flex items-center gap-2 font-pixel-title">
                               {t.didYouKnow}
                          </h4>
                          <p className="text-[#ede7f6] text-lg leading-tight font-['VT323']">
                              {funFactText}
                          </p>
                      </div>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;