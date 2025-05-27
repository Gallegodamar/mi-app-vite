
import React from 'react';

interface ControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onToggleAnswer: () => void;
  isAnswerShown: boolean;
  canPrevious: boolean;
  canNext: boolean;
  currentCardNumber: number;
  totalCards: number;
}

const Controls: React.FC<ControlsProps> = ({
  onPrevious,
  onNext,
  onToggleAnswer,
  isAnswerShown,
  canPrevious,
  canNext,
  currentCardNumber,
  totalCards,
}) => {
  return (
    <div className="mt-8 w-full max-w-lg flex flex-col items-center">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={onPrevious}
          disabled={!canPrevious}
          className="py-3 px-6 bg-slate-300 text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
        >
          Aurrekoa
        </button>
        <button
          onClick={onToggleAnswer}
          className="py-3 px-6 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75"
        >
          {isAnswerShown ? 'Erantzuna Ezkutatu' : 'Erantzuna Erakutsi'}
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
        >
          Hurrengoa
        </button>
      </div>
      <p className="text-slate-600 text-sm">
        Txartela: {currentCardNumber} / {totalCards}
      </p>
    </div>
  );
};

export default Controls;
