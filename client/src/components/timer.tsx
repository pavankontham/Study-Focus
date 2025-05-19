import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TimerProps {
  darkMode: boolean;
}

export default function Timer({ darkMode }: TimerProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (Notification.permission === 'granted') {
            new Notification('Timer Complete!', {
              body: 'Your timer has finished.',
              icon: '/favicon.ico'
            });
          }
          try {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
            audio.play();
          } catch (err) {
            console.error('Error playing audio:', err);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const validateAndStart = () => {
    setError("");
    
    const h = hours ? parseInt(hours) : 0;
    const m = minutes ? parseInt(minutes) : 0;
    const s = seconds ? parseInt(seconds) : 0;
    
    if (isNaN(h) || isNaN(m) || isNaN(s)) {
      setError("Please enter valid numbers");
      return;
    }
    
    if (h < 0 || h > 99 || m < 0 || m >= 60 || s < 0 || s >= 60) {
      setError("Invalid time format: Hours (0-99), Minutes & Seconds (0-59)");
      return;
    }
    
    const total = h * 3600 + m * 60 + s;
    
    if (total <= 0) {
      setError("Please enter a time greater than zero");
      return;
    }
    
    setTotalSeconds(total);
    setTimeLeft(total);
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setHours("");
    setMinutes("");
    setSeconds("");
    setTimeLeft(0);
    setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6">Countdown Timer</h2>
        
        {!isRunning ? (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium">Hours</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="0"
                  max="99"
                  className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium">Minutes</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  min="0"
                  max="59"
                  className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium">Seconds</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  min="0"
                  max="59"
                  className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 mb-4">{error}</div>
            )}
            
            <Button 
              onClick={validateAndStart}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600"
            >
              Start Timer
            </Button>
          </div>
        ) : (
          <div className="text-center mb-6">
            <div className="text-5xl sm:text-7xl font-mono font-bold mb-6">
              {formatTime(timeLeft)}
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(timeLeft / totalSeconds) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setIsRunning(false)} 
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600"
              >
                Pause
              </Button>
              <Button 
                onClick={resetTimer} 
                className="px-6 py-2 bg-red-500 hover:bg-red-600"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center text-gray-500 dark:text-gray-400 italic">
          <p>Set a countdown timer for focused study sessions</p>
        </div>
      </div>
    </motion.div>
  );
}