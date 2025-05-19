import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types";
import { priorityColors } from "@/lib/constants";

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  darkMode: boolean;
}

export default function TaskManager({ tasks, setTasks, darkMode }: TaskManagerProps) {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium' as const,
    deadline: '',
    playlistUrl: '',
  });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('priority');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask
            ? {
                ...task,
                ...newTask,
                updated: new Date().toISOString(),
              }
            : task
        )
      );
      setEditingTask(null);
    } else {
      setTasks([
        ...tasks,
        {
          ...newTask,
          id: Date.now().toString(),
          created: new Date().toISOString(),
          sessions: 0,
          completed: false,
        },
      ]);
    }
    setNewTask({
      title: '',
      description: '',
      priority: 'Medium',
      deadline: '',
      playlistUrl: '',
    });
    setShowForm(false);
  };

  const handleEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setNewTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline || '',
        playlistUrl: task.playlistUrl || '',
      });
      setEditingTask(id);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'priority') {
      const priorities = { High: 3, Medium: 2, Low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    }
    if (sort === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sort === 'sessions') {
      return (b.sessions || 0) - (a.sessions || 0);
    }
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Task Manager</h2>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setShowForm(!showForm);
              if (editingTask) {
                setEditingTask(null);
                setNewTask({
                  title: '',
                  description: '',
                  priority: 'Medium',
                  deadline: '',
                  playlistUrl: '',
                });
              }
            }}
            aria-label={showForm ? 'Cancel' : 'Add New Task'}
          >
            {showForm ? 'Cancel' : 'Add Task'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    rows={3}
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                      className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Deadline</label>
                    <input
                      type="date"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                      className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Study Playlist URL (YouTube, Spotify, etc.)</label>
                  <input
                    type="url"
                    value={newTask.playlistUrl}
                    onChange={(e) => setNewTask({ ...newTask, playlistUrl: e.target.value })}
                    className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="https://www.youtube.com/playlist?list=..."
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="mr-2">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="mr-2">Sort By:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={`p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value="priority">Priority</option>
              <option value="deadline">Deadline</option>
              <option value="sessions">Sessions Completed</option>
            </select>
          </div>
        </div>

        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No tasks found. Add a new task to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 border rounded ${
                  task.completed
                    ? darkMode
                      ? 'border-gray-600 bg-gray-700/50'
                      : 'border-gray-200 bg-gray-50'
                    : darkMode
                    ? 'border-gray-600'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="mt-1"
                    />
                    <div className={task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && <p className="text-sm mt-1">{task.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                          {task.priority}
                        </span>
                        {task.deadline && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                          Sessions: {task.sessions || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(task.id)}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label="Edit Task"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete Task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {task.playlistUrl && (
                  <div className="mt-2">
                    <a
                      href={task.playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm flex items-center"
                    >
                      <span className="mr-1">▶️</span> Open Study Playlist
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
