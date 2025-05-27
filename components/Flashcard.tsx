import React from 'react';
import { WordPair } from '../types';

interface FlashcardProps {
  wordPair: WordPair;
  showAnswer: boolean;
  onCardClick: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ wordPair, showAnswer, onCardClick }) => {
  return (
    <div
      className="bg-white shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-lg min-h-[300px] flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
      onClick={onCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick(); }}
      aria-pressed={showAnswer}
      aria-label={showAnswer ? `Ocultar respuesta para ${wordPair.basque}` : `Mostrar respuesta para ${wordPair.basque}`}
    >
      <div className="text-center w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6 break-words">
          {wordPair.basque}
        </h2>
        <div
          className={`
            border-t-2 border-indigo-200
            transform transition-all duration-300 ease-in-out origin-top overflow-hidden
            ${showAnswer
              ? 'opacity-100 scale-100 max-h-[500px] mt-6 pt-6'
              : 'opacity-0 scale-95 max-h-0 mt-0 pt-0'
            }
          `}
        >
          {wordPair.spanish && (
            <p className="text-xl md:text-2xl text-slate-700 whitespace-pre-line break-words">
              {wordPair.spanish}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;