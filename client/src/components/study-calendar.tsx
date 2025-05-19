import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Task, Session } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar as CalendarIcon, Plus, Info } from "lucide-react";
import { format } from "date-fns";

interface StudyCalendarProps {
  tasks: Task[];
  sessions: Session[];
  darkMode: boolean;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}

declare global {
  interface Window {
    FullCalendar: any;
  }
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    type: 'task' | 'session';
    task?: Task;
    session?: Session;
  };
}

export default function StudyCalendar({ tasks, sessions, darkMode, setTasks }: StudyCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarInstance, setCalendarInstance] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    category: '',
    deadline: ''
  });
  const [error, setError] = useState('');
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  
  // Initialize FullCalendar
  useEffect(() => {
    if (!calendarRef.current) return;
    
    // Check if FullCalendar is available
    if (!window.FullCalendar) {
      console.error("FullCalendar is not loaded. Please check your script imports.");
      return;
    }
    
    try {
      // Create calendar instance
      const calendar = new window.FullCalendar.Calendar(calendarRef.current, {
        plugins: [window.FullCalendar.dayGridPlugin, window.FullCalendar.interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        },
        dateClick: function(info: any) {
          const clickedDate = new Date(info.dateStr);
          setSelectedDate(clickedDate);
          setNewTask({
            ...newTask,
            deadline: info.dateStr
          });
          setShowAddTaskModal(true);
        },
        eventClick: function(info: any) {
          // Store the clicked event
          setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            start: info.event.startStr,
            end: info.event.endStr,
            allDay: info.event.allDay,
            backgroundColor: info.event.backgroundColor,
            borderColor: info.event.borderColor,
            textColor: info.event.textColor,
            extendedProps: info.event.extendedProps
          });
          setShowEventDetails(true);
        },
        eventDrop: function(info: any) {
          if (setTasks && info.event.extendedProps.type === 'task') {
            const task = info.event.extendedProps.task;
            const newDate = info.event.start.toISOString().split('T')[0];
            
            setTasks(prevTasks => 
              prevTasks.map(t => 
                t.id === task.id ? { ...t, deadline: newDate } : t
              )
            );
          }
        },
        editable: true,
        themeSystem: 'bootstrap5',
        height: 'auto',
        dayMaxEvents: true,
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }
      });
      
      setCalendarInstance(calendar);
      calendar.render();
      setCalendarLoaded(true);
      
      return () => {
        calendar.destroy();
      };
    } catch (error) {
      console.error("Error initializing FullCalendar:", error);
    }
  }, []);
  
  // Update calendar events when tasks or sessions change
  useEffect(() => {
    if (calendarInstance && calendarLoaded) {
      // Clear existing events
      calendarInstance.removeAllEvents();
      
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
      
      // Add all events to calendar
      const events = [...taskEvents, ...sessionEvents];
      calendarInstance.addEventSource(events);
    }
  }, [tasks, sessions, calendarLoaded, calendarInstance]);
  
  // Apply dark mode to calendar
  useEffect(() => {
    if (calendarRef.current) {
      if (darkMode) {
        calendarRef.current.classList.add('fc-theme-dark');
        calendarRef.current.style.setProperty('--fc-border-color', '#4B5563');
        calendarRef.current.style.setProperty('--fc-page-bg-color', '#1F2937');
        calendarRef.current.style.setProperty('--fc-neutral-bg-color', '#374151');
        calendarRef.current.style.setProperty('--fc-list-event-hover-bg-color', '#4B5563');
        calendarRef.current.style.setProperty('--fc-today-bg-color', 'rgba(59, 130, 246, 0.1)');
        calendarRef.current.style.setProperty('--fc-event-bg-color', '#3B82F6');
        calendarRef.current.style.setProperty('--fc-event-border-color', '#3B82F6');
        calendarRef.current.style.setProperty('--fc-event-text-color', '#FFFFFF');
        calendarRef.current.style.setProperty('--fc-button-text-color', '#FFFFFF');
        calendarRef.current.style.setProperty('--fc-button-bg-color', '#4B5563');
        calendarRef.current.style.setProperty('--fc-button-border-color', '#4B5563');
        calendarRef.current.style.setProperty('--fc-button-hover-bg-color', '#374151');
        calendarRef.current.style.setProperty('--fc-button-hover-border-color', '#374151');
        calendarRef.current.style.setProperty('--fc-button-active-bg-color', '#1F2937');
        calendarRef.current.style.setProperty('--fc-button-active-border-color', '#1F2937');
      } else {
        calendarRef.current.classList.remove('fc-theme-dark');
        calendarRef.current.style.setProperty('--fc-border-color', '#E5E7EB');
        calendarRef.current.style.setProperty('--fc-page-bg-color', '#FFFFFF');
        calendarRef.current.style.setProperty('--fc-neutral-bg-color', '#F9FAFB');
        calendarRef.current.style.setProperty('--fc-list-event-hover-bg-color', '#F3F4F6');
        calendarRef.current.style.setProperty('--fc-today-bg-color', 'rgba(59, 130, 246, 0.1)');
        calendarRef.current.style.setProperty('--fc-event-bg-color', '#3B82F6');
        calendarRef.current.style.setProperty('--fc-event-border-color', '#3B82F6');
        calendarRef.current.style.setProperty('--fc-event-text-color', '#FFFFFF');
        calendarRef.current.style.setProperty('--fc-button-text-color', '#212529');
        calendarRef.current.style.setProperty('--fc-button-bg-color', '#F8F9FA');
        calendarRef.current.style.setProperty('--fc-button-border-color', '#F8F9FA');
        calendarRef.current.style.setProperty('--fc-button-hover-bg-color', '#E9ECEF');
        calendarRef.current.style.setProperty('--fc-button-hover-border-color', '#E9ECEF');
        calendarRef.current.style.setProperty('--fc-button-active-bg-color', '#DEE2E6');
        calendarRef.current.style.setProperty('--fc-button-active-border-color', '#DEE2E6');
      }
    }
  }, [darkMode]);

  const handleAddTask = () => {
    setError('');
    
    if (!newTask.title.trim()) {
      setError('Please enter a task title');
      return;
    }
    
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }
    
    if (setTasks) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category || undefined,
        deadline: newTask.deadline,
        created: new Date().toISOString(),
        sessions: 0,
        completed: false
      };
      
      setTasks(prev => [...prev, task]);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        category: '',
        deadline: ''
      });
      setShowAddTaskModal(false);
    }
  };
  
  const handleToggleTaskComplete = (id: string) => {
    if (setTasks) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
      setShowEventDetails(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Study Calendar</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSelectedDate(new Date());
                setNewTask({
                  ...newTask,
                  deadline: new Date().toISOString().split('T')[0]
                });
                setShowAddTaskModal(true);
              }}
              className="flex items-center gap-1"
            >
              <Plus size={16} /> Add Task
            </Button>
          </div>
        </div>
        
        {!window.FullCalendar ? (
          <div className="p-8 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
            <div className="flex items-center justify-center mb-4">
              <Info size={24} className="text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Calendar Library Not Loaded</h3>
            <p className="mb-4">
              The calendar component requires FullCalendar library to function properly. 
              Please check your internet connection and refresh the page.
            </p>
          </div>
        ) : (
          <div 
            ref={calendarRef} 
            className={`calendar-container min-h-[600px] ${darkMode ? 'fc-theme-dark' : ''}`}
          ></div>
        )}
      </div>
      
      {/* Add Task Modal */}
      <Dialog 
        open={showAddTaskModal} 
        onOpenChange={(open) => {
          setShowAddTaskModal(open);
          if (!open) setError('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as 'High' | 'Medium' | 'Low' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  placeholder="Optional category"
                  className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskModal(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Event Details Modal */}
      <Dialog 
        open={showEventDetails} 
        onOpenChange={setShowEventDetails}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon size={20} />
              <span>{selectedEvent?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="py-4">
              {selectedEvent.extendedProps.type === 'task' && selectedEvent.extendedProps.task && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                    <p className="mt-1">{selectedEvent.extendedProps.task.description || 'No description'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</h3>
                      <p className="mt-1">{selectedEvent.extendedProps.task.priority}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                      <p className="mt-1">{selectedEvent.extendedProps.task.completed ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</h3>
                      <p className="mt-1">{new Date(selectedEvent.start).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sessions</h3>
                      <p className="mt-1">{selectedEvent.extendedProps.task.sessions || 0}</p>
                    </div>
                  </div>
                  
                  {selectedEvent.extendedProps.task.category && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                      <p className="mt-1">{selectedEvent.extendedProps.task.category}</p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {setTasks && (
                      <Button 
                        onClick={() => handleToggleTaskComplete(selectedEvent.extendedProps.task!.id)}
                        variant={selectedEvent.extendedProps.task.completed ? "outline" : "default"}
                      >
                        {selectedEvent.extendedProps.task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {selectedEvent.extendedProps.type === 'session' && selectedEvent.extendedProps.session && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Type</h3>
                    <p className="mt-1">{selectedEvent.extendedProps.session.type}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</h3>
                      <p className="mt-1">{Math.floor(selectedEvent.extendedProps.session.duration / 60)} minutes</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</h3>
                      <p className="mt-1">{new Date(selectedEvent.extendedProps.session.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowEventDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
