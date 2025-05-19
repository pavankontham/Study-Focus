import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { motivationalQuotes } from "@/lib/constants";

interface FocusModeOverlayProps {
  showOverlay: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function FocusModeOverlay({ showOverlay, onClose, darkMode }: FocusModeOverlayProps) {
  const [quote, setQuote] = useState("");
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    if (showOverlay) {
      // Set a random motivational quote
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
      
      // Start the countdown
      setTimer(5);
      
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [showOverlay, onClose]);
  
  if (!showOverlay) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center text-white"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center px-6 max-w-2xl"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Entering Focus Mode</h2>
        
        <div className="text-xl sm:text-2xl italic mb-8 leading-relaxed">
          "{quote}"
        </div>
        
        <p className="text-lg opacity-70 mb-8">
          Eliminate distractions and focus on your goals. 
          <br />
          You can exit focus mode at any time.
        </p>
        
        <div className="text-lg">
          <span className="opacity-70">Starting in </span>
          <span className="font-bold">{timer}</span>
          <span className="opacity-70"> seconds...</span>
        </div>
        
        <button
          onClick={onClose}
          className="mt-8 px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
        >
          Skip
        </button>
      </motion.div>
    </motion.div>
  );
}