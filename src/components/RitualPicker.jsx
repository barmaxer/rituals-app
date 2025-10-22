import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const RitualPicker = ({ onStart }) => (
  <motion.div className="max-w-lg w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 text-center"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
    <motion.h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
      initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
      Ритуалы
    </motion.h1>
    <p className="text-gray-600 mb-10 text-lg">Структура для спокойного начала и завершения дня</p>
    <div className="space-y-5">
      <motion.button onClick={() => onStart('morning')}
        className="w-full bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 text-white font-semibold py-7 rounded-2xl shadow-xl flex items-center justify-center gap-4 text-xl relative overflow-hidden group"
        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(251, 146, 60, 0.4)" }} whileTap={{ scale: 0.98 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
        <Sun size={32} className="relative z-10" />
        <span className="relative z-10">Утренний ритуал</span>
      </motion.button>
      <motion.button onClick={() => onStart('evening')}
        className="w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 text-white font-semibold py-7 rounded-2xl shadow-xl flex items-center justify-center gap-4 text-xl relative overflow-hidden group"
        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }} whileTap={{ scale: 0.98 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
        <Moon size={32} className="relative z-10" />
        <span className="relative z-10">Вечерний ритуал</span>
      </motion.button>
      <motion.button onClick={() => onStart('sos')}
        className="w-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white py-6 rounded-2xl shadow-lg flex items-center justify-center gap-4 text-xl relative overflow-hidden group"
        whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59,130,246,0.4)' }} whileTap={{ scale: 0.98 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
        <span className="relative z-10">SOS 5 минут</span>
      </motion.button>
    </div>
    <motion.div className="mt-10 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-purple-100"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <p className="text-sm text-gray-700 leading-relaxed">
        💡 <span className="font-semibold">Приложение проведёт вас через каждый этап</span> с пояснениями и таймером.
      </p>
    </motion.div>
  </motion.div>
);

export default RitualPicker;