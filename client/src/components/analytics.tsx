import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Task, Session } from "@/types";

interface AnalyticsProps {
  tasks: Task[];
  sessions: Session[];
  darkMode: boolean;
}

export default function Analytics({ tasks, sessions, darkMode }: AnalyticsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!chartRef.current || !window.Chart) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Group sessions by day
    const sessionsByDay = sessions.reduce<Record<string, number>>((acc, session) => {
      const date = new Date(session.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += session.duration / 60; // Convert seconds to minutes
      return acc;
    }, {});
    
    // Sort by date
    const sortedDates = Object.keys(sessionsByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const last7Days = sortedDates.slice(-7);
    
    // Create dataset
    const chartData = {
      labels: last7Days.map(date => new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Study Minutes',
          data: last7Days.map(date => sessionsByDay[date]),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Destroy previous chart if it exists
    if ((chartRef.current as any).chart) {
      (chartRef.current as any).chart.destroy();
    }
    
    // Create new chart
    (chartRef.current as any).chart = new window.Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Minutes'
            },
            ticks: {
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
            }
          },
          x: {
            ticks: {
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
            }
          }
        }
      }
    });
  }, [sessions, darkMode]);
  
  useEffect(() => {
    if (!pieChartRef.current || !window.Chart) return;
    
    const ctx = pieChartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Group tasks by priority
    const tasksByPriority = tasks.reduce<Record<string, number>>((acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = 0;
      }
      acc[task.priority]++;
      return acc;
    }, {});
    
    // Create dataset
    const chartData = {
      labels: Object.keys(tasksByPriority),
      datasets: [
        {
          data: Object.values(tasksByPriority),
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)', // Red for High
            'rgba(245, 158, 11, 0.7)', // Amber for Medium
            'rgba(16, 185, 129, 0.7)' // Green for Low
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(16, 185, 129, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // Destroy previous chart if it exists
    if ((pieChartRef.current as any).chart) {
      (pieChartRef.current as any).chart.destroy();
    }
    
    // Create new chart
    (pieChartRef.current as any).chart = new window.Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
            }
          },
          title: {
            display: true,
            text: 'Tasks by Priority',
            color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
          }
        }
      }
    });
  }, [tasks, darkMode]);
  
  // Calculate total study time in hours
  const totalStudyTime = sessions.reduce((total, session) => total + session.duration, 0) / 3600;
  
  // Calculate completion rate
  const completionRate = tasks.length > 0 
    ? (tasks.filter(task => task.completed).length / tasks.length) * 100 
    : 0;
  
  // Find most productive day
  const sessionsByDay = sessions.reduce<Record<string, number>>((acc, session) => {
    const date = new Date(session.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += session.duration;
    return acc;
  }, {});
  
  let mostProductiveDay = { date: 'None', duration: 0 };
  Object.entries(sessionsByDay).forEach(([date, duration]) => {
    if (duration > mostProductiveDay.duration) {
      mostProductiveDay = { date, duration };
    }
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h3 className="text-lg font-semibold mb-1">Total Study Time</h3>
            <p className="text-3xl font-bold">{totalStudyTime.toFixed(1)} hrs</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
            <h3 className="text-lg font-semibold mb-1">Task Completion</h3>
            <p className="text-3xl font-bold">{completionRate.toFixed(0)}%</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
            <h3 className="text-lg font-semibold mb-1">Most Productive Day</h3>
            <p className="text-xl font-bold">
              {mostProductiveDay.date !== 'None' 
                ? `${new Date(mostProductiveDay.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}` 
                : 'No data yet'}
            </p>
            {mostProductiveDay.date !== 'None' && (
              <p className="text-sm">
                {(mostProductiveDay.duration / 3600).toFixed(1)} hours of study
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Study Time (Last 7 Days)</h3>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg`}>
              <canvas ref={chartRef} height="250"></canvas>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Tasks by Priority</h3>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg`}>
              <canvas ref={pieChartRef} height="250"></canvas>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
