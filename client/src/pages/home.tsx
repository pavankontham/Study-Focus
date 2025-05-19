import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Pomodoro from "@/components/pomodoro";
import TaskManager from "@/components/task-manager";
import StudyCalendar from "@/components/study-calendar";
import Analytics from "@/components/analytics";
import Stopwatch from "@/components/stopwatch";
import TimerComponent from "@/components/timer";
import Notes from "@/components/notes";
import Resources from "@/components/resources";
import Goals from "@/components/goals";
import Settings from "@/components/settings";
import { safeLocalStorage } from "@/lib/local-storage";
import { AppSettings, AppTab, Task, Session, Goal, Note } from "@/types";
import { defaultAppSettings } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { 
  Clock, ClipboardList, Calendar, BarChart3,
  Timer, FileText, Bookmark, Target, Settings2, Maximize, Minimize, 
  X, Watch
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('pomodoro');
  const [tasks, setTasks] = useState<Task[]>(() => safeLocalStorage.getItem('tasks', []));
  const [sessions, setSessions] = useState<Session[]>(() => safeLocalStorage.getItem('sessions', []));
  const [goals, setGoals] = useState<Goal[]>(() => safeLocalStorage.getItem('studyGoals', []));
  const [notes, setNotes] = useState<Note>(() => safeLocalStorage.getItem('studyNotes', { content: '', lastEdited: new Date().toISOString() }));
  const [appSettings, setAppSettings] = useState<AppSettings>(() => safeLocalStorage.getItem('appSettings', defaultAppSettings));
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [focusMode, setFocusMode] = useState(false);
  const [version] = useState("2.0.0");
  
  useEffect(() => {
    safeLocalStorage.setItem('tasks', tasks);
  }, [tasks]);
  
  useEffect(() => {
    safeLocalStorage.setItem('sessions', sessions);
  }, [sessions]);
  
  useEffect(() => {
    safeLocalStorage.setItem('studyGoals', goals);
  }, [goals]);
  
  useEffect(() => {
    // Apply font size from settings
    document.documentElement.style.fontSize = `${appSettings.fontSize}px`;
    
    // Auto-export data every 5 minutes for backup
    const autoExportInterval = setInterval(() => {
      const appData = {
        tasks, sessions, goals, notes, appSettings,
        pomoSettings: safeLocalStorage.getItem('pomoSettings', {}),
      };
      safeLocalStorage.setItem('autoBackup', {
        data: appData,
        timestamp: new Date().toISOString()
      });
    }, 5 * 60 * 1000);
    
    return () => clearInterval(autoExportInterval);
  }, [tasks, sessions, goals, notes, appSettings]);
  
  const addSession = (session: Omit<Session, 'timestamp'>) => {
    setSessions(prev => [
      ...prev, 
      {
        ...session,
        timestamp: new Date().toISOString()
      }
    ]);
  };
  
  // Calculate stats for dashboard
  const totalStudyTime = sessions.reduce((total, session) => 
    total + (session.type === 'Work' ? session.duration : 0), 0) / 3600; // in hours
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  
  const tabData = [
    { id: 'pomodoro', label: 'Pomodoro', icon: <Clock size={18} /> },
    { id: 'stopwatch', label: 'Stopwatch', icon: <Clock size={18} /> },
    { id: 'timer', label: 'Timer', icon: <Clock size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList size={18} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'notes', label: 'Notes', icon: <FileText size={18} /> },
    { id: 'resources', label: 'Resources', icon: <Bookmark size={18} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings2 size={18} /> }
  ];
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {!focusMode && (
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md p-4 sticky top-0 z-10`}>
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Ultimate Study Focus Suite</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setFocusMode(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Maximize size={16} /> Focus Mode
              </Button>
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
          </div>
        </header>
      )}
      
      {focusMode ? (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button
            onClick={() => setFocusMode(false)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-gray-800/80 text-white border-gray-700 hover:bg-gray-700"
          >
            <Minimize size={16} /> Exit Focus
          </Button>
          <Button
            onClick={() => setActiveTab('pomodoro')}
            variant="outline"
            size="sm"
            className={`${activeTab === 'pomodoro' ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-white border-gray-700 hover:bg-gray-700'}`}
          >
            <Clock size={16} />
          </Button>
          <Button
            onClick={() => setActiveTab('tasks')}
            variant="outline"
            size="sm"
            className={`${activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-white border-gray-700 hover:bg-gray-700'}`}
          >
            <ClipboardList size={16} />
          </Button>
        </div>
      ) : (
        <>
          {/* Dashboard (non-focus mode) */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-blue-50/50'} py-6`}>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm flex items-center`}>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Total Study Time</h3>
                    <p className="text-2xl font-bold">{totalStudyTime.toFixed(1)} hrs</p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm flex items-center`}>
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Task Completion</h3>
                    <p className="text-2xl font-bold">{completedTasks}/{tasks.length} ({completionRate.toFixed(0)}%)</p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm flex items-center`}>
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Active Goals</h3>
                    <p className="text-2xl font-bold">{goals.filter(g => !g.completed).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="container mx-auto">
              <div className="flex overflow-x-auto hide-scrollbar">
                {tabData.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AppTab)}
                    className={`py-3 px-4 font-medium transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? darkMode
                          ? 'border-b-2 border-blue-500 text-blue-400'
                          : 'border-b-2 border-blue-500 text-blue-600'
                        : darkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </>
      )}
      
      <main className="container mx-auto pb-12 pt-6 px-4">
        {activeTab === 'pomodoro' && (
          <Pomodoro tasks={tasks} setTasks={setTasks} addSession={addSession} />
        )}
        {activeTab === 'stopwatch' && (
          <Stopwatch darkMode={darkMode} />
        )}
        {activeTab === 'timer' && (
          <TimerComponent darkMode={darkMode} />
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
        {activeTab === 'notes' && (
          <Notes darkMode={darkMode} />
        )}
        {activeTab === 'resources' && (
          <Resources darkMode={darkMode} />
        )}
        {activeTab === 'goals' && (
          <Goals darkMode={darkMode} />
        )}
        {activeTab === 'settings' && (
          <Settings darkMode={darkMode} settings={appSettings} setAppSettings={setAppSettings} />
        )}
      </main>
      
      {!focusMode && (
        <footer className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} p-4 text-center text-sm`}>
          <p>&copy; {new Date().getFullYear()} Ultimate Study Focus Suite v{version}. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}
