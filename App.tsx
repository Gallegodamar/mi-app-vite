
import React, { useState, useCallback, useMemo } from 'react';
import Flashcard from './components/Flashcard';
import Controls from './components/Controls';
import ExplanationModal from './components/ExplanationModal';
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

const filterBySuffix = (words: WordPair[], suffixToFilter: Suffix): WordPair[] => {
  if (!suffixToFilter) return [];
  return words.filter(wordPair => {
    const basqueWordPart = wordPair.basque.split(',')[0].trim();
    if (basqueWordPart.length >= suffixToFilter.length && !basqueWordPart.startsWith('-')) {
      return basqueWordPart.toLowerCase().endsWith(suffixToFilter.toLowerCase());
    }
    return false;
  });
};

const KERIA_EXPLANATION = `Atzizki honek «nolakotasuna» adierazten du, baina beti gaitzespen-kutsu batekin.
Alde horretatik, -tasun atzizkiaren aurkaria litzateke.

Adibideak:
* erosotasun (comodidad) / *erosokeria* (dejadez)
* harrotasuna (orgullo) / *harrokeria* (fanfarronería)
* itsutasuna (ceguera) / *itsukeria* (obcecación, obstinación)
(Ikus beherago –tasun atzizkia).

Oharra:
Amaierako A berezkoa da; beraz, ezin da inoiz kendu: astakeri bat (*astakeria* bat), ez esan txorakeririk (*txorakeriarik*).`;

const KETA_EXPLANATION = `Erabilera:

* Atzizki hau oso emankorra da, eta «**ekintza**» edo «**jarduera**» adierazten du (ikus beherako –kuntza atzizkia).
* Iparraldean «**multzoa**» adierazteko erabiltzen dute. Adibidez: *ardoketa* (ardo-uzta, ardo bila), *belarketa* (belar-uzta, belar bila), *ogiketa* (gari-multzoa, ogi bila), *egurketa* (egur-pila, egur bila)...
* Aditzekin erabiltzen da (aditza + –keta). Adibidez: aldatu > *aldaketa*, banatu > *banaketa*, hitz egin > *hizketa*, zuzendu > *zuzenketa*...
* Hitz banaka batzuetan, -eta egiten dute: errieta, gogoeta, hileta (> hilketa), lapurreta (lapurketa).
* Azken urteotan, neurriz gain erabili izan da: agerketa, baloraketa, ebaluaketa, erabilketa, errepikaketa, fotokonposaketa, eta abar.
* Alde horretatik, bi gomendio emango ditugu:
* Maileguetan, -zio atzizkia mantendu: digestio, ebaluazio, konposizio...
* NOR (da) motako aditzekin, jardueraren gauzatzea adierazteko, hobe -era edo -tze erabiltzea. Adibidez: bihotzaren gelditze edo geldiera (??geldiketa), itsasontziaren hondoratzea (??hondoraketa), proiektuaren sorrera (??sorketa)...`;


const SUFFIX_DETAILS_LIST: Array<{ suffix: Exclude<Suffix, null>; label: string; color: string; textColor?: string; explanation: string;}> = [
  { suffix: 'kor', label: '-kor', color: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400', textColor: 'text-slate-900', explanation: "Azalpen hau laster egongo da eskuragarri." },
  { suffix: 'pen', label: '-pen', color: 'bg-lime-500 hover:bg-lime-600 focus:ring-lime-400', textColor: 'text-slate-900', explanation: "Azalpen hau laster egongo da eskuragarri." },
  { suffix: 'garri', label: '-garri', color: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-400', textColor: 'text-white', explanation: "Azalpen hau laster egongo da eskuragarri." },
  { suffix: 'keta', label: '-keta', color: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400', textColor: 'text-white', explanation: KETA_EXPLANATION },
  { suffix: 'ezin', label: '-ezin', color: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-400', textColor: 'text-white', explanation: "Azalpen hau laster egongo da eskuragarri." },
  { suffix: 'keria', label: '-keria', color: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400', textColor: 'text-slate-900', explanation: KERIA_EXPLANATION },
  { suffix: 'men', label: '-men', color: 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-400', textColor: 'text-white', explanation: "Azalpen hau laster egongo da eskuragarri." },
  { suffix: 'aldi', label: '-aldi', color: 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400', textColor: 'text-white', explanation: "Azalpen hau laster egongo da eskuragarri." },
  { suffix: 'tegi', label: '-tegi', color: 'bg-fuchsia-500 hover:bg-fuchsia-600 focus:ring-fuchsia-400', textColor: 'text-white', explanation: "Azalpen hau laster egongo da eskuragarri." },
  { suffix: 'buru', label: '-buru', color: 'bg-violet-500 hover:bg-violet-600 focus:ring-violet-400', textColor: 'text-white', explanation: "Azalpen hau laster egongo da eskuragarri." },
];


const App: React.FC = () => {
  const [learningMode, setLearningMode] = useState<LearningMode>('selection');
  const [activeSuffix, setActiveSuffix] = useState<Suffix>(null);
  const [currentDeck, setCurrentDeck] = useState<WordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState<boolean>(false);
  const [explanationModalContent, setExplanationModalContent] = useState<{ title: string, text: string } | null>(null);
  const [activeSuffixDetails, setActiveSuffixDetails] = useState<{ label: string, explanation: string } | null>(null);


  const initializeDeck = useCallback((deckData: WordPair[]) => {
    setCurrentDeck(shuffleArray(deckData));
    setCurrentIndex(0);
    setShowAnswer(false);
  }, []);

  const handleWordModeSelect = useCallback(() => {
    initializeDeck(euskaraWords);
    setLearningMode('words');
    setActiveSuffix(null);
    setActiveSuffixDetails(null);
  }, [initializeDeck]);

  const handleVerbModeSelect = useCallback(() => {
    initializeDeck(euskaraVerbs);
    setLearningMode('verbs');
    setActiveSuffix(null);
    setActiveSuffixDetails(null);
  }, [initializeDeck]);

  const handleSuffixCategorySelect = useCallback(() => {
    setLearningMode('suffixes');
    setActiveSuffix(null);
    setActiveSuffixDetails(null);
    setCurrentDeck([]);
  }, []);

 const handleSuffixSelect = useCallback((suffix: Suffix) => {
    if (!suffix) return;
    const filteredData = filterBySuffix(euskaraWords, suffix);
    initializeDeck(filteredData);
    setActiveSuffix(suffix);
    
    const details = SUFFIX_DETAILS_LIST.find(s => s.suffix === suffix);
    if (details) {
      setActiveSuffixDetails({ label: details.label, explanation: details.explanation });
    } else {
      setActiveSuffixDetails(null); 
    }
    setLearningMode('suffixes'); 
  }, [initializeDeck]);


  const handleBackToMainSelection = useCallback(() => {
    setLearningMode('selection');
    setActiveSuffix(null);
    setActiveSuffixDetails(null);
    setCurrentDeck([]);
  }, []);

  const handleBackToSuffixSelection = useCallback(() => {
    setActiveSuffix(null);
    setActiveSuffixDetails(null);
    setCurrentDeck([]);
    setLearningMode('suffixes'); 
  }, []);


  const handleNext = useCallback(() => {
    if (currentIndex < currentDeck.length - 1) {
      setShowAnswer(false); 
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, currentDeck.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setShowAnswer(false); 
      setCurrentIndex(prevIndex => prevIndex - 1); 
    }
  }, [currentIndex]);

  const handleToggleAnswer = useCallback(() => {
    setShowAnswer(prevShow => !prevShow);
  }, []);

  const handleOpenExplanationModal = useCallback((suffixLabel: string, explanationText: string) => {
      setExplanationModalContent({
        title: suffixLabel,
        text: explanationText
      });
      setIsExplanationModalOpen(true);
  }, []);

  const handleCloseExplanationModal = useCallback(() => {
    setIsExplanationModalOpen(false);
    setExplanationModalContent(null);
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
        <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white shadow-lg rounded-xl p-4 bg-black bg-opacity-20">
              Euskara Ikasteko Txartelak: Atzizkiak
            </h1>
            <p className="text-lg text-indigo-100 mt-3">Aukeratu atzizkia</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {SUFFIX_DETAILS_LIST.map(btn => (
            <div key={btn.suffix} className="flex flex-col items-center">
              <button
                onClick={() => handleSuffixSelect(btn.suffix)}
                className={`w-full py-3 px-6 ${btn.color} ${btn.textColor || 'text-white'} font-semibold rounded-lg shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 text-lg focus:outline-none focus:ring-2 ${btn.color.replace('bg-', 'ring-').replace('hover:', '')} focus:ring-opacity-75`}
                aria-label={`'${btn.label}' atzizkia hautatu`}
              >
                {btn.label}
              </button>
            </div>
          ))}
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
        {isExplanationModalOpen && explanationModalContent && (
          <ExplanationModal
            isOpen={isExplanationModalOpen}
            onClose={handleCloseExplanationModal}
            title={explanationModalContent.title}
            explanation={explanationModalContent.text}
          />
        )}
      </div>
    );
  }
  
  if (currentDeck.length === 0 && (learningMode !== 'suffixes' || activeSuffix)) { 
     let emptyMessage = "Sorta kargatzen...";
     let backButtonText = "Modu Hautaketara Itzuli";
     let backButtonAction = handleBackToMainSelection;

    if (learningMode === 'suffixes' && activeSuffix) {
      emptyMessage = `Ez da aurkitu "${activeSuffixDetails?.label || activeSuffix}" atzizkia duen hitzik.`;
      backButtonText = "Atzizki Hautaketara Itzuli";
      backButtonAction = handleBackToSuffixSelection;
    } else if (learningMode === 'words' || learningMode === 'verbs') {
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
  let backButtonLabel = "Modu Nagusira Itzuli";
  let backButtonAction = handleBackToMainSelection;


  if (learningMode === 'words') {
    modeTitle = 'Hitzak';
    modeSubtitle = 'Ikasi euskal hitzak erraz!';
  } else if (learningMode === 'verbs') {
    modeTitle = 'Aditzak';
    modeSubtitle = 'Menderatu euskal aditzak!';
  } else if (learningMode === 'suffixes' && activeSuffix && activeSuffixDetails) {
    modeTitle = `Atzizkiak: ${activeSuffixDetails.label}`;
    modeSubtitle = `"${activeSuffixDetails.label}" atzizkia duten hitzak lantzen.`;
    backButtonLabel = "Atzizki Hautaketara Itzuli";
    backButtonAction = handleBackToSuffixSelection;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8" role="application">
      <header className="mb-8 w-full max-w-3xl flex items-center justify-center px-2 sm:px-4">
        
        <div className="flex-grow text-center min-w-0">
          <div className="inline-flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white shadow-lg rounded-xl p-2 sm:p-3 bg-black bg-opacity-20">
              {modeTitle}
            </h1>
             <p className="text-base sm:text-lg text-indigo-100 mt-1 sm:mt-2">{modeSubtitle}</p>
          
            {learningMode === 'suffixes' && activeSuffix && activeSuffixDetails && (
              <div className="mt-2 sm:mt-4">
                <button
                  onClick={() => handleOpenExplanationModal(activeSuffixDetails.label, activeSuffixDetails.explanation)}
                  className="py-1.5 px-3 sm:py-2 sm:px-4 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-opacity-75 inline-flex items-center space-x-2 text-xs sm:text-sm"
                  aria-label={`${activeSuffixDetails.label} atzizkiaren azalpena ikusi`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  <span className="hidden sm:inline">{activeSuffixDetails.label} - </span>Azalpena
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="w-full flex flex-col items-center">
        {currentWordPair ? (
          <Flashcard
            key={currentWordPair.id} 
            wordPair={currentWordPair} 
            showAnswer={showAnswer}
            onCardClick={handleToggleAnswer} 
          />
        ) : (
          <div className="bg-white shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-lg min-h-[300px] flex flex-col items-center justify-center">
            <p className="text-xl text-slate-700">Sorta amaitu da. Bikain!</p>
          </div>
        )}
        {currentDeck.length > 0 && ( 
            <Controls
              onPrevious={handlePrevious}
              onNext={handleNext}
              canPrevious={currentIndex > 0}
              canNext={currentIndex < currentDeck.length - 1}
              currentCardNumber={currentDeck.length > 0 ? currentIndex + 1 : 0}
              totalCards={currentDeck.length}
            />
        )}
         {(learningMode === 'words' || learningMode === 'verbs' || (learningMode === 'suffixes' && activeSuffix)) && (
            <button
                onClick={backButtonAction}
                className="mt-6 py-3 px-8 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75"
                aria-label={backButtonLabel}
            >
                {backButtonLabel}
            </button>
        )}
      </main>

      <footer className="mt-12 text-center text-indigo-200 text-sm">
        <p>&copy; {new Date().getFullYear()} Euskaraz Ikasteko Tresnak. Ikasketa on!</p>
      </footer>
      {isExplanationModalOpen && explanationModalContent && (
          <ExplanationModal
            isOpen={isExplanationModalOpen}
            onClose={handleCloseExplanationModal}
            title={explanationModalContent.title}
            explanation={explanationModalContent.text}
          />
        )}
    </div>
  );
};

export default App;
