import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Award, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { ERAS_CURRICULUM } from '../../data/curriculumData';
import { soundManager } from '../../services/audioSynthesizer';

export const EraQuizModal: React.FC = () => {
  const { state, closeModal, recordQuizResult, triggerConfetti } = useUserLearning();
  const currentEra = ERAS_CURRICULUM.find((e) => e.id === state.currentEraId) || ERAS_CURRICULUM[0];

  const questions = currentEra.quizQuestions;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      soundManager.playQuizSuccess();
    } else {
      soundManager.playQuizError();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed quiz
      setIsCompleted(true);
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 0 : 0);
      recordQuizResult(currentEra.id, finalScore, questions.length);

      if (finalScore >= questions.length * 0.8) {
        triggerConfetti();
      }
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  const finalPercentage = Math.round((score / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              {currentEra.title}
            </div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Geological Mastery Examination
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!isCompleted ? (
            <>
              {/* Question progress indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    Question <strong className="text-slate-200">{currentIndex + 1}</strong> of {questions.length}
                  </span>
                  <span className="text-amber-400 font-mono-tabular">Category: {currentQ.taxonomy}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Prompt */}
              <div>
                <h4 className="text-base font-semibold text-slate-100 leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let buttonStyle = 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300';

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      buttonStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 shadow-sm shadow-emerald-900/40';
                    } else if (idx === selectedOption) {
                      buttonStyle = 'bg-rose-950/60 border-rose-500/80 text-rose-200';
                    } else {
                      buttonStyle = 'opacity-40 bg-slate-950 border-slate-900 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between gap-3 ${buttonStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {isAnswered && (
                <div
                  className={`p-3.5 rounded-xl text-xs space-y-1 border ${
                    selectedOption === currentQ.correctIndex
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <p className="font-semibold flex items-center gap-1.5">
                    {selectedOption === currentQ.correctIndex ? 'Correct Analysis!' : 'Scientific Context:'}
                  </p>
                  <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-amber-500/20 border border-amber-500/40">
                <Award className="w-8 h-8 text-amber-400" />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-slate-100">
                  {finalPercentage >= 80 ? 'Exceptional Mastery!' : 'Curriculum Completed!'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  You answered {score} out of {questions.length} questions correctly.
                </p>
              </div>

              {/* Score Metric Ring */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-w-xs mx-auto space-y-2">
                <div className="text-3xl font-extrabold text-amber-400 font-mono-tabular">
                  {finalPercentage}%
                </div>
                <div className="text-xs text-slate-400">
                  XP Earned:{' '}
                  <span className="text-emerald-400 font-bold">
                    +{score * 50 + (finalPercentage === 100 ? 100 : 0)} XP
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {finalPercentage >= 80
                  ? 'Your mastery has been logged in the personalized analytics engine and added to the competitive leaderboard!'
                  : 'Review the era narrative and simulation to achieve a higher score and unlock elite badges.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          {!isCompleted ? (
            <>
              <div className="text-xs text-slate-400 font-mono-tabular">
                Score: <span className="text-emerald-400 font-semibold">{score}</span> / {currentIndex}
              </div>
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 transition-all flex items-center gap-1.5"
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={handleRetry}
                className="px-4 py-2.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Quiz
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                Return to Curriculum
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
