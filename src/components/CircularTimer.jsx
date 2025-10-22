import React from 'react';
import { motion } from 'framer-motion';

const CircularTimer = ({ timeLeft, totalTime, isRunning }) => {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const prog = timeLeft / totalTime;
  const off = circ * (1 - prog);

  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} strokeWidth="10" stroke="currentColor" className="text-gray-200" fill="transparent" />
        <motion.circle cx="100" cy="100" r={r} strokeWidth="10" stroke="currentColor" className="text-purple-500" fill="transparent"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }} transition={{ duration: 1, ease: "linear" }}
        />
      </svg>
      <div className={`text-5xl font-bold transition-colors ${timeLeft <= 10 && isRunning ? 'text-red-500' : 'text-gray-800'}`}>
        {`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
      </div>
    </div>
  );
};

export default CircularTimer;
