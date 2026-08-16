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
  const [isSavingRun, setIsSavingRun] = useState(false);

  // Initialize randomized questions pool
  useEffect(() => {
    const randomized = getRandomizedRunQuestions(mode);
    setQuestions(randomized);

    if (mode === 'capital') setStage('capitals');
    else if (mode === 'videoguessr') setStage('videos');
    else if (mode === 'trivia') setStage('trivias');
    else setStage('capitals');
  }, [mode]);

  // Timer countdown logic
  useEffect(() => {
    if (stage === 'complete' || isAnswered) return;

    if (timeLeft === 0) {
      handleAnswer('');
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

  // Log completed run directly to Supabase Strava feed table
  const finishRun = async () => {
    setStage('complete');
    setIsSavingRun(true);

    const finalAccuracy = Math.round((correctAnswers / (totalQuestionsAnswered || 1)) * 100);

    if (userId) {
      try {
        await supabase.from('run_activities').insert({
          user_id: userId,
          runner_name: runnerName || 'Runner',
          mode: mode.toUpperCase(),
          score,
          accuracy_percentage: finalAccuracy,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to log Strava telemetry activity:', err);
      } finally {
        setIsSavingRun(false);
      }
    } else {
      setIsSavingRun(false);
    }
  };

  const currentQ = getCurrentQuestion();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative">
        {/* Header HUD */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 font-mono">
          <div>
            <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase rounded-md">
              {stage.toUpperCase()} STAGE
            </span>
            <h3 className="text-lg font-black text-white mt-1">
              {runnerName || 'Runner'} — Q{currentIndex + 1} / 10
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-slate-500 text-[10px] block">TOTAL SCORE</span>
              <span className="text-amber-400 font-black text-base">{score} XP</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              ✕ EXIT
            </button>
          </div>
        </div>

        {/* Stage Completed Summary */}
        {stage === 'complete' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-3xl flex items-center justify-center text-amber-400 text-3xl mx-auto mb-4">
              🏆
            </div>
            <h2 className="text-3xl font-black text-white mb-1">RUN LOGGED TO STRAVA</h2>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-6">
              {isSavingRun ? 'SYNCING TELEMETRY DATA...' : 'ACTIVITY SAVED TO FEED & LEADERBOARD'}
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
              RETURN TO HUB →
            </button>
          </div>
        ) : (
          <div>
            {/* Timer Progress Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full mb-6 overflow-hidden border border-slate-800">
              <div
                className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>

            {/* Video Player Display for VideoGuessr Stage */}
            {stage === 'videos' && currentQ && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-56 relative">
                <video
                  key={(currentQ as VideoQuestion).id}
                  src={(currentQ as VideoQuestion).videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-400">
                  🎥 LIVE FEED
                </div>
              </div>
            )}

            {/* Question Header */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-white mb-2">
                {stage === 'capitals' && `What is the capital city of ${(currentQ as CapitalQuestion)?.country}?`}
                {stage === 'videos' && `Identify the country corresponding to this aerial footage:`}
                {stage === 'trivias' && (currentQ as TriviaQuestion)?.question}
              </h4>
              {stage === 'videos' && (
                <p className="text-xs font-mono text-cyan-400">
                  CLUE: {(currentQ as VideoQuestion)?.clue}
                </p>
              )}
            </div>

            {/* Answer Options Grid */}
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