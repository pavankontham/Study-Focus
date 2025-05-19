import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StopwatchProps {
  darkMode: boolean;
}

export default function Stopwatch({ darkMode }: StopwatchProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6">Stopwatch</h2>
        
        <div className="text-center mb-8">
          <div className="text-5xl sm:text-7xl font-mono font-bold mb-6">
            {formatTime(time)}
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleStartStop}
              className={`px-6 py-3 text-lg ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>
            
            <Button
              onClick={handleReset}
              className="px-6 py-3 text-lg bg-gray-500 hover:bg-gray-600"
              disabled={time === 0}
            >
              Reset
            </Button>
          </div>
        </div>
        
        <div className="text-center text-gray-500 dark:text-gray-400 italic">
          <p>Use the stopwatch for free-form timing of study sessions</p>
        </div>
      </div>
    </motion.div>
  );
}