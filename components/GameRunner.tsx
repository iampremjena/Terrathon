'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { fetchAllRunQuestions, CapitalQuestion, PhotoQuestion, TriviaQuestion } from '@/lib/questions';
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

interface GameRunnerProps { mode: 'capital' | 'photoguessr' | 'trivia' | 'terrathon_official'; userId: string | null; runnerName: string; onClose: () => void; }

export default function GameRunner({ mode, userId, runnerName, onClose }: GameRunnerProps) {
  const [stage, setStage] = useState<'capitals' | 'photos' | 'trivias' | 'complete'>('capitals');
  const [questions, setQuestions] = useState<{ capitals: CapitalQuestion[]; photos: PhotoQuestion[]; trivias: TriviaQuestion[]; }>({ capitals: [], photos: [], trivias: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [pinDrop, setPinDrop] = useState<{ lat: number; lng: number } | null>(null);
  const [mapResult, setMapResult] = useState<{ distance: number; pts: number } | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const initRef = useRef(false);

 // Inside components/GameRunner.tsx, update the useEffect question loader:

useEffect(() => {
  async function loadQuestions() {
    setIsLoading(true);
    const data = await fetchAllRunQuestions(mode);

    setQuestions({
      capitals: data.capitals || [],
      photos: data.photos || [],
      trivias: data.trivias || []
    });

    if (mode === 'capital') setStage('capitals');
    else if (mode === 'photoguessr') setStage('photos');
    else if (mode === 'trivia') setStage('trivias');
    else setStage('capitals');

    setIsLoading(false);
  }

  if (!initRef.current) {
    loadQuestions();
    initRef.current = true;
  }
}, [mode]);

  useEffect(() => {
    if (isLoading || stage === 'complete' || isAnswered) return;
    if (timeLeft === 0) {
      if (stage === 'photos') handleMapSubmit();
      else handleAnswer('');
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, stage, isLoading]);

  const currentQ = stage === 'capitals' ? questions.capitals[currentIndex] : stage === 'photos' ? questions.photos[currentIndex] : questions.trivias[currentIndex];

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    let isCorrect = false;
    if (stage === 'capitals') isCorrect = option === (currentQ as CapitalQuestion).capital;
    if (stage === 'trivias') isCorrect = option === (currentQ as TriviaQuestion).correctAnswer;

    if (isCorrect) { setScore((prev) => prev + 100 + (timeLeft * 5)); setCorrectAnswers((prev) => prev + 1); }
    setTotalQuestions((prev) => prev + 1);
    setTimeout(advanceNextQuestion, 1500);
  };

  const handleMapSubmit = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setTotalQuestions((prev) => prev + 1);
    setIsMapExpanded(false);

    if (!pinDrop) {
      setMapResult({ distance: 9999, pts: 0 });
      setTimeout(advanceNextQuestion, 4000);
      return;
    }

    const actual = (currentQ as PhotoQuestion).coordinates;
    const dist = getDistanceKm(actual.lat, actual.lng, pinDrop.lat, pinDrop.lng);
    let pts = 0;
    if (dist <= 100) pts = 500; else if (dist < 4000) pts = Math.floor(500 - (dist / 4000) * 500);

    setScore((prev) => prev + pts);
    if (pts > 200) setCorrectAnswers((prev) => prev + 1);
    setMapResult({ distance: dist, pts });

    setTimeout(advanceNextQuestion, 4000);
  };

  const advanceNextQuestion = () => {
    setIsAnswered(false); setSelectedOption(null); setPinDrop(null); setMapResult(null); setIsMapExpanded(false); setTimeLeft(20);
    const activeList = stage === 'capitals' ? questions.capitals : stage === 'photos' ? questions.photos : questions.trivias;

    if (currentIndex + 1 < activeList.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
      if (mode === 'terrathon_official') {
        if (stage === 'capitals' && questions.photos.length > 0) setStage('photos');
        else if (stage === 'photos' && questions.trivias.length > 0) setStage('trivias');
        else finishRun();
      } else { finishRun(); }
    }
  };

  const finishRun = async () => {
    setStage('complete');
    if (userId) {
      await supabase.from('run_activities').insert({ user_id: userId, runner_name: runnerName || 'Runner', mode: mode.toUpperCase(), score, accuracy_percentage: Math.round((correctAnswers / (totalQuestions || 1)) * 100), created_at: new Date().toISOString() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-6">
      <div className="bg-white sm:rounded-3xl w-full h-full max-w-7xl max-h-screen sm:max-h-[95vh] overflow-hidden shadow-2xl relative flex flex-col sm:border-4 sm:border-slate-200">
        
        {/* Game Header */}
        <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex justify-between items-center text-slate-800 z-10 relative shadow-md">
          <div><div className="text-xs font-black text-slate-400 uppercase tracking-widest">{stage} Stage</div><div className="text-2xl font-black">{timeLeft}s</div></div>
          <div className="text-center hidden sm:block"><div className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentIndex + 1} / 10</div></div>
          <div className="text-right flex items-center gap-4">
            <div><div className="text-xs font-black text-slate-400 uppercase tracking-widest">Score</div><div className="text-2xl font-black text-blue-600">{score}</div></div>
            <button onClick={onClose} className="bg-slate-800 text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-rose-600 transition">QUIT</button>
          </div>
        </div>

        <div className="flex-1 relative bg-slate-900 flex flex-col items-center justify-center overflow-hidden w-full h-full">
          
          {isLoading ? (
            <div className="text-center text-white p-8">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-2xl font-black tracking-wide">GENERATING DYNAMIC RUN...</h3>
              <p className="text-slate-400 text-sm mt-2">Fetching live questions from global databases</p>
            </div>
          ) : stage === 'complete' ? (
            <div className="text-center z-10 bg-white p-12 rounded-3xl shadow-2xl m-4">
              <h2 className="text-5xl font-black mb-4 text-slate-900">RUN COMPLETE</h2>
              <div className="text-7xl font-black text-blue-600 mb-2">{score} <span className="text-3xl text-slate-400">XP</span></div>
              <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest">Accuracy: {Math.round((correctAnswers / (totalQuestions || 1)) * 100)}%</p>
              <button onClick={onClose} className="px-10 py-5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition text-xl w-full">RETURN TO LOBBY</button>
            </div>
          ) : (
            <>
              {/* PHOTO MODE */}
              {stage === 'photos' && currentQ && (
                <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 pb-48 sm:pb-4">
                  <img 
                    src={(currentQ as PhotoQuestion).imageUrl}
                    alt="Location" 
                    className="w-full h-full object-contain rounded-xl shadow-2xl" 
                  />
                  
                  {/* Thumbnail Map */}
                  {!isMapExpanded && !isAnswered && (
                    <div 
                      className="absolute bottom-6 sm:right-6 w-[90%] sm:w-80 h-40 sm:h-56 border-4 border-white shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform z-20 group"
                      onClick={() => setIsMapExpanded(true)}
                    >
                      <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-white font-black text-lg z-10 group-hover:bg-slate-900/90 transition-all text-center p-4">
                        📍 CLICK TO OPEN MAP
                      </div>
                      <div className="w-full h-full pointer-events-none opacity-40 blur-sm"><MapPinDrop onPinDrop={() => {}} isExpanded={false} /></div>
                    </div>
                  )}

                  {/* Result Overlay */}
                  {isAnswered && mapResult && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-300">
                      <div className="text-6xl sm:text-8xl font-black text-slate-900 mb-4">{mapResult.distance.toLocaleString()} <span className="text-4xl">km</span></div>
                      <div className="text-4xl font-bold text-green-600 mb-6">+{mapResult.pts} Points</div>
                      <div className="text-xl font-bold text-slate-500 uppercase tracking-widest bg-slate-100 p-4 rounded-xl">Target: {(currentQ as PhotoQuestion).locationName}</div>
                    </div>
                  )}
                </div>
              )}

              {/* EXPANDED CENTER MAP OVERLAY */}
              {isMapExpanded && (
                <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-8 animate-in fade-in duration-200">
                  <div className="bg-slate-800 sm:rounded-3xl shadow-2xl w-full h-full sm:max-w-6xl sm:max-h-[85vh] flex flex-col overflow-hidden border-2 border-slate-700">
                    <div className="flex justify-between items-center p-4 sm:p-6 bg-slate-900 border-b border-slate-700">
                      <div>
                        <h3 className="text-white font-black text-xl sm:text-2xl">PINPOINT LOCATION</h3>
                        <p className="text-slate-400 font-bold text-xs sm:text-sm mt-1">Clue: {(currentQ as PhotoQuestion).clue}</p>
                      </div>
                      <button onClick={() => setIsMapExpanded(false)} className="text-slate-400 hover:text-white bg-slate-800 p-3 rounded-xl font-black transition">✕ CLOSE</button>
                    </div>
                    
                    <div className="flex-1 relative w-full h-full bg-slate-800">
                       <MapPinDrop key="expanded-map" onPinDrop={(lat, lng) => setPinDrop({ lat, lng })} isExpanded={true} />
                    </div>
                    
                    <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-slate-400 font-bold text-sm hidden sm:block">📍 Drag the map to explore. Click anywhere to drop your pin.</p>
                      <button 
                        onClick={handleMapSubmit}
                        disabled={!pinDrop}
                        className={`w-full sm:w-auto px-12 py-5 font-black rounded-xl transition text-white text-lg ${pinDrop ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.6)] scale-105' : 'bg-slate-700 cursor-not-allowed opacity-50'}`}
                      >
                        {pinDrop ? 'CONFIRM LOCATION' : 'DROP PIN TO ENABLE'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TRIVIA / CAPITALS */}
              {stage !== 'photos' && currentQ && 'options' in currentQ && (
                <div className="w-full max-w-4xl p-6 sm:p-10 bg-white rounded-3xl shadow-2xl z-10 m-4 border-4 border-slate-100">
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-800 text-center mb-8 sm:mb-12 leading-tight">
                    {stage === 'capitals' && `What is the capital of ${(currentQ as CapitalQuestion)?.country}?`}
                    {stage === 'trivias' && (currentQ as TriviaQuestion)?.question}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {currentQ.options.map((opt: string) => {
                      let btnClass = "bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200";
                      if (isAnswered) {
                        const isCorrect = stage === 'capitals' ? opt === (currentQ as CapitalQuestion).capital : opt === (currentQ as TriviaQuestion).correctAnswer;
                        if (isCorrect) btnClass = "bg-green-500 text-white border-green-600 scale-105 shadow-xl"; else if (opt === selectedOption) btnClass = "bg-red-500 text-white border-red-600"; else btnClass = "bg-slate-100 opacity-40";
                      } else if (opt === selectedOption) btnClass = "bg-blue-500 text-white border-blue-600 shadow-md";
                      return ( <button key={opt} onClick={() => handleAnswer(opt)} disabled={isAnswered} className={`p-6 sm:p-8 rounded-2xl font-black text-lg sm:text-xl transition-all duration-200 ${btnClass}`}>{opt}</button> );
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