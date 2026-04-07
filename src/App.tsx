/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowRight, RefreshCw, CheckCircle, XCircle, Map, Sparkles, Compass, Lock, Unlock, PlayCircle } from 'lucide-react';
import { LEVELS_DATA, Question } from './constants';
import { User } from 'firebase/auth';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import { listenToAuthChanges, updateHumanityLevel } from './services/firebaseService';

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'levels' | 'playing' | 'level_finished' | 'all_clear'>('start');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [playingLevel, setPlayingLevel] = useState<number>(1);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // 初始化读取本地存档
  useEffect(() => {
    const savedLevel = localStorage.getItem('humanity_unlocked_level');
    if (savedLevel) {
      setUnlockedLevel(parseInt(savedLevel, 10));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const totalLevels = 10;
  const questionsPerRound = 5;
  const passingScore = 5;

  const startLevel = (level: number) => {
    const pool = LEVELS_DATA[level - 1] || LEVELS_DATA[0];
    // 随机打乱题库并抽取 5 题
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setCurrentQuestions(shuffled.slice(0, questionsPerRound));
    setPlayingLevel(level);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setGameState('playing');
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex) / questionsPerRound) * 100;

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsPerRound - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setGameState('level_finished');
      if (score >= passingScore && playingLevel === unlockedLevel && unlockedLevel < totalLevels) {
        const nextLevel = unlockedLevel + 1;
        setUnlockedLevel(nextLevel);
        localStorage.setItem('humanity_unlocked_level', nextLevel.toString());
        if (user) {
          updateHumanityLevel(user, nextLevel);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-animated-gradient p-4 md:p-8 font-sans relative overflow-hidden flex flex-col items-center justify-center">
      {/* 背景装饰 */}
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-10 left-10 md:top-20 md:left-32 opacity-30 text-white cursor-pointer pointer-events-none">
        <Map size={100} />
      </motion.div>
      <motion.div animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute bottom-10 right-10 md:bottom-32 md:right-32 opacity-30 text-white cursor-pointer pointer-events-none">
        <Compass size={120} />
      </motion.div>

      <header className="mb-6 md:mb-10 text-center relative z-10 pt-4 w-full">
        <div className="absolute top-0 right-0 left-0 flex justify-between items-center w-full max-w-6xl mx-auto px-2 md:px-0">
          <div>
            <a href="https://k12.vanpower.live" className="text-white hover:text-white/80 transition-colors bg-white/20 px-4 py-2 rounded-full font-bold text-sm border border-white/40 drop-shadow-sm flex items-center gap-2 backdrop-blur-sm shadow-md">
                <Compass className="w-4 h-4" /> Vanpower K12
            </a>
          </div>
          <UserMenu user={user} onOpenAuth={() => setIsAuthModalOpen(true)} />
        </div>
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }} className="mt-14 md:mt-16">
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-md mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-300 w-6 h-6 md:w-8 md:h-8" />
            中华历史地理大闯关
            <Sparkles className="text-yellow-300 w-6 h-6 md:w-8 md:h-8" />
          </h1>
          <p className="text-white/90 text-base md:text-xl font-medium drop-shadow-sm">探索中华文明，挑战你的知识库！</p>
        </motion.div>
      </header>

      <main className="w-full max-w-3xl mx-auto relative z-10 flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {gameState === 'start' && (
            <motion.div key="start" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="glass p-10 rounded-[2rem] text-center w-full max-w-xl">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-md" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">准备好开始了吗？</h2>
              <button onClick={() => setGameState('levels')} className="group relative inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-400 text-white px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span>开始闯关之旅</span>
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {gameState === 'levels' && (
            <motion.div key="levels" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass p-6 md:p-10 rounded-[2rem] w-full text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">选择关卡</h2>
              <p className="text-slate-600 mb-8 font-medium">每关随机 5 题，必须全对才能解锁下一关！</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Array.from({ length: totalLevels }).map((_, index) => {
                  const level = index + 1;
                  const isUnlocked = level <= unlockedLevel;
                  return (
                    <motion.button
                      key={level}
                      whileHover={isUnlocked ? { scale: 1.05 } : {}}
                      whileTap={isUnlocked ? { scale: 0.95 } : {}}
                      onClick={() => isUnlocked && startLevel(level)}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-lg border-2 ${
                        isUnlocked 
                          ? 'bg-white/80 border-pink-300 text-slate-800 hover:bg-white cursor-pointer' 
                          : 'bg-white/30 border-white/40 text-slate-400 cursor-not-allowed opacity-70'
                      }`}
                    >
                      <span className="text-3xl md:text-4xl font-black opacity-80">{level}</span>
                      <span className="text-sm font-bold mt-1 text-pink-500">
                        {isUnlocked ? '已解锁' : '未解锁'}
                      </span>
                      <div className="absolute top-2 right-2">
                        {isUnlocked ? <Unlock className="w-4 h-4 text-pink-400" /> : <Lock className="w-4 h-4 text-slate-400" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && currentQuestions.length > 0 && (
            <motion.div key="playing" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="glass p-6 md:p-8 rounded-[2rem] w-full max-w-2xl">
              <div className="mb-6 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 font-bold bg-white/50 px-3 py-1 rounded-full text-sm">第 {playingLevel} 关 - 题目 {currentQuestionIndex + 1} / {questionsPerRound}</span>
                  <span className="text-pink-600 font-black bg-white/50 px-3 py-1 rounded-full text-sm">得分: <span className="text-lg">{score}</span></span>
                </div>
                <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div className="h-full bg-gradient-to-r from-pink-500 to-violet-500" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                {currentQuestion.question}
              </h3>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrectAnswer = index === currentQuestion.answer;
                  const showCorrect = selectedOption !== null && isCorrectAnswer;
                  const showWrong = isSelected && !isCorrectAnswer;

                  return (
                    <motion.button
                      whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                      whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                      key={index}
                      onClick={() => handleOptionClick(index)}
                      disabled={selectedOption !== null}
                      className={`w-full p-4 md:p-5 rounded-2xl text-left transition-all duration-300 font-medium text-base md:text-lg flex items-center justify-between border-2
                        ${selectedOption === null 
                          ? 'bg-white/60 hover:bg-white/90 border-transparent shadow-sm' 
                          : showCorrect 
                            ? 'bg-green-100 border-green-500 text-green-800 shadow-md' 
                            : showWrong 
                              ? 'bg-red-100 border-red-400 text-red-800' 
                              : 'bg-white/40 border-transparent opacity-50'
                        }`}
                    >
                      <span>{option}</span>
                      {showCorrect && <CheckCircle className="w-6 h-6 text-green-600 min-w-6" />}
                      {showWrong && <XCircle className="w-6 h-6 text-red-500 min-w-6" />}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div initial={{ opacity: 0, height: 0, y: 20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} className="mt-8 overflow-hidden">
                    <div className={`p-5 rounded-2xl border-l-4 shadow-inner ${selectedOption === currentQuestion.answer ? 'bg-green-50/80 border-green-500' : 'bg-red-50/80 border-red-500'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {selectedOption === currentQuestion.answer ? (
                          <><CheckCircle className="text-green-600 w-6 h-6" /> <span className="font-bold text-green-700 text-lg">回答正确！</span></>
                        ) : (
                          <><XCircle className="text-red-600 w-6 h-6" /> <span className="font-bold text-red-700 text-lg">回答错误！</span></>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed text-sm md:text-base">{currentQuestion.explanation}</p>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNext} className="flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-700 transition shadow-lg">
                        {currentQuestionIndex < questionsPerRound - 1 ? '下一题' : '查看过关结算'} <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {gameState === 'level_finished' && (
            <motion.div key="level_finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-10 rounded-[2rem] text-center w-full max-w-xl">
              <motion.div animate={{ rotate: score >= passingScore ? 360 : [-10, 10, -10, 0] }} transition={{ duration: 1 }}>
                {score >= passingScore ? <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-lg" /> : <XCircle className="w-24 h-24 text-slate-400 mx-auto mb-6 drop-shadow-lg" />}
              </motion.div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                {score >= passingScore ? `恭喜通过第 ${playingLevel} 关！` : `第 ${playingLevel} 关挑战失败`}
              </h2>
              <p className="text-slate-600 font-medium mb-8">
                {score >= passingScore ? '你的知识储备令人叹服！' : `需要答对 ${passingScore} 题才能过关哦！`}
              </p>
              
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 mb-8 inline-block shadow-inner border border-white/60">
                <span className="block text-sm text-slate-500 font-bold uppercase mb-1">本关得分</span>
                <span className={`text-6xl font-black bg-clip-text text-transparent ${score >= passingScore ? 'bg-gradient-to-r from-pink-500 to-violet-500' : 'bg-slate-400'}`}>
                  {score} <span className="text-3xl text-slate-400">/ {questionsPerRound}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setGameState('levels')} className="flex items-center justify-center gap-2 bg-white/80 text-slate-700 px-8 py-3 rounded-full font-bold hover:bg-white hover:text-pink-600 transition shadow hover:shadow-md">
                  <Map className="w-5 h-5" /> 返回选关
                </button>
                {score >= passingScore && playingLevel < totalLevels ? (
                  <button onClick={() => startLevel(playingLevel + 1)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition hover:scale-105">
                    <PlayCircle className="w-5 h-5" /> 下一关挑战
                  </button>
                ) : (
                  <button onClick={() => startLevel(playingLevel)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition hover:scale-105">
                    <RefreshCw className="w-5 h-5" /> 再次挑战本关
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

