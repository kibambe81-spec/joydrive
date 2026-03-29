import { useCallback, useRef, useEffect, useState } from 'react';

type Language = 'en' | 'fr' | 'zu' | 'xh' | 'af';

interface VoiceMessage {
  en: string;
  fr: string;
  zu: string;
  xh: string;
  af: string;
}

const VOICE_MESSAGES: Record<string, VoiceMessage> = {
  driverFound: {
    en: 'Your driver has been found. They will arrive in approximately 5 minutes.',
    fr: 'Votre chauffeur a été trouvé. Il arrivera dans environ 5 minutes.',
    zu: 'Umshayeli wakho utholakele. Uzofika ngaphakathi kokuphakamisa iminithi engu-5.',
    xh: 'Umshayeli wakho ufunyanwe. Uya kufika kumzuzu omncinane omalunga ne-5.',
    af: 'Jou bestuurder is gevind. Hulle sal in ongeveer 5 minute aankom.'
  },
  driverArrived: {
    en: 'Your driver has arrived. Please come out now.',
    fr: 'Votre chauffeur est arrivé. Veuillez sortir maintenant.',
    zu: 'Umshayeli wakho ufikilile. Ngiyacela uphume manje.',
    xh: 'Umshayeli wakho ufikilile. Nceda uphume ngoku.',
    af: 'Jou bestuurder het aankom. Asseblief kom nou uit.'
  },
  destinationReached: {
    en: 'You have reached your destination. Thank you for using JoyDrive.',
    fr: 'Vous avez atteint votre destination. Merci d\'avoir utilisé JoyDrive.',
    zu: 'Ufikilile endaweni yakho. Ngiyabonga ngokusebenzisa i-JoyDrive.',
    xh: 'Ufikilile endaweni yakho. Enkosi kokusetyenzisa i-JoyDrive.',
    af: 'Jy het jou bestemming bereik. Dankie dat jy JoyDrive gebruik het.'
  },
  turnLeft: {
    en: 'Turn left ahead',
    fr: 'Tournez à gauche',
    zu: 'Vuma ngakwesokunxele',
    xh: 'Vuma ngakwesokunxele',
    af: 'Draai links'
  },
  turnRight: {
    en: 'Turn right ahead',
    fr: 'Tournez à droite',
    zu: 'Vuma ngakwesokudla',
    xh: 'Vuma ngakwesokudla',
    af: 'Draai regs'
  },
  goStraight: {
    en: 'Continue straight ahead',
    fr: 'Continuez tout droit',
    zu: 'Qhubeka ngqo',
    xh: 'Qhubeka ngqo',
    af: 'Gaan reguit voort'
  },
  emergencyAlert: {
    en: 'Emergency alert activated. Help is on the way.',
    fr: 'Alerte d\'urgence activée. De l\'aide arrive.',
    zu: 'Isiliso sokuthutha sikhuliswe. Usizo luyeza.',
    xh: 'Isiliso sokuthutha sikhuliswe. Usizo luyeza.',
    af: 'Noodtoestand geaktiveer. Hulp is onderweg.'
  }
};

export const useVoiceNavigation = (language: Language = 'en') => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const lastSpokenRef = useRef<string>('');

  // Charger les voix disponibles
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Obtenir la meilleure voix féminine pour la langue
  const getFemaleVoice = useCallback((lang: Language): SpeechSynthesisVoice | null => {
    const languageMap: Record<Language, string[]> = {
      en: ['en-US', 'en-GB', 'en-AU', 'en'],
      fr: ['fr-FR', 'fr-CA', 'fr'],
      zu: ['zu-ZA', 'zu'],
      xh: ['xh-ZA', 'xh'],
      af: ['af-ZA', 'af']
    };

    const langCodes = languageMap[lang];
    const femaleKeywords = ['female', 'femme', 'amélie', 'alice', 'marie', 'sophie', 'google français', 'google french', 'samantha', 'karen', 'victoria', 'fiona', 'moira', 'veena', 'zira', 'hazel'];
    
    // Chercher une voix féminine explicite
    for (const code of langCodes) {
      const femaleVoice = availableVoices.find(
        voice => voice.lang.toLowerCase().startsWith(code) && 
                 femaleKeywords.some(k => voice.name.toLowerCase().includes(k))
      );
      if (femaleVoice) return femaleVoice;
    }

    // Si pas de voix féminine explicite, prendre la première voix de la langue
    for (const code of langCodes) {
      const voice = availableVoices.find(voice => voice.lang.toLowerCase().startsWith(code));
      if (voice) return voice;
    }

    // Fallback sur la première voix disponible
    return availableVoices.length > 0 ? availableVoices[0] : null;
  }, [availableVoices]);

  // Parler un message
  const speak = useCallback((messageKey: keyof typeof VOICE_MESSAGES, lang: Language = language, force: boolean = false) => {
    const message = VOICE_MESSAGES[messageKey][lang];
    if (!message) return;

    // Éviter de répéter le même message
    if (!force && lastSpokenRef.current === message) return;
    lastSpokenRef.current = message;

    // Arrêter la parole précédente
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    const voice = getFemaleVoice(lang);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.lang = lang === 'en' ? 'en-US' : 
                     lang === 'fr' ? 'fr-FR' :
                     lang === 'zu' ? 'zu-ZA' :
                     lang === 'xh' ? 'xh-ZA' :
                     'af-ZA';
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  }, [language, getFemaleVoice]);

  // Parler une instruction de navigation
  const speakDirection = useCallback((direction: 'left' | 'right' | 'straight', lang: Language = language) => {
    const messageKey = direction === 'left' ? 'turnLeft' : 
                       direction === 'right' ? 'turnRight' : 
                       'goStraight';
    speak(messageKey as keyof typeof VOICE_MESSAGES, lang, true);
  }, [speak, language]);

  // Annoncer l'arrivée du chauffeur
  const announceDriverFound = useCallback((driverName: string = '', lang: Language = language) => {
    speak('driverFound', lang, true);
  }, [speak, language]);

  // Annoncer que le chauffeur est arrivé
  const announceDriverArrived = useCallback((lang: Language = language) => {
    speak('driverArrived', lang, true);
  }, [speak, language]);

  // Annoncer l'arrivée à la destination
  const announceArrival = useCallback((lang: Language = language) => {
    speak('destinationReached', lang, true);
  }, [speak, language]);

  // Annoncer une alerte d'urgence
  const announceEmergency = useCallback((lang: Language = language) => {
    speak('emergencyAlert', lang, true);
  }, [speak, language]);

  // Arrêter la parole
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    speakDirection,
    announceDriverFound,
    announceDriverArrived,
    announceArrival,
    announceEmergency,
    stop,
    isSpeaking,
    availableVoices
  };
};
