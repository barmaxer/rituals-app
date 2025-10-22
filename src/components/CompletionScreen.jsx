import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, RotateCcw } from 'lucide-react';

const CompletionScreen = ({ mode, onReset }) => {
  const msg = mode === 'morning'
    ? { title: "День начат!", subtitle: "Действуйте спокойно и с энергией." }
    : { title: "День завершён.", subtitle: "Время для полноценного отдыха." };

  return (
    <motion.div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10}}>
        <CheckCircle size={80} className="text-green-500 mb-4" />
      </motion.div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">{msg.title}</h1>
      <p className="text-gray-600 mb-8 text-lg">{msg.subtitle}</p>
      <motion.button onClick={onReset}
        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg flex items-center gap-3 text-lg"
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <RotateCcw size={24} />
        <span>Новый ритуал</span>
      </motion.button>
    </motion.div>
  );
};

export default CompletionScreen;
