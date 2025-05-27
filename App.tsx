
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
* itsutasuna (ceguera) / *itsukeria* (obcecación)
* zikinkeria (suciedad, porquería)
* alferkeria (pereza, holgazanería)`;


interface SuffixDetail {
  value: Suffix;
  name: string;
  explanation: string;
  exampleWord?: string;
  exampleSentence?: string;
}

const SUFFIX_DETAILS_LIST: SuffixDetail[] = [
  { value: 'kor', name: '-kor', explanation: 'Joera edo zaletasuna adierazten du. Nolakotasuna adierazten duten izenondoak sortzeko erabiltzen da.\n\nAdibideak:\n* beldur*kor* (beldurtia)\n* gizalege*kor* (gizalegezkoa)\n* lagun*kor* (lagunkoia)\n* umore*kor* (umoretsua)', exampleWord: 'lagunkor', exampleSentence: 'Oso pertsona lagunkorra da.' },
  { value: 'pen', name: '-pen', explanation: 'Ekintza edo sentimendu baten ondorioa edo emaitza adierazten du. Aditzoinari gehitzen zaio izen abstraktuak sortzeko.\n\nAdibideak:\n* itxaro*pen* (itxarotearen ondorioa)\n* ikus*pen* (ikustearen ondorioa)\n* senti*pen* (sentitzearen ondorioa)\n* oroi*pen* (oroitzearen ondorioa)\n* gara*pen* (garatzearen ondorioa)', exampleWord: 'itxaropen', exampleSentence: 'Itxaropena da galtzen den azken gauza.' },
  { value: 'garri', name: '-garri', explanation: 'Zerbait eragiten edo sortzen duena, edo zerbaitetarako egokia dena adierazten du.\n\nAdibideak:\n* erabil*garri* (erabil daitekeena)\n* ikus*garri* (ikus daitekeena, ikustekoa)\n* ezin sinetsiz*garri* (sinestezina)\n* onar*garri* (onartzeko modukoa)', exampleWord: 'erabilgarri', exampleSentence: 'Tresna hau oso erabilgarria da.' },
  { value: 'keta', name: '-keta', explanation: 'Ekintza edo prozesu bat adierazten du, askotan modu intentsiboan edo errepikakorrean.\n\nAdibideak:\n* berri*keta* (berriketan aritzea)\n* azter*keta* (aztertzea)\n* hausnar*keta* (hausnartzea)\n* lehia*keta* (lehian aritzea)', exampleWord: 'azterketa', exampleSentence: 'Bihar azterketa garrantzitsu bat daukat.' },
  { value: 'ezin', name: '-ezin', explanation: 'Ezintasuna edo zerbait egiteko ezintasuna adierazten du. Askotan aditz-izenarekin batera erabiltzen da.\n\nAdibideak:\n* *ezin* etorri (etortzeko ezintasuna)\n* *ezin* egin (egiteko ezintasuna)\n* *ezin* sinetsi (sinesteko ezintasuna)\n* *ezin* ikusi (ikusteko ezintasuna)', exampleWord: 'ezin etorri', exampleSentence: 'Ezin etorri naiz bilerara.' },
  { value: 'keria', name: '-keria', explanation: KERIA_EXPLANATION, exampleWord: 'txatxarkeria', exampleSentence: 'Hori txatxarkeria hutsa da.' },
  { value: 'men', name: '-men', explanation: 'Ekintza baten ondorioa, emaitza edo horrekin lotutako kontzeptu abstraktua adierazten du.\n\nAdibideak:\n* agindu*men* (agintzeko ahalmena)\n* ezagu*men* (ezagutzeko gaitasuna)\n* uler*men* (ulertzeko gaitasuna)\n* eska*men* (eskatzea)', exampleWord: 'ulermen', exampleSentence: 'Testuaren ulermena zaila izan da.' },
  { value: 'aldi', name: '-aldi', explanation: 'Denbora-tartea edo gertaera bat adierazten du.\n\nAdibideak:\n* denbor*aldi* (denbora tartea)\n* gazt*aldi* (gaztaroa)\n* ekaitz*aldi* (ekaitz garaia)\n* goiz*aldi* (goizeko tartea)', exampleWord: 'denboraldi', exampleSentence: 'Denboraldi berria hasi da.' },
  { value: 'tegi', name: '-tegi', explanation: 'Lekua edo zerbait gordetzeko tokia adierazten du.\n\nAdibideak:\n* liburu*tegi* (liburuak gordetzeko tokia)\n* lan*tegi* (lan egiteko tokia)\n* abel*tegi* (abelgorriak gordetzeko tokia)\n* har*tegi* (harria ateratzeko tokia)', exampleWord: 'liburutegi', exampleSentence: 'Liburutegira joan naiz ikastera.' },
  { value: 'buru', name: '-buru', explanation: 'Joera, zaletasuna edo kualitate bat adierazten du, askotan pertsona bati lotuta.\n\nAdibideak:\n* lotsa*buru* (lotsatia)\n* harro*buru* (harroa)\n* lan*buru* (langilea)\n* buruargi (listo)', exampleWord: 'lotsaburu', exampleSentence: 'Oso lotsaburua da eta ez du hitz egiten.' },
  { value: 'erraz', name: '-erraz', explanation: 'Modua edo erraztasuna adierazten du. \'Erraz\' hitzarekin lotuta dago.\n\nAdibideak:\n* uler*erraz* (ulertzeko erraza)\n* eusk*erraz* (euskaraz erraz egiten duena)\n* jan*erraz* (jateko erraza)', exampleWord: 'ulererraz', exampleSentence: 'Liburu hau ulererraza da.' },
  { value: 'kuntza', name: '-kuntza', explanation: 'Ekintza, prozesua edo jarduera baten emaitza edo multzoa adierazten du. Izen abstraktuak sortzen ditu.\n\nAdibideak:\n* hez*kuntza* (heztearen ekintza)\n* sor*kuntza* (sortzearen ekintza)\n* iker*kuntza* (ikertzearen ekintza)', exampleWord: 'hezkuntza', exampleSentence: 'Hezkuntza funtsezkoa da gizartearentzat.' },
  { value: 'kizun', name: '-kizun', explanation: 'Egin behar den zerbait edo etorkizuneko ekintza bat adierazten du.\n\nAdibideak:\n* egin*kizun* (egitekoa)\n* ikus*kizun* (ikuskizuna)\n* galde*kizun* (galdera)', exampleWord: 'eginkizun', exampleSentence: 'Hainbat eginkizun ditut gaurko.' },
  { value: 'kide', name: '-kide', explanation: 'Parte-hartzea, kidetasuna edo talde berekoa izatea adierazten du.\n\nAdibideak:\n* lan*kide* (laneko laguna)\n* bidai*kide* (bidaia laguna)\n* ikas*kide* (ikasketetako laguna)', exampleWord: 'lankide', exampleSentence: 'Nire lankideak oso jatorrak dira.' },
  { value: 'bera', name: '-bera', explanation: 'Joera edo sentikortasuna adierazten du. \'Bera\' hitzak \'sentibera\' esan nahi du batzuetan.\n\nAdibideak:\n* lotsa*bera* (lotsatia)\n* min*bera* (erraz min hartzen duena)\n* maite*bera* (erraz maitemintzen dena)', exampleWord: 'lotsabera', exampleSentence: 'Oso lotsabera da jende aurrean.' },
  { value: 'aro', name: '-aro', explanation: 'Denbora-tarte, garai edo aro bat adierazten du.\n\nAdibideak:\n* haurtz*aro* (haurra izateko garaia)\n* gazt*aro* (gaztea izateko garaia)\n* ud*aro* (uda garaia)', exampleWord: 'haurtzaro', exampleSentence: 'Haurtzaro polita izan nuen.' },
  { value: 'kada', name: '-kada', explanation: 'Kolpea, ekintza edo kopuru bat adieraz dezake.\n\nAdibideak:\n* osti*kada* (ostiko baten kolpea)\n* besark*ada* (besarkada)\n* mil*aka* (milako kopurua)', exampleWord: 'ostikada', exampleSentence: 'Ostikada bat eman zion baloiari.' },
  { value: 'mendu', name: '-mendu', explanation: 'Ekintza baten emaitza, egoera edo prozesua adierazten du. Izen abstraktuak sortzeko erabiltzen da.\n\nAdibideak:\n* gara*mendu* (garatzea)\n* alda*mendu* (aldatzea)\n* senti*mendu* (sentitzea)', exampleWord: 'sentimendu', exampleSentence: 'Sentimendu sakonak adierazi zituen.' },
  { value: 'gune', name: '-gune', explanation: 'Lekua, tokia edo eremu bat adierazten du.\n\nAdibideak:\n* lan*gune* (lan egiteko tokia)\n* atseden*gune* (atseden hartzeko tokia)\n* bil*gune* (biltzeko tokia)', exampleWord: 'atsedengune', exampleSentence: 'Autobidean atsedengune bat dago.' },
  { value: 'tasun', name: '-tasun', explanation: 'Nolakotasuna, egoera edo kualitatea adierazten du. Izen abstraktuak sortzen ditu.\n\nAdibideak:\n* eder*tasun* (ederra izatea)\n* zorion*tasun* (zoriontsu izatea)\n* anai*tasun* (anaiarteko harremana)', exampleWord: 'edertasun', exampleSentence: 'Naturaren edertasunak liluratzen nau.' },
];


const App: React.FC = () => {
  const [learningMode, setLearningMode] = useState<LearningMode>('selection');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', explanation: '' });
  const [selectedSuffix, setSelectedSuffix] = useState<Suffix>(null);


  const currentWordList = useMemo(() => {
    if (learningMode === 'words') return euskaraWords;
    if (learningMode === 'verbs') return euskaraVerbs;
    if (learningMode === 'suffixes' && selectedSuffix) {
      const allWords = [...euskaraWords, ...euskaraVerbs];
      const uniqueWords = Array.from(new Map(allWords.map(item => [item.basque, item])).values());
      return filterBySuffix(uniqueWords, selectedSuffix);
    }
    return [];
  }, [learningMode, selectedSuffix]);

  const initializeCards = useCallback(() => {
    if (currentWordList.length > 0) {
      setShuffledWords(shuffleArray(currentWordList));
      setCurrentCardIndex(0);
      setShowAnswer(false);
    } else {
      setShuffledWords([]); 
      setCurrentCardIndex(0);
    }
  }, [currentWordList]);

  React.useEffect(() => {
    if (learningMode === 'suffixes' && !selectedSuffix) {
        setShuffledWords([]);
        setCurrentCardIndex(0);
    } else {
        initializeCards();
    }
  }, [learningMode, selectedSuffix, initializeCards]);


  const handleNextCard = () => {
    if (currentCardIndex < shuffledWords.length - 1) {
      setCurrentCardIndex(prevIndex => prevIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prevIndex => prevIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleCardClick = () => {
    if (shuffledWords.length > 0) {
      setShowAnswer(prevShow => !prevShow);
    }
  };

  const handleShowExplanation = (suffix: Suffix) => {
    const detail = SUFFIX_DETAILS_LIST.find(d => d.value === suffix);
    if (detail) {
      setModalContent({ title: detail.name, explanation: detail.explanation });
      setIsModalOpen(true);
    }
  };

  const handleSuffixSelection = (suffix: Suffix) => {
    setSelectedSuffix(suffix);
    // No need to setLearningMode here if it's already 'suffixes'
    // or if this function is only called when in 'suffixes' mode.
    // However, to be safe:
    if (learningMode !== 'suffixes') {
      setLearningMode('suffixes');
    }
  };
  

  const currentCard = shuffledWords[currentCardIndex];

  if (learningMode === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-bold mb-12 text-center text-indigo-300">Euskara Ikasteko Txartelak</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <button
            onClick={() => setLearningMode('words')}
            className="p-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xl text-2xl font-semibold transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50"
          >
            Hitz Orokorrak
          </button>
          <button
            onClick={() => setLearningMode('verbs')}
            className="p-8 bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xl text-2xl font-semibold transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50"
          >
            Aditzak
          </button>
          <button
            onClick={() => {
              setLearningMode('suffixes');
              setSelectedSuffix(SUFFIX_DETAILS_LIST[0]?.value || null); 
            }}
            className="p-8 bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xl text-2xl font-semibold transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-50"
          >
            Atzizkiak
          </button>
        </div>
      </div>
    );
  }

  const getSubtitle = () => {
    if (learningMode === 'words') return 'Landu euskal hiztegia!';
    if (learningMode === 'verbs') return 'Menderatu euskal aditzak!';
    if (learningMode === 'suffixes' && selectedSuffix) {
        const suffixName = SUFFIX_DETAILS_LIST.find(s => s.value === selectedSuffix)?.name || selectedSuffix;
        return `Ikasi "${suffixName}" atzizkiaren erabilera!`;
    }
    return 'Aukeratu ikasteko modua.';
  };


  return (
    <div className="min-h-screen text-white flex flex-col items-center p-4">
      <button
        onClick={() => setLearningMode('selection')}
        className="absolute top-6 left-6 py-2 px-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-75 z-10"
        aria-label="Modu hautapenera itzuli"
      >
        &larr; Itzuli
      </button>
      
      <div className="w-full flex-grow flex flex-col items-center justify-center">
        <div className="my-8 text-center">
          <div className="inline-block bg-purple-700 text-white px-8 py-4 rounded-xl shadow-lg mb-3">
            <h1 className="text-4xl md:text-5xl font-bold capitalize">
              {learningMode === 'words' ? 'Hitz Orokorrak' : learningMode === 'verbs' ? 'Aditzak' : selectedSuffix ? `${SUFFIX_DETAILS_LIST.find(s => s.value === selectedSuffix)?.name || selectedSuffix} Atzizkia` : 'Atzizkiak'}
            </h1>
          </div>
          <p className="text-lg text-purple-200">
            {getSubtitle()}
          </p>
        </div>
      
        {learningMode === 'suffixes' && (
          <div className="mb-6 max-w-md w-full">
            <label htmlFor="suffix-select" className="block text-sm font-medium text-purple-200 mb-1">
              Aukeratu atzizki bat:
            </label>
            <div className="flex items-center space-x-2">
              <select
                id="suffix-select"
                value={selectedSuffix || ''}
                onChange={(e) => handleSuffixSelection(e.target.value as Suffix)}
                className="block w-full pl-3 pr-10 py-2 text-base border-purple-500 bg-purple-700 text-white focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>-- Hautatu --</option>
                {SUFFIX_DETAILS_LIST.map(suffixDetail => (
                  <option key={suffixDetail.value} value={suffixDetail.value || ''}>
                    {suffixDetail.name}
                  </option>
                ))}
              </select>
              {selectedSuffix && SUFFIX_DETAILS_LIST.find(s => s.value === selectedSuffix)?.explanation && (
                <button
                  onClick={() => handleShowExplanation(selectedSuffix)}
                  className="p-2 bg-pink-600 hover:bg-pink-700 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label={`${selectedSuffix} atzizkiaren azalpena erakutsi`}
                >
                  Azalpena
                </button>
              )}
            </div>
          </div>
        )}

        {shuffledWords.length > 0 && currentCard ? (
          <Flashcard
            wordPair={currentCard}
            showAnswer={showAnswer}
            onCardClick={handleCardClick}
          />
        ) : (
          <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-lg min-h-[300px] flex flex-col items-center justify-center text-slate-700">
            <p className="text-xl">
              {learningMode === 'suffixes' && !selectedSuffix 
                  ? "Hautatu atzizki bat txartelak ikusteko."
                  : learningMode === 'suffixes' && currentWordList.length === 0
                  ? `Ez da aurkitu '${SUFFIX_DETAILS_LIST.find(s => s.value === selectedSuffix)?.name || selectedSuffix}' atzizkia duen hitzik.`
                  : "Ez dago hitzik erakusteko modu honetan."
              }
            </p>
          </div>
        )}

        {shuffledWords.length > 0 && (
          <Controls
            onPrevious={handlePreviousCard}
            onNext={handleNextCard}
            canPrevious={currentCardIndex > 0}
            canNext={currentCardIndex < shuffledWords.length - 1}
            currentCardNumber={currentCardIndex + 1}
            totalCards={shuffledWords.length}
          />
        )}
      </div>

      <footer className="text-center py-4 mt-auto w-full">
        <p className="text-sm text-purple-200">
          © 2025 Euskaraz Ikasteko Tresnak. Ikasketa on!
        </p>
      </footer>

      <ExplanationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        explanation={modalContent.explanation}
      />
    </div>
  );
};

export default App;