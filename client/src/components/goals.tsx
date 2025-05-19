import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { safeLocalStorage } from "@/lib/local-storage";
import { Goal } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Check, Plus } from "lucide-react";

interface GoalsProps {
  darkMode: boolean;
}

export default function Goals({ darkMode }: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>(() => 
    safeLocalStorage.getItem('studyGoals', [])
  );
  const [newGoal, setNewGoal] = useState({
    title: '',
    duration: 7
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    safeLocalStorage.setItem('studyGoals', goals);
  }, [goals]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newGoal.title.trim()) {
      setError("Please enter a goal title");
      return;
    }
    
    if (newGoal.duration < 1) {
      setError("Duration must be at least 1 day");
      return;
    }
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      duration: newGoal.duration,
      completed: false,
      created: new Date().toISOString()
    };
    
    setGoals([...goals, goal]);
    setNewGoal({ title: '', duration: 7 });
    setShowForm(false);
  };

  const toggleGoalCompletion = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      setGoals(goals.filter(goal => goal.id !== id));
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
          <h2 className="text-2xl font-bold">Study Goals</h2>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1"
          >
            {showForm ? "Cancel" : <>Add Goal <Plus size={16} /></>}
          </Button>
        </div>
        
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <form onSubmit={handleAddGoal} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Goal Title</label>
                  <Input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Complete 3 chapters of calculus"
                    className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Duration (days)</label>
                  <Input
                    type="number"
                    value={newGoal.duration}
                    onChange={(e) => setNewGoal({ ...newGoal, duration: parseInt(e.target.value) })}
                    min="1"
                    className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                  />
                </div>
                
                {error && (
                  <div className="text-red-500 mb-4">{error}</div>
                )}
                
                <Button type="submit">Add Goal</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {goals.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p>No goals set yet. Add a goal to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 border rounded-lg flex items-center justify-between ${
                  goal.completed 
                    ? darkMode 
                      ? 'bg-gray-700/50 border-green-700'
                      : 'bg-green-50 border-green-200'
                    : darkMode
                    ? 'border-gray-700'
                    : 'border-gray-200'
                }`}
              >
                <div className={`flex-1 ${goal.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                  <h3 className="font-medium">{goal.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Duration: {goal.duration} days
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleGoalCompletion(goal.id)}
                    variant="outline"
                    size="icon"
                    className={`${
                      goal.completed
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                        : darkMode ? 'border-gray-600' : ''
                    }`}
                    aria-label={goal.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    <Check size={18} />
                  </Button>
                  
                  <Button
                    onClick={() => deleteGoal(goal.id)}
                    variant="outline"
                    size="icon"
                    className={`text-red-500 hover:text-red-700 ${darkMode ? 'border-gray-600' : ''}`}
                    aria-label="Delete goal"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Tips for Setting Effective Goals:</h3>
          <ul className="list-disc ml-6 space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>Make goals specific and measurable</li>
            <li>Set realistic timeframes</li>
            <li>Break larger goals into smaller milestones</li>
            <li>Review and adjust goals regularly</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}