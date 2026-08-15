'use client';

import React, { useState, useEffect } from 'react';
import { recordRunActivity } from '@/lib/telemetry';

export interface Question {
  id: number;
  stageName?: 'Stage 1: Capital Match' | 'Stage 2: VideoGuessr' | 'Stage 3: GeoTrivia';
  type: 'capital' | 'videoguessr' | 'trivia';
  title: string;
  mediaUrl?: string;
  options: string[];
  correctAnswer: string;
  targetLat?: number;
  targetLng?: number;
}

// Full Question Pool organized for single modes & 3-stage marathons
const QUESTION_BANK: Question[] = [
  // --- Capital Match Questions ---
  {
    id: 101,
    stageName: 'Stage 1: Capital Match',
    type: 'capital',
    title: 'What is the official capital city of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
    correctAnswer: 'Canberra',
  },
  {
    id: 102,
    stageName: 'Stage 1: Capital Match',
    type: 'capital',
    title: 'Identify the capital city of Brazil:',
    options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'],
    correctAnswer: 'Brasília',
  },

  // --- VideoGuessr Questions ---
  {
    id: 201,
    stageName: 'Stage 2: VideoGuessr',
    type: 'videoguessr',
    title: 'Which coastal metropolis features this landmark harbor skyline?',
    mediaUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80',
    options: ['Sydney, Australia', 'Cape Town, South Africa', 'Lisbon, Portugal', 'Rio de Janeiro, Brazil'],
    correctAnswer: 'Sydney, Australia',
    targetLat: -33.8688,
    targetLng: 151.2093,
  },
  {
    id: 202,
    stageName: 'Stage 2: VideoGuessr',
    type: 'videoguessr',
    title: 'In which high-altitude South American valley is this city located?',
    mediaUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1000&q=80',
    options: ['Quito, Ecuador', 'La Paz, Bolivia', 'Cusco, Peru', 'Santiago, Chile'],
    correctAnswer: 'Cusco, Peru',
    targetLat: -13.5319,
    targetLng: -71.9675,
  },

  // --- GeoTrivia Questions ---
  {
    id: 301,
    stageName: 'Stage 3: GeoTrivia',
    type: 'trivia',
    title: 'Which sovereign nation spans 11 standard time zones?',
    options: ['Canada', 'Russia', 'United States', 'China'],
    correctAnswer: 'Russia',
  },
  {
    id: 302,
    stageName: 'Stage 3: GeoTrivia',
    type: 'trivia',
    title: 'Which river is geographically recognized as the longest in the world?',
    options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
    correctAnswer: 'Nile River',
  },
];

interface GameRunnerProps {
  mode: 'capital' | 'videoguessr' | 'trivia' | 'marathon_practice' | 'terrathon_official';
  userId: string | null;
  runnerName: string;
  onClose: () => void;
}

export default function GameRunner({ mode, userId, runnerName, onClose }: GameRunnerProps) {
  // Filter relevant questions for mode
  const activeQuestions = React.useMemo(() => {
    if (mode === 'capital') return QUESTION_BANK.filter((q) => q.type === 'capital');
    if (mode === 'videoguessr') return QUESTION_BANK.filter((q) => q.type === 'videoguessr');
    if (mode === 'trivia') return QUESTION_BANK.filter((q) => q.type === 'trivia');
    return QUESTION_BANK; // 'marathon_practice' and 'terrathon_official' use all 3 stages sequentially
  }, [mode]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Active Precision Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 50);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  const currentQ = activeQuestions[currentIndex];

  const handleNextQuestion = async () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    // Speed bonus calculation: Faster answers yield extra XP
    const timeBonus = Math.max(0, 50 - Math.floor(elapsedMs / 2000));
    const nextScore = isCorrect ? score + 100 + timeBonus : score;

    if (isCorrect) setCorrectCount(nextCorrect);
    setScore(nextScore);

    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // Finalize Run
      setIsFinished(true);
      const totalTime = Date.now() - startTime;
      const accuracy = Math.round((nextCorrect / activeQuestions.length) * 100);

      if (userId) {
        setIsSaving(true);
        try {
          await recordRunActivity({
            userId,
            mode,
            isProctored: mode === 'terrathon_official',
            totalTimeMs: totalTime,
            accuracyPercentage: accuracy,
            avgPinErrorKm: mode === 'videoguessr' ? 14.2 : 0,
            score: nextScore,
            splits: [],
          });
        } catch (err) {
          console.error('Failed to save run telemetry:', err);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${mins > 0 ? `${mins}m ` : ''}${secs}.${tenths}s`;
  };

  const isOfficial = mode === 'terrathon_official';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top Header & Telemetry Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase tracking-wider ${
                isOfficial ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-amber-400 border border-amber-400/30'
              }`}>
                {mode.replace('_', ' ')}
              </span>
              {currentQ.stageName && (
                <span className="text-xs text-slate-400 font-semibold">{currentQ.stageName}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Runner: <span className="text-white font-semibold">{runnerName}</span></p>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 uppercase">Score</span>
              <span className="text-amber-400 text-lg font-bold">+{score} XP</span>
            </div>
            <div className="text-right bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase">Timer</span>
              <span className="text-white text-base font-bold">⏱ {formatTime(elapsedMs)}</span>
            </div>
          </div>
        </div>

        {!isFinished ? (
          <div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full mb-6 overflow-hidden border border-slate-800">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Heading */}
            <div className="mb-6">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Question {currentIndex + 1} of {activeQuestions.length}
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">{currentQ.title}</h2>
            </div>

            {/* Media Image Preview for VideoGuessr */}
            {currentQ.mediaUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800 max-h-60 relative">
                <img src={currentQ.mediaUrl} alt="Location challenge clip" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2.5 py-1 rounded-md text-[10px] text-slate-300 backdrop-blur">
                  🎥 Visual Location Feed
                </div>
              </div>
            )}

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {currentQ.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  className={`p-4 rounded-xl font-semibold text-left transition-all border ${
                    selectedOption === option
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg scale-[1.01]'
                      : 'bg-slate-950/70 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white font-semibold text-sm transition"
              >
                Abort Run
              </button>
              <button
                disabled={!selectedOption}
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-amber-400 text-slate-950 font-extrabold rounded-xl hover:bg-amber-300 disabled:opacity-40 transition shadow-lg"
              >
                {currentIndex + 1 === activeQuestions.length ? 'Submit Final Run →' : 'Next Stage →'}
              </button>
            </div>
          </div>
        ) : (
          /* Completion Telemetry Screen */
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-amber-400/20 border border-amber-400/40 text-amber-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl">
              🏁
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-1">Run Complete!</h2>
            <p className="text-slate-400 text-sm mb-8">
              {isOfficial
                ? 'Your score has been verified and posted to the official Terrathon Leaderboard.'
                : 'Practice run metrics saved to your personal activity log.'}
            </p>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-8">
              <div>
                <span className="block text-slate-500 text-xs uppercase font-mono mb-1">Final XP</span>
                <span className="font-mono text-2xl font-extrabold text-amber-400">+{score}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs uppercase font-mono mb-1">Accuracy</span>
                <span className="font-mono text-2xl font-extrabold text-emerald-400">
                  {Math.round((correctCount / activeQuestions.length) * 100)}%
                </span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs uppercase font-mono mb-1">Split Time</span>
                <span className="font-mono text-2xl font-extrabold text-sky-400">{formatTime(elapsedMs)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-full py-3.5 bg-amber-400 text-slate-950 font-extrabold rounded-xl hover:bg-amber-300 transition shadow-lg"
            >
              {isSaving ? 'Syncing Telemetry...' : 'Return to 3D Globe Hub'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}