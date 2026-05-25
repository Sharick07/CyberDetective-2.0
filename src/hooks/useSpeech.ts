import React, { useEffect } from 'react';

/**
 * Hook de síntesis de voz (Web Speech API).
 * Encapsula la lógica de carga de voces, selección por género
 * y exposición de funciones para narrar texto del sistema o del detective Alex.
 */
export const useSpeech = (
  isMutedRef: React.MutableRefObject<boolean>,
  isVoiceEnabledRef: React.MutableRefObject<boolean>,
) => {
  const voicesRef = React.useRef<SpeechSynthesisVoice[]>([]);
  const voicesLoadedRef = React.useRef(false);

  // Carga las voces disponibles y reintenta hasta que estén listas
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        voicesRef.current = available;
        voicesLoadedRef.current = true;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const retryInterval = setInterval(() => {
      if (!voicesLoadedRef.current) loadVoices();
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(retryInterval);
      if (!voicesLoadedRef.current) voicesLoadedRef.current = true;
    }, 3000);

    return () => {
      clearInterval(retryInterval);
      clearTimeout(timeout);
    };
  }, []);

  // Busca la voz más adecuada según el género solicitado
  const findVoice = (gender: 'male' | 'female'): SpeechSynthesisVoice | undefined => {
    const currentVoices =
      voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
    if (currentVoices.length === 0) return undefined;

    const malePatterns   = [/male/i, /masculino/i, /hombre/i, /david/i, /juan/i, /jorge/i, /alex/i, /carlos/i, /miguel/i];
    const femalePatterns = [/female/i, /femenino/i, /mujer/i, /sofia/i, /laura/i, /maria/i, /ana/i, /verónica/i, /martina/i];
    const patterns = gender === 'male' ? malePatterns : femalePatterns;

    const matches = currentVoices.filter(v => patterns.some(rx => rx.test(v.name)));
    if (matches.length > 0) return matches.find(v => v.localService) || matches[0];

    const sameLang = currentVoices.filter(v => v.lang.startsWith('es'));
    if (sameLang.length > 0) return sameLang.find(v => v.localService) || sameLang[0];

    return currentVoices.find(v => v.localService) || currentVoices[0];
  };

  const speakWithVoice = (text: string, gender: 'male' | 'female'): void => {
    if (!voicesLoadedRef.current) {
      setTimeout(() => speakWithVoice(text, gender), 200);
      return;
    }
    if (isMutedRef.current || !isVoiceEnabledRef.current) return;
    if (!('speechSynthesis' in window) || !text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = findVoice(gender);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'es-ES';
    }
    utterance.rate   = 0.85;
    utterance.pitch  = gender === 'male' ? 0.85 : 0.95;
    utterance.volume = 0.95;
    utterance.onerror = (e) => console.error(`[SPEECH ERROR] ${e.error}`);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('[SPEECH] Exception:', e);
    }
  };

  const speakSystem = (text: string) => speakWithVoice(text, 'female');
  const speakAlex   = (text: string) => speakWithVoice(text, 'male');
  const stopSpeech  = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  return { speakSystem, speakAlex, stopSpeech };
};
