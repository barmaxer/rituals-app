import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RitualPicker from './components/RitualPicker.jsx';
import RitualPlayer from './components/RitualPlayer.jsx';

export default function App() {
  const [screen, setScreen] = useState('picker');
  const mode = screen === 'morning' || screen === 'evening' ? screen : null;

  const bg =
    screen === 'morning' ? 'from-amber-200 to-orange-300' :
    screen === 'evening' ? 'from-indigo-400 to-slate-800' :
    'from-indigo-100 via-purple-100 to-pink-100';

  return (
    <main className={`min-h-screen flex items-center justify-center p-4 transition-all duration-1000 bg-gradient-to-br ${bg}`}>
      <AnimatePresence mode="wait">
        {mode ? <RitualPlayer key={mode} mode={mode} onReset={() => setScreen('picker')} /> : <RitualPicker key="picker" onStart={setScreen} />}
      </AnimatePresence>
    </main>
  );
}
