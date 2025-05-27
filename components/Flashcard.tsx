
import React from 'react';
import { WordPair } from '../types';

interface FlashcardProps {
  wordPair: WordPair;
  showAnswer: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ wordPair, showAnswer }) => {
  return (
    <div className="bg-white shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-lg min-h-[300px] flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6 break-words">
          {wordPair.basque}
        </h2>
        {showAnswer && (
          <div className="border-t-2 border-indigo-200 pt-6 mt-6">
            <p className="text-xl md:text-2xl text-slate-700 whitespace-pre-line break-words">
              {wordPair.spanish}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;
