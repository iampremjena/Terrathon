'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  getRandomizedRunQuestions,
  CapitalQuestion,
  PhotoQuestion,
  TriviaQuestion,
} from '@/lib/questions';
import { supabase } from '@/lib/supabase';

// Dynamically import map to prevent Next.js server-side crashes
const MapPinDrop = dynamic(() => import('./MapPinDrop'), { ssr: false });

// Haversine Distance Calculator
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface GameRunnerProps {
  mode: 'capital' | 'photoguessr' | 'trivia' | 'marathon_practice' | 'terrathon_official';
  userId: string | null;
  runnerName: string;
  onClose: () => void;
}

export default function GameRunner({ mode, userId, runnerName, onClose }: GameRunnerProps) {
  const [stage, setStage] = useState<'capitals' | 'photos' | 'trivias' | 'complete'>('capitals');
  const [questions, setQuestions] = useState<{
    capitals: CapitalQuestion[];
    photos: PhotoQuestion[];
    trivias: TriviaQuestion[];
  }>({ capitals: [], photos: [], trivias: [] });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pinDrop, setPinDrop] = useState<{ lat: number; lng: number } | null>(null);
  const [mapResult, setMapResult] = useState<{ distance: number; pts: number } | null>(null);

  const initRef = useRef(false);

  // 1. Initialize exactly ONCE to prevent duplicate reshuffling
  useEffect(() => {
    if (!initRef.current) {
      const randomized = getRandomizedRunQuestions(mode);
      setQuestions(randomized);
      if (mode === 'capital') setStage('capitals');
      else if (mode === 'photoguessr') setStage('photos');
      else if (mode === 'trivia') setStage('trivias');
      else setStage('capitals');
      initRef.current = true;
    }
  }, [mode]);

  // Timer
  useEffect(() => {
    if (stage === 'complete' || isAnswered) return;
    if (timeLeft === 0) {
      if (stage === 'photos') handleMapSubmit();
      else handleAnswer('');
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, stage]);

  const getCurrentQuestion = () => {
    if (stage === 'capitals') return questions.capitals[currentIndex];
    if (stage === 'photos') return questions.photos[currentIndex];
    if (stage === 'trivias') return questions.trivias[currentIndex];
    return null;
  };

  const currentQ = getCurrentQuestion();

  // Handle Text Answers
  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    let isCorrect = false;
    if (stage === 'capitals') isCorrect = option === (currentQ as CapitalQuestion).capital;
    if (stage === 'trivias') isCorrect = option === (currentQ as TriviaQuestion).correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 100 + (timeLeft * 5));
      setCorrectAnswers((prev) => prev + 1);
    }
    setTotalQuestions((prev) => prev + 1);

    setTimeout(advanceNextQuestion, 1500);
  };

  // Handle Map Pin Drops
  const handleMapSubmit = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setTotalQuestions((prev) => prev + 1);

    if (!pinDrop) {
      setMapResult({ distance: 9999, pts: 0 });
      setTimeout(advanceNextQuestion, 3000);
      return;
    }

    const actual = (currentQ as PhotoQuestion).coordinates;
    const dist = getDistanceKm(actual.lat, actual.lng, pinDrop.lat, pinDrop.lng);
    
    // Scoring logic: Within 100km = 200 pts. Drops off up to 3000km.
    let pts = 0;
    if (dist <= 100) pts = 200;
    else if (dist < 3000) pts = Math.floor(200 - (dist / 3000) * 200);

    setScore((prev) => prev + pts);
    if (pts > 100) setCorrectAnswers((prev) => prev + 1); // Treat as "correct" if highly accurate
    setMapResult({ distance: dist, pts });

    setTimeout(advanceNextQuestion, 4000);
  };

  const advanceNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setPinDrop(null);
    setMapResult(null);
    setTimeLeft(20);

    const activeList = stage === 'capitals' ? questions.capitals : stage === 'photos' ? questions.photos : questions.trivias;

    if (currentIndex + 1 < activeList.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
      if (mode === 'terrathon_official' || mode === 'marathon_practice') {
        if (stage === 'capitals' && questions.photos.length > 0) setStage('photos');
        else if (stage === 'photos' && questions.trivias.length > 0) setStage('trivias');
        else finishRun();
      } else {
        finishRun();
      }
    }
  };

  const finishRun = async () => {
    setStage('complete');
    if (userId) {
      await supabase.from('run_activities').insert({
        user_id: userId,
        runner_name: runnerName || 'Runner',
        mode: mode.toUpperCase(),
        score,
        accuracy_percentage: Math.round((correctAnswers / (totalQuestions || 1)) * 100),
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border-4 border-slate-200 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Game Header */}
        <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex justify-between items-center text-slate-800">
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{stage} Stage</div>
            <div className="text-2xl font-black">{timeLeft}s</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentIndex + 1}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Score</div>
            <div className="text-2xl font-black text-blue-600">{score}</div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {stage === 'complete' ? (
            <div className="text-center py-10 text-slate-800">
              <h2 className="text-5xl font-black mb-4">GAME OVER</h2>
              <div className="text-7xl font-black text-blue-600 mb-8">{score}</div>
              <button onClick={onClose} className="px-8 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition">
                RETURN TO LOBBY
              </button>
            </div>
          ) : (
            <div>
              {/* Question Text */}
              <h3 className="text-2xl font-black text-slate-800 text-center mb-6">
                {stage === 'capitals' && `What is the capital of ${(currentQ as CapitalQuestion)?.country}?`}
                {stage === 'photos' && `Pinpoint this location on the map:`}
                {stage === 'trivias' && (currentQ as TriviaQuestion)?.question}
              </h3>

              {/* Photo & Map Mode */}
              {stage === 'photos' && currentQ && (
                <div className="space-y-4">
                  <img src={(currentQ as PhotoQuestion).imageUrl} alt="Location" className="w-full h-48 object-cover rounded-xl shadow-md" />
                  
                  {!isAnswered ? (
                    <>
                      <MapPinDrop onPinDrop={(lat, lng) => setPinDrop({ lat, lng })} />
                      <button 
                        onClick={handleMapSubmit} 
                        className={`w-full py-4 font-black rounded-xl text-white transition ${pinDrop ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'}`}
                      >
                        {pinDrop ? 'SUBMIT GUESS' : 'DROP A PIN TO GUESS'}
                      </button>
                    </>
                  ) : (
                    <div className="bg-slate-100 p-6 rounded-xl text-center">
                      <div className="text-3xl font-black text-slate-800 mb-2">{mapResult?.distance} km away</div>
                      <div className="text-xl font-bold text-blue-600">+{mapResult?.pts} Points</div>
                    </div>
                  )}
                </div>
              )}

              {/* FIX: Explicitly check if 'options' exists in currentQ before mapping */}
              {stage !== 'photos' && currentQ && 'options' in currentQ && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQ.options.map((opt: string) => {
                    let btnClass = "bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200";
                    if (isAnswered) {
                      const isCorrect = stage === 'capitals' ? opt === (currentQ as CapitalQuestion).capital : opt === (currentQ as TriviaQuestion).correctAnswer;
                      if (isCorrect) btnClass = "bg-green-500 text-white border-green-600";
                      else if (opt === selectedOption) btnClass = "bg-red-500 text-white border-red-600";
                    } else if (opt === selectedOption) {
                      btnClass = "bg-blue-500 text-white border-blue-600";
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        disabled={isAnswered}
                        className={`p-6 rounded-2xl font-black text-lg transition ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}