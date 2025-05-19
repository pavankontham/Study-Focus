import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { safeLocalStorage } from "@/lib/local-storage";
import { formatTime } from "@/lib/utils";
import { motivationalQuotes, soundOptions, ambientOptions } from "@/lib/constants";
import { Task, Session, PomodoroSettings } from "@/types";
import SettingsModal from "./settings-modal";
import { useDarkMode } from "@/hooks/use-dark-mode";

interface PomodoroProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addSession: (session: Omit<Session, "timestamp">) => void;
}

export default function Pomodoro({ tasks, setTasks, addSession }: PomodoroProps) {
  const [settings, setSettings] = useState<PomodoroSettings>(() =>
    safeLocalStorage.getItem('pomoSettings', { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 })
  );
  const [timeLeft, setTimeLeft] = useState(settings.work);
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState('Work');
  const [completedSessions, setCompletedSessions] = useState(
    parseInt(safeLocalStorage.getItem('completedSessions', 0)) || 0
  );
  const [longBreakCounter, setLongBreakCounter] = useState(0);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [soundEnabled, setSoundEnabled] = useState(safeLocalStorage.getItem('soundEnabled', true));
  const [selectedSound, setSelectedSound] = useState('alarm');
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customSound, setCustomSound] = useState<string | null>(null);
  const [quote, setQuote] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    safeLocalStorage.setItem('pomoSettings', settings);
    setTimeLeft(settings.work);
  }, [settings]);

  useEffect(() => {
    safeLocalStorage.setItem('completedSessions', completedSessions);
    if (completedSessions > 0) {
      addSession({ type: 'Work', duration: settings.work });
    }
  }, [completedSessions, addSession, settings.work]);

  useEffect(() => {
    safeLocalStorage.setItem('soundEnabled', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  useEffect(() => {
    if (!isRunning) {
      if (ambientRef.current) ambientRef.current.pause();
      return () => {};
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) {
          const isWork = session === 'Work';
          const newLongBreakCounter = isWork ? longBreakCounter + 1 : longBreakCounter;
          const newTime =
            isWork && newLongBreakCounter % 4 === 0
              ? settings.longBreak
              : isWork
              ? settings.shortBreak
              : settings.work;

          setSession(isWork ? (newLongBreakCounter % 4 === 0 ? 'Long Break' : 'Break') : 'Work');
          setLongBreakCounter(newLongBreakCounter);

          if (isWork) {
            setCompletedSessions((s) => s + 1);
            if (currentTask) {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === currentTask.id ? { ...t, sessions: (t.sessions || 0) + 1 } : t
                )
              );
            }
          } else {
            setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
          }
          
          if (audioRef.current && soundEnabled) {
            audioRef.current.play().catch(e => console.error("Audio play error:", e));
          }
          
          if (Notification.permission === 'granted' && soundEnabled) {
            new Notification(`${session} session ended!`);
          }
          
          return newTime;
        }
        return t - 1;
      });
    }, 1000);
    
    if (ambientSound && ambientRef.current) {
      ambientRef.current.loop = true;
      ambientRef.current.play().catch(e => console.error("Ambient audio play error:", e));
    }
    
    return () => {
      clearInterval(interval);
      if (ambientRef.current) ambientRef.current.pause();
    };
  }, [isRunning, session, longBreakCounter, soundEnabled, currentTask, settings, ambientSound, setTasks]);

  useEffect(() => {
    return () => {
      if (customSound) {
        URL.revokeObjectURL(customSound);
      }
    };
  }, [customSound]);

  const reset = () => {
    setTimeLeft(settings.work);
    setSession('Work');
    setCompletedSessions(0);
    setIsRunning(false);
    setLongBreakCounter(0);
    setCurrentTask(null);
    safeLocalStorage.setItem('completedSessions', 0);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (parseInt(value) > 0) {
      setSettings((prev) => ({ ...prev, [name]: parseInt(value) * 60 }));
    }
  };

  const handleCustomSound = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      if (customSound) {
        URL.revokeObjectURL(customSound);
      }
      const url = URL.createObjectURL(file);
      setCustomSound(url);
      setSelectedSound('custom');
    }
  };

  const allSoundOptions = {
    ...soundOptions,
    ...(customSound && { custom: customSound }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-4">Pomodoro Timer</h2>
        <div className="text-lg mb-2">Session: {session}</div>
        {currentTask && (
          <div className="text-md mb-2">
            Task: {currentTask.title}
            {currentTask.playlistUrl && (
              <button
                className="ml-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => window.open(currentTask.playlistUrl, '_blank')}
                aria-label="Play YouTube Playlist"
              >
                ▶ Playlist
              </button>
            )}
          </div>
        )}
        <div className="text-4xl sm:text-6xl font-mono mb-4">{formatTime(timeLeft)}</div>
        {quote && session !== 'Work' && (
          <div className="text-md italic mb-4">{quote}</div>
        )}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{
              width: `${
                (1 -
                  timeLeft /
                    (session === 'Work'
                      ? settings.work
                      : session === 'Long Break'
                      ? settings.longBreak
                      : settings.shortBreak)) *
                100
              }%`,
            }}
          ></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setIsRunning((p) => !p)}
            aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            className={`px-4 py-2 border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
            onClick={reset}
            aria-label="Reset Timer"
          >
            Reset
          </button>
          <button
            className={`px-4 py-2 border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
            onClick={() => setShowSettings(true)}
            aria-label="Open Settings"
          >
            Settings
          </button>
          <button
            className={`px-4 py-2 border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Select Task for This Session</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                className={`p-2 border rounded text-left ${
                  currentTask && currentTask.id === task.id
                    ? 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700'
                    : darkMode
                    ? 'border-gray-600 hover:bg-gray-700'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentTask(task)}
              >
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Sessions: {task.sessions || 0} • Priority: {task.priority}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <audio
        ref={audioRef}
        src={allSoundOptions[selectedSound]}
        preload="auto"
      />
      {ambientSound && (
        <audio
          ref={ambientRef}
          src={ambientOptions[ambientSound]}
          preload="auto"
        />
      )}
      
      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        darkMode={darkMode}
        setDarkMode={toggleDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        selectedSound={selectedSound}
        setSelectedSound={setSelectedSound}
        soundOptions={allSoundOptions}
        handleCustomSound={handleCustomSound}
        ambientSound={ambientSound}
        setAmbientSound={setAmbientSound}
        ambientOptions={ambientOptions}
        ambientVolume={ambientVolume}
        setAmbientVolume={setAmbientVolume}
      />
    </motion.div>
  );
}
