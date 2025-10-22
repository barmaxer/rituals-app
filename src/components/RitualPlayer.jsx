import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw, Sun, Moon, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { morningRitualData, eveningRitualData, sosRitualData } from './data.js';
import { useSpeech } from './useSpeech.jsx';
import { useAudio } from './useAudio.jsx';
import CircularTimer from './CircularTimer.jsx';
import CompletionScreen from './CompletionScreen.jsx';

const RitualPlayer = ({ mode, onReset }) => {
  const ritual = mode === 'morning' ? morningRitualData : (mode === 'evening' ? eveningRitualData : sosRitualData);
  const speak = useSpeech();
  const { playSound, bgRef, setBg, musicOn, setMusicOn, unlock, unlocked, duck } = useAudio();

  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ritual[0].time);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [voice, setVoice] = useState(true);
  const [showDesc, setShowDesc] = useState(false);
  const [vol, setVol] = useState(0.15);

  const tickRef = useRef(null);
  const endAtRef = useRef(null);
  const wakeLockRef = useRef(null);


  // сохранение состояния
  useEffect(() => {
    try { localStorage.setItem('ritual_state_v1', JSON.stringify({ mode, step, timeLeft, voice, vol, finished })); } catch {}
  }, [mode, step, timeLeft, voice, vol, finished]);

  // разблокировка звука (без autoplay)
  const tryUnlockAudio = useCallback(() => { unlock(); }, [unlock]);

  // загрузка сохранённого состояния
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ritual_state_v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.mode === mode) { setStep(s.step ?? 0); setTimeLeft(s.timeLeft ?? ritual[0].time); setVoice(s.voice ?? true); setVol(s.vol ?? 0.15); }
      }
    } catch {}
    const first = ritual[0];
    setTimeout(() => speak(`Начинаем ${mode === 'morning' ? 'утренний' : (mode === 'evening' ? 'вечерний' : 'экспресс')} ритуал. Первый этап: ${first.action}.`, voice), 500);
    // фон под первый шаг
    const bg = first?.bg || 'ambient';
    setBg(bg);
  }, [mode]);

  // таймер без дрейфа + wake lock
  useEffect(() => {
    if (!running) return;
    const now = performance.now();
    endAtRef.current = now + timeLeft * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endAtRef.current - performance.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        setRunning(false); speakWithDucking('Время вышло.'); playSound('time_up'); next(true); releaseWake(); return;
      }
      tickRef.current = setTimeout(tick, 250);
    };
    tickRef.current = setTimeout(tick, 250);
    acquireWake();
    return () => clearTimeout(tickRef.current);
  }, [running, step]);

  // хоткеи
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setRunning(r => !r); }
      if (e.key?.toLowerCase() === 'n') next(false);
      if (e.key?.toLowerCase() === 's') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const acquireWake = async () => { try { wakeLockRef.current = await navigator.wakeLock?.request('screen'); } catch {} };
  const releaseWake = () => { try { wakeLockRef.current?.release?.(); } catch {} };

  // ducking для TTS
  const speakWithDucking = useCallback(async (text) => {
    if (!text) return;
    duck(true);
    try { await speak(text, voice); } finally { duck(false); }
  }, [speak, voice, duck]);

  const next = (auto = false) => {
    if (!auto) {
      speakWithDucking("Отлично!");
      playSound('complete');
    }

    if (step < ritual.length - 1) {
      const ns = step + 1;
      setStep(ns);
      setTimeLeft(ritual[ns].time);
      setRunning(false);
      setShowDesc(false);
      setTimeout(() => speakWithDucking(`Следующий этап: ${ritual[ns].action}.`), 400);
      // переключаем фон по следующему шагу
      const bg = ritual[ns]?.bg || 'ambient';
      setBg(bg);
    } else {
      finish();
    }
  };

  const skip = () => {
    playSound('skip');
    speakWithDucking("Пропущен.");

    if (step < ritual.length - 1) {
      const ns = step + 1;
      setStep(ns);
      setTimeLeft(ritual[ns].time);
      setRunning(false);
      setShowDesc(false);
      setTimeout(() => speakWithDucking(`Следующий этап: ${ritual[ns].action}.`), 400);
      // переключаем фон по следующему шагу
      const bg = ritual[ns]?.bg || 'ambient';
      setBg(bg);
    } else {
      finish();
    }
  };

  const finish = () => {
    setFinished(true);
    const anchor = mode === 'morning' ? 'День начался — действую спокойно и с энергией' : (mode === 'evening' ? 'День завершён.' : 'Экспресс завершён.');
    speakWithDucking(`Ритуал завершён. ${anchor}`);
    playSound('finish');
  };

  if (finished) return <CompletionScreen mode={mode} onReset={onReset} />;

  const curr = ritual[step];
  const prog = ((step + 1) / ritual.length) * 100;

  return (
    <div className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden relative">
        <audio ref={bgRef} loop playsInline muted={false} />
        {!unlocked && (
          <div
            className="p-3 bg-amber-50 text-amber-800 text-sm flex items-center justify-between rounded-xl m-2 shadow z-50 pointer-events-auto"
            style={{position:'absolute', top:0, left:0, right:0}}
          >
            <span>🔊 Нажмите, чтобы включить музыку и голос.</span>
            <button
              type="button"
              onClick={tryUnlockAudio}
              className="ml-2 px-3 py-1 rounded-lg bg-amber-600 text-white"
              style={{pointerEvents:'auto'}}
            >
              Включить звук
            </button>
          </div>
        )}

        <div className={`p-6 ${mode === 'morning' ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600'} text-white relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-white/20 to-transparent pointer-events-none z-0" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              {mode === 'morning' ? <Sun size={32} /> : <Moon size={32} />}
              <h2 className="text-2xl font-bold">{mode === 'morning' ? 'Утренний ритуал' : (mode === 'evening' ? 'Вечерний ритуал' : 'SOS ритуал')}</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Отдельные, подписанные тумблеры — чтобы не путать */}
              <motion.button
                type="button" title="Озвучка шагов"
                onClick={() => setVoice(!voice)}
                className="px-3 py-2 rounded-xl bg-white/70 hover:bg-white text-gray-700 flex items-center gap-2"
                whileTap={{ scale: 0.9 }}
              >
                {voice ? <Volume2 size={18}/> : <VolumeX size={18}/> }
                <span>Голос</span>
              </motion.button>
              <motion.button
                type="button" title="Фоновая музыка"
                onClick={() => setMusicOn(v => !v)}
                className="px-3 py-2 rounded-xl bg-white/70 hover:bg-white text-gray-700 flex items-center gap-2"
                whileTap={{ scale: 0.9 }}
              >
                {musicOn ? <Volume2 size={18}/> : <VolumeX size={18}/> }
                <span>Музыка</span>
              </motion.button>
              <motion.button
                type="button"
                title="Сбросить ритуал"
                onClick={() => {
                  if (window.confirm('Сбросить ритуал и начать заново?')) onReset();
                }}
                className="hover:bg-white/20 p-2 rounded-lg transition"
                whileTap={{ scale: 0.9 }}
              >
                <RotateCcw size={22} />
              </motion.button>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2 text-sm font-medium">
              <span>Этап {step + 1} из {ritual.length}</span>
              <span>{Math.round(prog)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2.5">
              <motion.div className="bg-white h-2.5 rounded-full shadow-lg"
                initial={{width:0}} animate={{width: `${prog}%`}} transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col items-center">
            <AnimatePresence mode="wait">
                <motion.div key={step} className="text-center mb-6 w-full"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{duration: 0.5}}>
                    <motion.div className="text-6xl mb-4"
                      initial={{ scale: 0.8, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }}>
                      {curr.icon}
                    </motion.div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{curr.action}</h3>
                    <p className="text-lg text-gray-600 mb-3">{curr.goal}</p>

                    <motion.button onClick={() => setShowDesc(!showDesc)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium underline" whileTap={{ scale: 0.95 }}>
                      {showDesc ? "Скрыть" : "Зачем это нужно?"}
                    </motion.button>

                    <AnimatePresence>
                      {showDesc && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-4 bg-purple-50 rounded-xl text-left overflow-hidden">
                          <p className="text-sm text-gray-700 leading-relaxed">💡 {curr.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>

            <CircularTimer timeLeft={timeLeft} totalTime={curr.time} isRunning={running} />

            <div className="flex gap-4 items-center justify-center my-6">
                 <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => setRunning(!running)}
                    className={`w-20 h-20 rounded-full text-white shadow-xl flex items-center justify-center
                    ${running ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 'bg-gradient-to-br from-green-400 to-green-500'}`}>
                    {running ? <Pause size={32} /> : <Play size={32} />}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => next(false)}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-xl flex items-center justify-center">
                    <CheckCircle size={32} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={skip}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-xl flex items-center justify-center">
                    <SkipForward size={32} />
                </motion.button>
            </div>

            <div className="w-full max-w-md space-y-3">
              {!voice && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-amber-50 rounded-xl text-center">
                  <p className="text-xs text-amber-700">🔇 Голос выключен. Следуйте за текстом.</p>
                </motion.div>
              )}
            </div>
        </div>
    </div>
  );
};

export default RitualPlayer;
