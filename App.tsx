import React, { useState, useCallback, useMemo } from 'react';
import Flashcard from './components/Flashcard';
import Controls from './components/Controls';
import { euskaraWords } from './data';
import { euskaraVerbs } from './verbData';
import { WordPair, LearningMode, Suffix } from './types';

// Helper function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const filterBySuffix = (words: WordPair[], suffixToFilter: 'kor' | 'pen'): WordPair[] => {
  return words.filter(wordPair => {
    const basqueWordPart = wordPair.basque.split(',')[0].trim();
    if (basqueWordPart.length >= suffixToFilter.length && !basqueWordPart.startsWith('-')) {
      return basqueWordPart.toLowerCase().endsWith(suffixToFilter.toLowerCase());
    }
    return false;
  });
};

const App: React.FC = () => {
  const [learningMode, setLearningMode] = useState<LearningMode>('selection');
  const [activeSuffix, setActiveSuffix] = useState<Suffix>(null);
  const [currentDeck, setCurrentDeck] = useState<WordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const initializeDeck = useCallback((deckData: WordPair[]) => {
    setCurrentDeck(shuffleArray(deckData));
    setCurrentIndex(0);
    setShowAnswer(false);
  }, []);

  const handleWordModeSelect = useCallback(() => {
    initializeDeck(euskaraWords);
    setLearningMode('words');
    setActiveSuffix(null);
  }, [initializeDeck]);

  const handleVerbModeSelect = useCallback(() => {
    initializeDeck(euskaraVerbs);
    setLearningMode('verbs');
    setActiveSuffix(null);
  }, [initializeDeck]);

  const handleSuffixCategorySelect = useCallback(() => {
    setLearningMode('suffixes');
    setActiveSuffix(null);
    setCurrentDeck([]); // Clear deck for suffix selection screen
  }, []);

  const handleSuffixSelect = useCallback((suffix: 'kor' | 'pen') => {
    const filteredData = filterBySuffix(euskaraWords, suffix);
    initializeDeck(filteredData);
    setActiveSuffix(suffix);
    setLearningMode('suffixes'); // Ensure mode is suffixes
  }, [initializeDeck]);

  const handleBackToMainSelection = useCallback(() => {
    setLearningMode('selection');
    setActiveSuffix(null);
    setCurrentDeck([]);
  }, []);

  const handleBackToSuffixSelection = useCallback(() => {
    setActiveSuffix(null);
    setCurrentDeck([]);
    // learningMode remains 'suffixes'
  }, []);


  const handleNext = useCallback(() => {
    if (currentIndex < currentDeck.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
      setShowAnswer(false);
    }
  }, [currentIndex, currentDeck.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      setShowAnswer(false);
    }
  }, [currentIndex]);

  const handleToggleAnswer = useCallback(() => {
    setShowAnswer(prevShow => !prevShow);
  }, []);

  const currentWordPair = useMemo(() => currentDeck[currentIndex], [currentDeck, currentIndex]);

  if (learningMode === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4 text-white" role="main">
        <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white shadow-lg rounded-xl p-4 bg-black bg-opacity-20">
              Euskara Ikasteko Txartelak
            </h1>
            <p className="text-lg text-indigo-100 mt-3">Aukeratu zure ikasketa bidea!</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={handleWordModeSelect}
            className="py-4 px-8 bg-sky-500 text-white font-semibold rounded-lg shadow-xl hover:bg-sky-600 transition-all duration-200 ease-in-out transform hover:scale-105 text-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
            aria-label="Hitzak ikasi"
          >
            Hitzak Ikasi
          </button>
          <button
            onClick={handleVerbModeSelect}
            className="py-4 px-8 bg-emerald-500 text-white font-semibold rounded-lg shadow-xl hover:bg-emerald-600 transition-all duration-200 ease-in-out transform hover:scale-105 text-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75"
            aria-label="Aditzak ikasi"
          >
            Aditzak Ikasi
          </button>
          <button
            onClick={handleSuffixCategorySelect}
            className="py-4 px-8 bg-rose-500 text-white font-semibold rounded-lg shadow-xl hover:bg-rose-600 transition-all duration-200 ease-in-out transform hover:scale-105 text-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-75"
            aria-label="Atzizkiak ikasi"
          >
            Atzizkiak Ikasi
          </button>
        </div>
         <footer className="absolute bottom-4 text-center text-slate-400 text-xs">
          <p>&copy; {new Date().getFullYear()} Euskaraz Ikasteko Tresnak.</p>
        </footer>
      </div>
    );
  }

  if (learningMode === 'suffixes' && !activeSuffix) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-600 flex flex-col items-center justify-center p-4 text-white" role="main">
        <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white shadow-lg rounded-xl p-4 bg-black bg-opacity-20">
              Euskara Ikasteko Txartelak: Atzizkiak
            </h1>
            <p className="text-lg text-indigo-100 mt-3">Aukeratu atzizkia</p>
        </header>
        <div className="space-y-6 md:space-y-0 md:space-x-8 flex flex-col md:flex-row mb-8">
          <button
            onClick={() => handleSuffixSelect('kor')}
            className="py-4 px-8 bg-yellow-500 text-slate-900 font-semibold rounded-lg shadow-xl hover:bg-yellow-600 transition-all duration-200 ease-in-out transform hover:scale-105 text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
            aria-label="'kor' atzizkia hautatu"
          >
            "-kor"
          </button>
          <button
            onClick={() => handleSuffixSelect('pen')}
            className="py-4 px-8 bg-lime-500 text-slate-900 font-semibold rounded-lg shadow-xl hover:bg-lime-600 transition-all duration-200 ease-in-out transform hover:scale-105 text-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-opacity-75"
            aria-label="'pen' atzizkia hautatu"
          >
            "-pen"
          </button>
        </div>
        <button
            onClick={handleBackToMainSelection}
            className="py-3 px-6 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
            aria-label="Modu nagusira itzuli"
          >
            Modu Nagusira Itzuli
        </button>
         <footer className="absolute bottom-4 text-center text-slate-400 text-xs">
          <p>&copy; {new Date().getFullYear()} Euskaraz Ikasteko Tresnak.</p>
        </footer>
      </div>
    );
  }
  
  if (currentDeck.length === 0) { // Changed condition here
     let emptyMessage = "Sorta kargatzen...";
     let backButtonText = "Modu Hautaketara Itzuli";
     let backButtonAction = handleBackToMainSelection;

    if (learningMode === 'suffixes' && activeSuffix) {
      emptyMessage = `Ez da aurkitu "${activeSuffix}" atzizkia duen hitzik.`;
      backButtonText = "Atzizki Hautaketara Itzuli";
      backButtonAction = handleBackToSuffixSelection;
    } else if (learningMode === 'words' || learningMode === 'verbs') {
        // This case might not be hit if initial decks always have words,
        // but good for robustness.
        emptyMessage = "Ez da hitzik aurkitu sorta honetan.";
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4 text-white">
        <h1 className="text-4xl font-bold mb-4">Euskara Ikasteko Txartelak</h1>
        <p className="text-xl mb-6">{emptyMessage}</p>
        <button
            onClick={backButtonAction}
            className="py-3 px-6 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 transition-colors"
            aria-label={backButtonText}
          >
            {backButtonText}
          </button>
      </div>
    );
  }


  let modeTitle = '';
  let modeSubtitle = '';

  if (learningMode === 'words') {
    modeTitle = 'Hitzak';
    modeSubtitle = 'Ikasi euskal hitzak erraz!';
  } else if (learningMode === 'verbs') {
    modeTitle = 'Aditzak';
    modeSubtitle = 'Menderatu euskal aditzak!';
  } else if (learningMode === 'suffixes' && activeSuffix) {
    modeTitle = `Atzizkiak: "${activeSuffix}"`;
    modeSubtitle = `"${activeSuffix}" atzizkia duten hitzak lantzen.`;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8" role="application">
      <header className="mb-8 text-center w-full max-w-3xl relative">
         <button
            onClick={handleBackToMainSelection}
            className="absolute top-0 left-0 -mt-2 ml-0 sm:ml-2 py-2 px-4 bg-black bg-opacity-20 text-indigo-100 hover:bg-opacity-30 font-semibold rounded-lg shadow-md transition-all duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-75"
            aria-label="Modu nagusira itzuli"
          >
            &larr; Modu Nagusira Itzuli
        </button>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white shadow-lg rounded-xl p-4 bg-black bg-opacity-20">
          Euskara Ikasteko Txartelak: {modeTitle}
        </h1>
        <p className="text-lg text-indigo-100 mt-2">{modeSubtitle}</p>
      </header>
      
      <main className="w-full flex flex-col items-center">
        {currentWordPair ? (
          <Flashcard wordPair={currentWordPair} showAnswer={showAnswer} />
        ) : (
           // This should ideally be caught by the empty deck check above, but as a fallback:
          <div className="bg-white shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-lg min-h-[300px] flex flex-col items-center justify-center">
            <p className="text-xl text-slate-700">Sorta amaitu da. Bikain!</p>
          </div>
        )}
        {currentDeck.length > 0 && ( // Only show controls if there's a deck
            <Controls
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleAnswer={handleToggleAnswer}
              isAnswerShown={showAnswer}
              canPrevious={currentIndex > 0}
              canNext={currentIndex < currentDeck.length - 1}
              currentCardNumber={currentDeck.length > 0 ? currentIndex + 1 : 0}
              totalCards={currentDeck.length}
            />
        )}
      </main>

      <footer className="mt-12 text-center text-indigo-200 text-sm">
        <p>&copy; {new Date().getFullYear()} Euskaraz Ikasteko Tresnak. Ikasketa on!</p>
      </footer>
    </div>
  );
};

export default App;