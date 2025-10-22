import { useEffect, useRef, useState } from 'react';

// три плейлиста (можешь заменить src на свои файлы в /public)
const TRACKS = {
  ambient: [
    '/audio/ambient1.mp3',
    '/audio/ambient2.mp3',
  ],
  lofi: [
    '/audio/lofi1.mp3',
    '/audio/lofi2.mp3',
  ],
};

export const useAudio = () => {
  const bgRef = useRef(null);
  const [musicOn, setMusicOn] = useState(() => (localStorage.getItem('music_on') ?? '0') === '1');
  const [unlocked, setUnlocked] = useState(false);
  const [currentList, setCurrentList] = useState('ambient');
  const [idx, setIdx] = useState(0);

  useEffect(() => { localStorage.setItem('music_on', musicOn ? '1' : '0'); }, [musicOn]);
  useEffect(() => { if (bgRef.current) bgRef.current.volume = 0.15; }, []);

  // ВАЖНО: вызывать прямо в onClick, без await/async
  const unlock = () => {
    const el = bgRef.current;
    if (!el) return;
    // если нет src — поставим дефолт
    if (!el.src) el.src = (TRACKS.ambient[0]);
    const p = el.play();
    if (p && typeof p.then === 'function') {
      p.then(() => setUnlocked(true)).catch(() => {
        // Подсказка: снимите беззвучный режим / разрешите звук в браузере
      });
    } else {
      setUnlocked(true);
    }
  };

  const setBg = async (kind) => {
    if (!bgRef.current) return;
    if (!musicOn || !unlocked || !kind || kind === 'none') {
      bgRef.current.pause();
      return;
    }
    const list = TRACKS[kind] || TRACKS.ambient;
    setCurrentList(kind);
    const next = list[idx % list.length];
    if (bgRef.current.src !== window.location.origin + next) {
      bgRef.current.src = next;
    }
    try { await bgRef.current.play(); } catch {}
  };

  const nextTrack = async () => {
    const list = TRACKS[currentList] || [];
    setIdx(i => (i + 1) % Math.max(1, list.length));
    await setBg(currentList);
  };

  // дакинг интерфейс
  const duck = (on) => {
    if (!bgRef.current) return;
    bgRef.current.volume = on ? 0.07 : 0.15;
  };

  const playSound = (/*type*/) => { /* sfx при желании */ };

  return { bgRef, setBg, musicOn, setMusicOn, unlock, unlocked, nextTrack, duck, playSound };
};
