'use client';

import React, { useState, useEffect } from 'react';
import {
  getRandomizedRunQuestions,
  CapitalQuestion,
  VideoQuestion,
  TriviaQuestion,
} from '@/lib/questions';
import { supabase } from '@/lib/supabase';

interface GameRunnerProps {
  mode: 'capital' | 'videoguessr' | 'trivia' | 'marathon_practice' | 'terrathon_official';
  userId: string | null;
  runnerName: string;
  onClose: () => void;
}

export default function GameRunner({ mode, userId, runnerName, onClose }: GameRunnerProps) {
  const [stage, setStage] = useState<'capitals' | 'videos' | 'trivias' | 'complete'>('capitals');
  const [questions, setQuestions] = useState<{
    capitals: CapitalQuestion[];
    videos: VideoQuestion[];
    trivias: TriviaQuestion[];
  }>({ capitals: [], videos: [], trivias: [] });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Initialize randomized questions pool on mount
  useEffect(() => {
    const randomized = getRandomizedRunQuestions(mode);
    setQuestions(randomized);

    if (mode === 'capital') setStage('capitals');
    else if (mode === 'videoguessr') setStage('videos');
    else if (mode === 'trivia') setStage('trivias');
    else setStage('capitals'); // Terrathon / Marathon starts at Stage 1 (Capitals)
  }, [mode]);

  // Timer countdown logic per question
  useEffect(() => {
    if (stage === 'complete' || isAnswered) return;

    if (timeLeft === 0) {
      handleAnswer(''); // Timeout treated as incorrect answer
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, stage]);

  const getCurrentQuestion = () => {
    if (stage === 'capitals') return questions.capitals[currentIndex];
    if (stage === 'videos') return questions.videos[currentIndex];
    if (stage === 'trivias') return questions.trivias[currentIndex];
    return null;
  };

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const q = getCurrentQuestion();
    let isCorrect = false;

    if (stage === 'capitals') {
      const capQ = q as CapitalQuestion;
      isCorrect = option === capQ.capital;
    } else if (stage === 'videos') {
      const vidQ = q as VideoQuestion;
      isCorrect = option === vidQ.country;
    } else if (stage === 'trivias') {
      const trivQ = q as TriviaQuestion;
      isCorrect = option === trivQ.correctAnswer;
    }

    if (isCorrect) {
      setScore((prev) => prev + 100 + timeLeft * 5);
      setCorrectAnswers((prev) => prev + 1);
    }
    setTotalQuestionsAnswered((prev) => prev + 1);

    // Auto-advance after 1.2 seconds
    setTimeout(() => {
      advanceNextQuestion();
    }, 1200);
  };

  const advanceNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setTimeLeft(20);

    const activeListLength =
      stage === 'capitals'
        ? questions.capitals.length
        : stage === 'videos'
        ? questions.videos.length
        : questions.trivias.length;

    if (currentIndex + 1 < activeListLength) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Stage completed, transition to next stage
      setCurrentIndex(0);
      if (mode === 'terrathon_official' || mode === 'marathon_practice') {
        if (stage === 'capitals' && questions.videos.length > 0) setStage('videos');
        else if (stage === 'videos' && questions.trivias.length > 0) setStage('trivias');
        else finishRun();
      } else {
        finishRun();
      }
    }
  };

  const finishRun = async () => {
    setStage('complete');

    // Sync score to Supabase telemetry table
    if (userId) {
      try {
        await supabase.from('run_activities').insert({
          user_id: userId,
          mode,
          score,
          accuracy_percentage: Math.round((correctAnswers / (totalQuestionsAnswered || 1)) * 100),
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to log telemetry:', err);
      }
    }
  };

  const currentQ = getCurrentQuestion();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative">
        {/* Header HUD */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <div>
            <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold uppercase rounded-md">
              {stage.toUpperCase()} STAGE
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              {runnerName || 'Runner'} — Question {currentIndex + 1} / 10
            </h3>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <div className="text-right">
              <span className="text-slate-400 text-xs block">SCORE</span>
              <span className="text-amber-400 font-extrabold text-lg">{score} XP</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              ✕ EXIT
            </button>
          </div>
        </div>

        {/* Stage 4: Run Complete */}
        {stage === 'complete' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-3xl flex items-center justify-center text-amber-400 text-3xl mx-auto mb-4">
              🏆
            </div>
            <h2 className="text-3xl font-black text-white mb-1">RUN COMPLETED</h2>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-6">
              Telemetry Logged to Leaderboard Matrix
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 font-mono">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-slate-500 text-[10px] block">FINAL SCORE</span>
                <span className="text-amber-400 font-black text-2xl">{score} XP</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-slate-500 text-[10px] block">ACCURACY</span>
                <span className="text-cyan-400 font-black text-2xl">
                  {Math.round((correctAnswers / (totalQuestionsAnswered || 1)) * 100)}%
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-4 bg-amber-400 text-slate-950 font-black rounded-2xl hover:bg-amber-300 transition shadow-lg text-sm font-mono"
            >
              RETURN TO HUB
            </button>
          </div>
        ) : (
          <div>
            {/* Countdown Progress Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full mb-6 overflow-hidden border border-slate-800">
              <div
                className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>

            {/* Video Player for VideoGuessr Stage */}
            {stage === 'videos' && currentQ && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-56">
                <video
                  src={(currentQ as VideoQuestion).videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-56 object-cover"
                />
              </div>
            )}

            {/* Question Text */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-white mb-2">
                {stage === 'capitals' && `What is the capital city of ${(currentQ as CapitalQuestion)?.country}?`}
                {stage === 'videos' && `Identify the country shown in this video location:`}
                {stage === 'trivias' && (currentQ as TriviaQuestion)?.question}
              </h4>
              {stage === 'videos' && (
                <p className="text-xs font-mono text-cyan-400">
                  CLUE: {(currentQ as VideoQuestion)?.clue}
                </p>
              )}
            </div>

            {/* Multiple Choice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentQ?.options.map((opt) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl font-bold text-sm text-left transition border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}