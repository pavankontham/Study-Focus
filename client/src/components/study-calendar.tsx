import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Task, Session } from "@/types";

interface StudyCalendarProps {
  tasks: Task[];
  sessions: Session[];
  darkMode: boolean;
}

declare global {
  interface Window {
    FullCalendar: any;
  }
}

export default function StudyCalendar({ tasks, sessions, darkMode }: StudyCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!calendarRef.current || !window.FullCalendar) return;
    
    const calendarEl = calendarRef.current;
    
    // Convert tasks to calendar events
    const taskEvents = tasks
      .filter(task => task.deadline) // Filter out tasks without deadlines
      .map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        start: task.deadline,
        allDay: true,
        backgroundColor: task.completed ? '#10B981' : 
                      task.priority === 'High' ? '#EF4444' : 
                      task.priority === 'Medium' ? '#F59E0B' : '#3B82F6',
        borderColor: 'transparent',
        textColor: '#ffffff',
        extendedProps: { type: 'task', task }
    }));
    
    // Convert study sessions to calendar events
    const sessionEvents = sessions.map((session, index) => ({
      id: `session-${index}`,
      title: `${session.type} Session`,
      start: new Date(session.timestamp).toISOString(),
      allDay: false,
      backgroundColor: session.type === 'Work' ? '#8B5CF6' : '#10B981',
      borderColor: 'transparent',
      textColor: '#ffffff',
      extendedProps: { type: 'session', session }
    }));
    
    const events = [...taskEvents, ...sessionEvents];
    
    // Initialize FullCalendar
    const calendar = new window.FullCalendar.Calendar(calendarEl, {
      plugins: [window.FullCalendar.dayGridPlugin, window.FullCalendar.interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek'
      },
      events: events,
      eventClick: function(info: any) {
        const { type, task, session } = info.event.extendedProps;
        let content = '';
        
        if (type === 'task') {
          content = `
            <div>
              <h3 class="text-lg font-bold">${task.title}</h3>
              <p>${task.description || 'No description'}</p>
              <p>Priority: ${task.priority}</p>
              <p>Status: ${task.completed ? 'Completed' : 'Pending'}</p>
              <p>Sessions: ${task.sessions || 0}</p>
            </div>
          `;
        } else {
          content = `
            <div>
              <h3 class="text-lg font-bold">${session.type} Session</h3>
              <p>Duration: ${Math.floor(session.duration / 60)} minutes</p>
              <p>Completed: ${new Date(session.timestamp).toLocaleString()}</p>
            </div>
          `;
        }
        
        // Simple modal
        const modal = document.createElement('div');
        modal.innerHTML = `
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="calendarModal">
            <div class="${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg max-w-md w-full">
              ${content}
              <div class="mt-4 text-right">
                <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" id="closeModal">Close</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeModal')?.addEventListener('click', () => {
          document.getElementById('calendarModal')?.remove();
        });
      },
      themeSystem: 'standard',
      height: 'auto'
    });
    
    calendar.render();
    
    return () => {
      calendar.destroy();
    };
  }, [tasks, sessions, darkMode]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6">Study Calendar</h2>
        <div 
          ref={calendarRef} 
          className={`calendar-container ${darkMode ? 'fc-theme-dark' : ''}`}
          style={{
            '--fc-border-color': darkMode ? '#4B5563' : '#E5E7EB',
            '--fc-page-bg-color': darkMode ? '#1F2937' : '#FFFFFF',
            '--fc-neutral-bg-color': darkMode ? '#374151' : '#F9FAFB',
            '--fc-list-event-hover-bg-color': darkMode ? '#4B5563' : '#F3F4F6',
            '--fc-today-bg-color': darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          } as React.CSSProperties}
        ></div>
      </div>
    </motion.div>
  );
}
