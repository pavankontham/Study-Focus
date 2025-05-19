import { useState } from "react";
import { motion } from "framer-motion";
import { PomodoroSettings } from "@/types";

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  selectedSound: string;
  setSelectedSound: (value: string) => void;
  soundOptions: Record<string, string>;
  handleCustomSound: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ambientSound: string | null;
  setAmbientSound: (value: string | null) => void;
  ambientOptions: Record<string, string>;
  ambientVolume: number;
  setAmbientVolume: (value: number) => void;
}

export default function SettingsModal({
  show,
  onClose,
  settings,
  onSettingsChange,
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  selectedSound,
  setSelectedSound,
  soundOptions,
  handleCustomSound,
  ambientSound,
  setAmbientSound,
  ambientOptions,
  ambientVolume,
  setAmbientVolume,
}: SettingsModalProps) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg p-6 max-w-md w-full shadow-xl`}
      >
        <h3 className="text-xl font-bold mb-4">Timer Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Work Duration (minutes)</label>
            <input
              type="number"
              name="work"
              value={settings.work / 60}
              onChange={onSettingsChange}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              min="1"
            />
          </div>
          <div>
            <label className="block mb-1">Short Break (minutes)</label>
            <input
              type="number"
              name="shortBreak"
              value={settings.shortBreak / 60}
              onChange={onSettingsChange}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              min="1"
            />
          </div>
          <div>
            <label className="block mb-1">Long Break (minutes)</label>
            <input
              type="number"
              name="longBreak"
              value={settings.longBreak / 60}
              onChange={onSettingsChange}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              min="1"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="darkMode"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="mr-2"
            />
            <label htmlFor="darkMode">Dark Mode</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="soundEnabled"
              checked={soundEnabled}
              onChange={() => setSoundEnabled(!soundEnabled)}
              className="mr-2"
            />
            <label htmlFor="soundEnabled">Sound Notifications</label>
          </div>
          {soundEnabled && (
            <div>
              <label className="block mb-1">Notification Sound</label>
              <select
                value={selectedSound}
                onChange={(e) => setSelectedSound(e.target.value)}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="alarm">Alarm Clock</option>
                <option value="chime">Digital Chime</option>
                <option value="bell">Bell</option>
                {Object.keys(soundOptions).includes('custom') && (
                  <option value="custom">Custom Sound</option>
                )}
              </select>
              <div className="mt-2">
                <label className="block mb-1">Upload Custom Sound</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleCustomSound}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          )}
          <div>
            <label className="block mb-1">Ambient Sound</label>
            <select
              value={ambientSound || ''}
              onChange={(e) => setAmbientSound(e.target.value || null)}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value="">None</option>
              <option value="rain">Rain</option>
              <option value="coffee">Coffee Shop</option>
              <option value="whiteNoise">White Noise</option>
            </select>
            {ambientSound && (
              <div className="mt-2">
                <label className="block mb-1">Volume: {Math.round(ambientVolume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
