import { useState, useCallback, useEffect, useRef } from 'react';

// VITE_TTS_PROVIDER: 'webspeech' | 'eleven' (см. блок B)
const PROVIDER = import.meta.env.VITE_TTS_PROVIDER || 'webspeech';

export const useSpeech = () => {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const [voices, setVoices] = useState([]);
  const [ready, setReady] = useState(false);
  const ttsAudioRef = useRef(null); // для внешнего mp3

  const loadVoices = useCallback(() => {
    if (!synth) return;
    const v = synth.getVoices();
    if (v?.length) {
      // упорядочим: приоритет лучших RU-голосов
      const score = (name) => {
        const n = (name || '').toLowerCase();
        if (n.includes('google рус') || n.includes('google russian')) return 100;
        if (n.includes('milena') || n.includes('yandex')) return 95;
        if (n.includes('tatiana') || n.includes('tatyana')) return 90;
        if (n.includes('irina')) return 85;
        if (n.includes('zira') || n.includes('oksana')) return 80;
        return 10;
      };
      v.sort((a,b) => (b.lang.startsWith('ru') - a.lang.startsWith('ru')) || (score(b.name)-score(a.name)));
      setVoices(v);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, [loadVoices]);

  useEffect(() => {
    const t = setTimeout(loadVoices, 400);
    return () => clearTimeout(t);
  }, [loadVoices]);

  // Унифицированный speak: возвращает Promise, чтобы можно было «даунмиксить» музыку до конца фразы
  const speak = useCallback((text, enabled=true) => {
    if (!enabled || !text) return Promise.resolve();
    if (PROVIDER !== 'webspeech') return Promise.resolve(); // переопределим в блоке B
    if (!ready || !synth) return Promise.resolve();
    return new Promise((res) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ru-RU";
      utter.rate = 0.95;     // чуть мягче и понятнее
      utter.pitch = 1.0;     // нейтральный тембр
      const v = voices.find(x => x.lang?.startsWith("ru")) || voices[0];
      if (v) utter.voice = v;
      utter.onend = res;
      synth.cancel();
      synth.speak(utter);
    });
  }, [ready, voices, synth]);

  return speak;
};
