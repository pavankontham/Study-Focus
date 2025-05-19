import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Pomodoro from "@/components/pomodoro";
import TaskManager from "@/components/task-manager";
import StudyCalendar from "@/components/study-calendar";
import Analytics from "@/components/analytics";
import { safeLocalStorage } from "@/lib/local-storage";
import { Task, Session } from "@/types";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'tasks' | 'calendar' | 'analytics'>('pomodoro');
  const [tasks, setTasks] = useState<Task[]>(() => safeLocalStorage.getItem('tasks', []));
  const [sessions, setSessions] = useState<Session[]>(() => safeLocalStorage.getItem('sessions', []));
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  useEffect(() => {
    safeLocalStorage.setItem('tasks', tasks);
  }, [tasks]);
  
  useEffect(() => {
    safeLocalStorage.setItem('sessions', sessions);
  }, [sessions]);
  
  const addSession = (session: Omit<Session, 'timestamp'>) => {
    setSessions(prev => [
      ...prev, 
      {
        ...session,
        timestamp: new Date().toISOString()
      }
    ]);
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md p-4 sticky top-0 z-10`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Ultimate Study Focus Suite</h1>
          <Button
            onClick={toggleDarkMode}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </Button>
        </div>
      </header>
      
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
        <div className="container mx-auto">
          <div className="flex overflow-x-auto hide-scrollbar">
            {[
              { id: 'pomodoro', label: 'Pomodoro' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'calendar', label: 'Calendar' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'border-b-2 border-blue-500 text-blue-600'
                    : darkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto pb-12">
        {activeTab === 'pomodoro' && (
          <Pomodoro tasks={tasks} setTasks={setTasks} addSession={addSession} />
        )}
        {activeTab === 'tasks' && (
          <TaskManager tasks={tasks} setTasks={setTasks} darkMode={darkMode} />
        )}
        {activeTab === 'calendar' && (
          <StudyCalendar tasks={tasks} sessions={sessions} darkMode={darkMode} />
        )}
        {activeTab === 'analytics' && (
          <Analytics tasks={tasks} sessions={sessions} darkMode={darkMode} />
        )}
      </main>
      
      <footer className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} p-4 text-center text-sm`}>
        <p>&copy; {new Date().getFullYear()} Ultimate Study Focus Suite. All rights reserved.</p>
      </footer>
    </div>
  );
}
