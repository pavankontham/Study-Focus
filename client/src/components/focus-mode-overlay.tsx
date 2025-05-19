import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { motivationalQuotes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { XCircle, Mountain } from "lucide-react";

interface FocusModeOverlayProps {
  show: boolean;
  onClose: () => void;
  darkMode: boolean;
  backgroundStyle?: string;
  duration?: number; // Duration in seconds before auto-closing
}

export default function FocusModeOverlay({ 
  show, 
  onClose, 
  darkMode, 
  backgroundStyle = "none",
  duration = 5
}: FocusModeOverlayProps) {
  const [quote, setQuote] = useState("");
  const [countdown, setCountdown] = useState(duration);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (show) {
      // Set a random motivational quote
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
      
      // Reset countdown and progress
      setCountdown(duration);
      setProgress(0);
      
      // Start the countdown
      const intervalId = setInterval(() => {
        setCountdown((prev) => {
          const newValue = prev - 0.1;
          if (newValue <= 0) {
            clearInterval(intervalId);
            onClose();
            return 0;
          }
          return newValue;
        });
        
        setProgress((prev) => {
          const newValue = prev + (100 / (duration * 10));
          return newValue > 100 ? 100 : newValue;
        });
      }, 100);
      
      return () => clearInterval(intervalId);
    }
  }, [show, duration, onClose]);
  
  if (!show) return null;
  
  const overlayClasses = backgroundStyle !== "none" 
    ? `fixed inset-0 z-50 flex flex-col items-center justify-center text-white focus-mode ${backgroundStyle}` 
    : `fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center text-white`;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={overlayClasses}
    >
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <XCircle size={24} />
        </Button>
      </div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center px-6 max-w-2xl"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 gradient-text">Entering Focus Mode</h2>
        
        <div className="text-xl sm:text-2xl italic mb-10 leading-relaxed glass-card p-6 rounded-lg">
          "{quote}"
        </div>
        
        <p className="text-lg mb-8 text-white/80">
          Eliminate distractions and focus on your goals. 
          <br />
          You can exit focus mode at any time.
        </p>
        
        <div className="w-full max-w-md mx-auto mb-8">
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-white/60 mt-2 text-center">
            Starting in {Math.ceil(countdown)} seconds...
          </div>
        </div>
        
        <Button
          onClick={onClose}
          variant="outline"
          className="px-8 py-2 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
        >
          Skip
        </Button>
      </motion.div>
    </motion.div>
  );
}