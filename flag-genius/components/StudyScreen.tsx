import React, { useState, useEffect, useRef } from "react";
import { Country, Question, StudyType, Language } from "../types";
import { COUNTRIES } from "../constants";
import { Translations } from "../translations";
import { getWrongCodes, getRightCodes } from "../storage";
import Button from "./Button";
import {
  Home,
  Clock,
  Trophy,
  RotateCcw,
  XCircle,
  CheckCircle,
} from "lucide-react";

interface StudyScreenProps {
  studyType: StudyType;
  language: Language;
  onBack: () => void;
}

const STUDY_TIME_LIMIT = 10;

const StudyScreen: React.FC<StudyScreenProps> = ({
  studyType,
  language,
  onBack,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Country | null>(null);
  // 'correct' | 'wrong' | 'timeout' | null
  const [result, setResult] = useState<"correct" | "wrong" | "timeout" | null>(
    null,
  );
  const [timeLeft, setTimeLeft] = useState(STUDY_TIME_LIMIT);
  const [isStudyOver, setIsStudyOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const startTimeRef = useRef(Date.now());
  const currentIndexRef = useRef(0);
  const questionsRef = useRef<Question[]>([]);

  const t = Translations[language];

  // ── Generate questions ──────────────────────────────────────────────
  useEffect(() => {
    const codes =
      studyType === StudyType.WRONG ? getWrongCodes() : getRightCodes();
    const studyCountries = COUNTRIES.filter((c) => codes.includes(c.code));

    if (studyCountries.length === 0) {
      setIsEmpty(true);
      return;
    }

    const shuffled = [...studyCountries].sort(() => Math.random() - 0.5);

    const qs: Question[] = shuffled.map((target) => {
      const options: Country[] = [target];
      while (options.length < 5) {
        const r = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        if (!options.find((o) => o.code === r.code)) options.push(r);
      }
      return { target, options: options.sort(() => Math.random() - 0.5) };
    });

    // Reset all state for a fresh session
    startTimeRef.current = Date.now();
    currentIndexRef.current = 0;
    questionsRef.current = qs;
    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedOption(null);
    setResult(null);
    setTimeLeft(STUDY_TIME_LIMIT);
    setIsStudyOver(false);
    setCorrectCount(0);
    setIsEmpty(false);
  }, [studyType, resetKey]);

  // Keep ref in sync
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // ── Advance to next question ────────────────────────────────────────
  const advance = () => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= questionsRef.current.length) {
      setTotalTime(Math.round((Date.now() - startTimeRef.current) / 1000));
      setIsStudyOver(true);
    } else {
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setResult(null);
      setTimeLeft(STUDY_TIME_LIMIT);
    }
  };

  // Use a ref so effects always call the latest version
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // ── Timer countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (result !== null || isStudyOver || questions.length === 0) return;
    if (timeLeft <= 0) {
      setResult("timeout");
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => parseFloat((prev - 0.1).toFixed(1)));
    }, 100);
    return () => clearTimeout(timer);
  }, [timeLeft, result, isStudyOver, questions.length]);

  // ── Auto-advance after result ───────────────────────────────────────
  useEffect(() => {
    if (result === null) return;
    const delay = result === "correct" ? 400 : 1500;
    const t = setTimeout(() => advanceRef.current(), delay);
    return () => clearTimeout(t);
  }, [result]);

  // ── Handle answer click ─────────────────────────────────────────────
  const handleOptionClick = (option: Country) => {
    if (result !== null || questions.length === 0) return;
    const question = questions[currentIndex];
    if (!question) return;
    setSelectedOption(option);
    const correct = option.code === question.target.code;
    setResult(correct ? "correct" : "wrong");
    if (correct) setCorrectCount((c) => c + 1);
  };

  const getCountryName = (c: Country) =>
    language === "zh" ? c.nameZh : c.name;

  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s}s`;
    }
    return `${seconds}s`;
  };

  const timerPercent = Math.max(0, (timeLeft / STUDY_TIME_LIMIT) * 100);
  const timerColor =
    timeLeft > 6 ? "#76c442" : timeLeft > 3 ? "#ffb300" : "#e25c5c";

  // ── Empty state ─────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <div className="bg-[#e6ccb2] border-4 border-[#8b4513] p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-lg font-pixel-title text-[#8b4513] mb-3 leading-relaxed">
            {studyType === StudyType.WRONG ? t.noWrongItems : t.noRightItems}
          </h2>
          <p className="text-[#5c4033] font-['VT323'] text-xl mb-6 leading-tight">
            {t.noStudyItemsDesc}
          </p>
          <Button variant="secondary" fullWidth onClick={onBack}>
            <Home className="w-4 h-4 mr-2" /> {t.backToStudy}
          </Button>
        </div>
      </div>
    );
  }

  // ── Study complete screen ───────────────────────────────────────────
  if (isStudyOver) {
    const total = questionsRef.current.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 animate-fade-in">
        <div className="bg-[#e6ccb2] border-4 border-[#8b4513] p-8 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative">
          <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b4513]"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b4513]"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b4513]"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b4513]"></div>

          <div className="bg-[#b39ddb] w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4 border-[#7c6a9e] shadow-[4px_4px_0px_0px_#7c6a9e]">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-pixel-title text-[#8b4513] mb-6 leading-normal">
            {t.studyComplete}
          </h2>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#d2b48c] border-2 border-[#8b4513] p-3">
              <div className="text-3xl font-['VT323'] text-[#76c442] font-bold">
                {correctCount}
              </div>
              <div className="text-xs font-pixel-title text-[#5c4033] leading-tight mt-1">
                {t.correctAnswers}
              </div>
            </div>
            <div className="bg-[#d2b48c] border-2 border-[#8b4513] p-3">
              <div className="text-3xl font-['VT323'] text-[#e25c5c] font-bold">
                {total - correctCount}
              </div>
              <div className="text-xs font-pixel-title text-[#5c4033] leading-tight mt-1">
                {t.missedAnswers}
              </div>
            </div>
            <div className="bg-[#d2b48c] border-2 border-[#8b4513] p-3">
              <div className="text-3xl font-['VT323'] text-[#4a90e2] font-bold">
                {accuracy}%
              </div>
              <div className="text-xs font-pixel-title text-[#5c4033] leading-tight mt-1">
                {t.accuracy}
              </div>
            </div>
          </div>

          {/* Total Time */}
          <div className="bg-[#2a233e] border-2 border-[#5c4033] p-4 mb-6 flex items-center justify-center gap-3">
            <Clock className="w-6 h-6 text-[#b39ddb]" />
            <div>
              <div className="text-xs font-pixel-title text-[#b39ddb] mb-1">
                {t.totalTime}
              </div>
              <div className="text-4xl font-['VT323'] text-[#ede7f6]">
                {formatTime(totalTime)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => setResetKey((k) => k + 1)}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> {t.studyAgain}
            </Button>
            <Button variant="secondary" fullWidth onClick={onBack}>
              <Home className="w-4 h-4 mr-2" /> {t.backToStudy}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentIndex];
  if (!question) return null;

  const isAnswered = result !== null;

  // ── Game screen ─────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 bg-[#5c4033] p-3 border-4 border-[#3e2723] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
        <button
          onClick={onBack}
          className="text-[#d2b48c] hover:text-white transition-colors"
        >
          <Home className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold tracking-wider text-[#d2b48c] uppercase font-pixel-title">
            {t.round}
          </span>
          <span className="text-white font-['VT323'] text-2xl">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold tracking-wider text-[#d2b48c] uppercase font-pixel-title">
            {t.score}
          </span>
          <span className="text-[#76c442] font-bold font-['VT323'] text-2xl">
            {correctCount}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="mb-3 bg-[#5c4033] border-2 border-[#3e2723] px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#d2b48c]" />
            <span className="text-[#d2b48c] font-['VT323'] text-xl">
              {Math.ceil(Math.max(0, timeLeft))}s
            </span>
          </div>
          <span className="text-[#d2b48c] font-['VT323'] text-lg opacity-60">
            {studyType === StudyType.WRONG ? "📕" : "📗"}{" "}
            {studyType === StudyType.WRONG ? t.reviewWrong : t.reviewRight}
          </span>
        </div>
        <div className="h-3 bg-[#3e2723] border border-[#271c19] overflow-hidden">
          <div
            className="h-full transition-none"
            style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#e6ccb2] border-4 border-[#8b4513] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
        {/* Flag display */}
        <div className="p-4 md:p-6 text-center border-b-4 border-[#8b4513] bg-[#d2b48c]">
          <h2 className="text-[#5c4033] uppercase text-sm font-bold mb-2 font-pixel-title">
            {t.identifyFlag}
          </h2>
          <div className="flex justify-center items-center min-h-[80px] md:min-h-[120px]">
            <span className="text-8xl md:text-9xl filter drop-shadow-md transform hover:scale-105 transition-transform duration-300 emoji-flag cursor-default select-none">
              {question.target.emoji}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 grid gap-3 bg-[#e6ccb2] grid-cols-1 sm:grid-cols-2">
          {question.options.map((option) => {
            const isSelected = selectedOption?.code === option.code;
            const isTarget = option.code === question.target.code;

            let variant: "primary" | "secondary" | "success" | "danger" =
              "secondary";
            if (isAnswered) {
              if (isTarget) variant = "success";
              else if (isSelected && !isTarget) variant = "danger";
            }

            const opacityClass =
              isAnswered && !isTarget && !isSelected
                ? "opacity-50"
                : "opacity-100";

            return (
              <Button
                key={option.code}
                variant={variant}
                fullWidth
                disabled={isAnswered}
                onClick={() => handleOptionClick(option)}
                className={`text-xl py-3 ${opacityClass} relative`}
              >
                {getCountryName(option)}
                {isAnswered && isTarget && (
                  <div className="absolute right-2 top-2 bg-white/30 rounded p-0.5 pointer-events-none">
                    ✓
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div className="bg-[#3e2723] p-4 border-t-4 border-[#8b4513] animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-2">
              {result === "correct" ? (
                <CheckCircle className="w-5 h-5 text-[#76c442]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#e25c5c]" />
              )}
              <h3
                className={`text-xl font-bold font-pixel-title ${result === "correct" ? "text-[#76c442]" : "text-[#e25c5c]"}`}
              >
                {result === "timeout"
                  ? t.timeUp
                  : result === "correct"
                    ? t.correct
                    : t.wrong}
              </h3>
            </div>

            {result !== "correct" && (
              <p className="text-[#a1887f] text-lg font-['VT323'] text-center mb-2">
                {t.correctAnswerWas}{" "}
                <span className="text-[#fff8e1] font-bold">
                  {getCountryName(question.target)}
                </span>
              </p>
            )}

            <p className="text-[#d2b48c] font-['VT323'] text-center text-lg animate-pulse">
              {result === "correct" ? t.nextNow : t.nextIn}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyScreen;
