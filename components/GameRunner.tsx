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

const MapPinDrop = dynamic(() => import('./MapPinDrop'), { ssr: false });

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
  const [questions, setQuestions] = useState<{ capitals: CapitalQuestion[]; photos: PhotoQuestion[]; trivias: TriviaQuestion[]; }>({ capitals: [], photos: [], trivias: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // MapGuessr specific states
  const [pinDrop, setPinDrop] = useState<{ lat: number; lng: number } | null>(null);
  const [mapResult, setMapResult] = useState<{ distance: number; pts: number } | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      setQuestions(getRandomizedRunQuestions(mode));
      if (mode === 'capital') setStage('capitals');
      else if (mode === 'photoguessr') setStage('photos');
      else if (mode === 'trivia') setStage('trivias');
      else setStage('capitals');
      initRef.current = true;
    }
  }, [mode]);

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

  const currentQ = stage === 'capitals' ? questions.capitals[currentIndex] : stage === 'photos' ? questions.photos[currentIndex] : questions.trivias[currentIndex];

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

  const handleMapSubmit = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setTotalQuestions((prev) => prev + 1);
    setIsMapExpanded(true); // Auto expand map to show result

    if (!pinDrop) {
      setMapResult({ distance: 9999, pts: 0 });
      setTimeout(advanceNextQuestion, 4000);
      return;
    }

    const actual = (currentQ as PhotoQuestion).coordinates;
    const dist = getDistanceKm(actual.lat, actual.lng, pinDrop.lat, pinDrop.lng);
    
    let pts = 0;
    if (dist <= 100) pts = 500; // Exact guess bonus
    else if (dist < 4000) pts = Math.floor(500 - (dist / 4000) * 500);

    setScore((prev) => prev + pts);
    if (pts > 200) setCorrectAnswers((prev) => prev + 1);
    setMapResult({ distance: dist, pts });

    setTimeout(advanceNextQuestion, 4000);
  };

  const advanceNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setPinDrop(null);
    setMapResult(null);
    setIsMapExpanded(false);
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
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
      <div className="bg-white rounded-3xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl relative flex flex-col border-4 border-slate-200">
        
        {/* Game Header */}
        <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex justify-between items-center text-slate-800 z-10 relative">
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{stage} Stage</div>
            <div className="text-2xl font-black">{timeLeft}s</div>
          </div>
          <div className="text-center hidden sm:block">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentIndex + 1} / 10</div>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Score</div>
              <div className="text-2xl font-black text-blue-600">{score}</div>
            </div>
            <button onClick={onClose} className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-700">✕</button>
          </div>
        </div>

        {/* Dynamic Body Area */}
        <div className="flex-1 relative bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
          
          {stage === 'complete' ? (
            <div className="text-center z-10 bg-white p-12 rounded-3xl shadow-2xl">
              <h2 className="text-5xl font-black mb-4 text-slate-900">RUN COMPLETE</h2>
              <div className="text-7xl font-black text-blue-600 mb-2">{score} <span className="text-3xl text-slate-400">XP</span></div>
              <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest">Accuracy: {Math.round((correctAnswers / (totalQuestions || 1)) * 100)}%</p>
              <button onClick={onClose} className="px-10 py-5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition text-xl">
                VIEW LEADERBOARD
              </button>
            </div>
          ) : (
            <>
              {/* Photo & Map Mode Layout */}
              {stage === 'photos' && currentQ && (
                <div className="absolute inset-0 w-full h-full">
                  {/* Un-cropped full screen image */}
                  <img 
                    src={(currentQ as PhotoQuestion).imageUrl} 
                    alt="Location" 
                    className="w-full h-full object-contain bg-slate-950 p-2 pb-32 md:pb-2" 
                  />
                  
                  {/* Floating Map Container */}
                  <div 
                    className={`absolute bottom-4 right-4 transition-all duration-300 ease-in-out border-4 border-white shadow-2xl rounded-2xl overflow-hidden bg-slate-200 flex flex-col
                      ${isMapExpanded ? 'w-[90vw] h-[70vh] md:w-[800px] md:h-[500px] bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 z-50' : 'w-48 h-32 md:w-80 md:h-56 cursor-pointer hover:scale-105 opacity-80 hover:opacity-100 z-20'}`
                    }
                  >
                    {/* Expand Toggle Bar */}
                    <div 
                      className="bg-slate-800 text-white text-xs font-bold text-center py-1 cursor-pointer flex-shrink-0"
                      onClick={() => setIsMapExpanded(!isMapExpanded)}
                    >
                      {isMapExpanded ? '▼ CLICK TO MINIMIZE' : '▲ CLICK TO EXPAND MAP'}
                    </div>

                    <div className="flex-1 relative w-full h-full" onClick={() => !isMapExpanded && setIsMapExpanded(true)}>
                       <MapPinDrop onPinDrop={(lat, lng) => setPinDrop({ lat, lng })} isExpanded={isMapExpanded} />
                    </div>

                    {/* Submit Button (Only visible when expanded) */}
                    {isMapExpanded && !isAnswered && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMapSubmit(); }} 
                        disabled={!pinDrop}
                        className={`w-full py-4 font-black text-white text-lg transition flex-shrink-0 ${pinDrop ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-400 cursor-not-allowed'}`}
                      >
                        {pinDrop ? 'GUESS LOCATION' : 'DROP A PIN FIRST'}
                      </button>
                    )}

                    {/* Result Overlay inside Map */}
                    {isAnswered && mapResult && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6">
                        <div className="text-4xl font-black text-slate-900 mb-2">{mapResult.distance.toLocaleString()} km away</div>
                        <div className="text-2xl font-bold text-green-600 mb-4">+{mapResult.pts} Points</div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Actual Location: {(currentQ as PhotoQuestion).locationName}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Text Trivia & Capitals Mode Layout */}
              {stage !== 'photos' && currentQ && 'options' in currentQ && (
                <div className="w-full max-w-4xl p-6 bg-white rounded-3xl shadow-xl z-10 m-4">
                  <h3 className="text-3xl md:text-4xl font-black text-slate-800 text-center mb-10 leading-tight">
                    {stage === 'capitals' && `What is the capital of ${(currentQ as CapitalQuestion)?.country}?`}
                    {stage === 'trivias' && (currentQ as TriviaQuestion)?.question}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQ.options.map((opt: string) => {
                      let btnClass = "bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200";
                      if (isAnswered) {
                        const isCorrect = stage === 'capitals' ? opt === (currentQ as CapitalQuestion).capital : opt === (currentQ as TriviaQuestion).correctAnswer;
                        if (isCorrect) btnClass = "bg-green-500 text-white border-green-600 scale-105 shadow-lg";
                        else if (opt === selectedOption) btnClass = "bg-red-500 text-white border-red-600";
                        else btnClass = "bg-slate-100 opacity-50";
                      } else if (opt === selectedOption) {
                        btnClass = "bg-blue-500 text-white border-blue-600";
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          disabled={isAnswered}
                          className={`p-6 rounded-2xl font-black text-xl transition-all duration-200 ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}