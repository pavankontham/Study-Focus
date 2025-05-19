import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { safeLocalStorage } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, Trash2, Edit, Calendar, CheckCircle, 
  CalendarClock, Target, Check, X, ArrowUpRight
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface GoalsProps {
  darkMode: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  created: string;
  completed: boolean;
  progress: number;
  category?: string;
  milestones?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export default function Goals({ darkMode }: GoalsProps) {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>(() => 
    safeLocalStorage.getItem("study-goals", [] as Goal[])
  );
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "completed">("all");
  
  // New goal form
  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    duration: number;
    category: string;
    milestones: string[];
  }>({
    title: "",
    description: "",
    duration: 14,
    category: "",
    milestones: []
  });
  
  // Update categories when goals change
  useEffect(() => {
    const allCategories = new Set<string>();
    goals.forEach(goal => {
      if (goal.category) {
        allCategories.add(goal.category);
      }
    });
    setCategories(Array.from(allCategories));
    
    // Save goals to localStorage
    safeLocalStorage.setItem("study-goals", goals);
  }, [goals]);
  
  // Create a new goal
  const createGoal = () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Goal Title Required",
        description: "Please provide a title for your goal.",
        variant: "destructive"
      });
      return;
    }
    
    const targetDate = addDays(new Date(), newGoal.duration).toISOString();
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate,
      created: new Date().toISOString(),
      completed: false,
      progress: 0,
      category: newGoal.category || undefined,
      milestones: newGoal.milestones.map(title => ({
        id: Math.random().toString(36).substr(2, 9),
        title,
        completed: false
      }))
    };
    
    setGoals(prev => [goal, ...prev]);
    setShowAddGoal(false);
    setNewGoal({
      title: "",
      description: "",
      duration: 14,
      category: "",
      milestones: []
    });
    
    toast({
      title: "Goal Created",
      description: "Your new study goal has been added."
    });
  };
  
  // Delete a goal
  const deleteGoal = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      setGoals(prev => prev.filter(goal => goal.id !== id));
      
      toast({
        title: "Goal Deleted",
        description: "The goal has been removed."
      });
    }
  };
  
  // Toggle goal completion
  const toggleGoalCompletion = (id: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id 
          ? { 
              ...goal, 
              completed: !goal.completed,
              progress: !goal.completed ? 100 : goal.progress 
            } 
          : goal
      )
    );
    
    const isCompleting = !goals.find(g => g.id === id)?.completed;
    
    toast({
      title: isCompleting ? "Goal Completed" : "Goal Reopened",
      description: isCompleting 
        ? "Congratulations on achieving your study goal!" 
        : "The goal has been marked as incomplete."
    });
  };
  
  // Update goal progress
  const updateGoalProgress = (id: string, progress: number) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id 
          ? { 
              ...goal, 
              progress,
              completed: progress === 100
            } 
          : goal
      )
    );
  };
  
  // Add a milestone to a goal
  const addMilestone = (goalId: string) => {
    if (!newMilestone.trim()) return;
    
    setGoals(prev => 
      prev.map(goal => {
        if (goal.id === goalId) {
          const updatedMilestones = [
            ...(goal.milestones || []),
            {
              id: Math.random().toString(36).substr(2, 9),
              title: newMilestone,
              completed: false
            }
          ];
          
          return {
            ...goal,
            milestones: updatedMilestones
          };
        }
        
        return goal;
      })
    );
    
    setNewMilestone("");
  };
  
  // Toggle milestone completion
  const toggleMilestoneCompletion = (goalId: string, milestoneId: string) => {
    setGoals(prev => 
      prev.map(goal => {
        if (goal.id === goalId && goal.milestones) {
          const updatedMilestones = goal.milestones.map(milestone => 
            milestone.id === milestoneId 
              ? { ...milestone, completed: !milestone.completed } 
              : milestone
          );
          
          // Calculate new progress based on completed milestones
          const totalMilestones = updatedMilestones.length;
          const completedMilestones = updatedMilestones.filter(m => m.completed).length;
          const newProgress = totalMilestones > 0 
            ? Math.round((completedMilestones / totalMilestones) * 100) 
            : goal.progress;
          
          return {
            ...goal,
            milestones: updatedMilestones,
            progress: newProgress,
            completed: newProgress === 100
          };
        }
        
        return goal;
      })
    );
  };
  
  // Filter goals based on selected filter
  const filteredGoals = goals.filter(goal => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "active") return !goal.completed;
    if (selectedFilter === "completed") return goal.completed;
    return true;
  });
  
  // Calculate days remaining for a goal
  const getDaysRemaining = (targetDate: string) => {
    const remaining = differenceInDays(new Date(targetDate), new Date());
    return remaining < 0 ? 0 : remaining;
  };
  
  // Get color based on days remaining
  const getTimeColor = (daysRemaining: number, completed: boolean) => {
    if (completed) return "text-green-500";
    if (daysRemaining === 0) return "text-red-500";
    if (daysRemaining <= 3) return "text-orange-500";
    return "text-blue-500";
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
          <h2 className="text-2xl font-bold gradient-text">Study Goals</h2>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddGoal(true)}
              className="flex items-center gap-1"
              disabled={showAddGoal}
            >
              <PlusCircle size={16} /> New Goal
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              onClick={() => setSelectedFilter("all")}
              className="flex-1"
            >
              All
            </Button>
            <Button
              variant={selectedFilter === "active" ? "default" : "outline"}
              onClick={() => setSelectedFilter("active")}
              className="flex-1"
            >
              Active
            </Button>
            <Button
              variant={selectedFilter === "completed" ? "default" : "outline"}
              onClick={() => setSelectedFilter("completed")}
              className="flex-1"
            >
              Completed
            </Button>
          </div>
        </div>
        
        {/* Add Goal Form */}
        {showAddGoal && (
          <Card className={`mb-6 ${darkMode ? 'bg-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} /> Create New Goal
              </CardTitle>
              <CardDescription>
                Set a new study goal with a target date and milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Goal Title *
                </label>
                <Input
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="E.g., Complete Calculus Course"
                  className={darkMode ? 'bg-gray-800 border-gray-600' : ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Briefly describe your goal"
                  className={darkMode ? 'bg-gray-800 border-gray-600' : ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    placeholder="E.g., Math, Language, Computer Science"
                    className={`flex-grow ${darkMode ? 'bg-gray-800 border-gray-600' : ''}`}
                  />
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {categories.map(category => (
                      <Badge 
                        key={category} 
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => setNewGoal({ ...newGoal, category })}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration: {newGoal.duration} days
                </label>
                <div className="px-2">
                  <Slider
                    value={[newGoal.duration]}
                    min={1}
                    max={90}
                    step={1}
                    onValueChange={(value) => setNewGoal({ ...newGoal, duration: value[0] })}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Target Date: {format(addDays(new Date(), newGoal.duration), 'MMM d, yyyy')}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Milestones
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    placeholder="Add a milestone"
                    className={`flex-grow ${darkMode ? 'bg-gray-800 border-gray-600' : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMilestone.trim()) {
                        e.preventDefault();
                        setNewGoal({
                          ...newGoal,
                          milestones: [...newGoal.milestones, newMilestone.trim()]
                        });
                        setNewMilestone("");
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (newMilestone.trim()) {
                        setNewGoal({
                          ...newGoal,
                          milestones: [...newGoal.milestones, newMilestone.trim()]
                        });
                        setNewMilestone("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                
                {newGoal.milestones.length > 0 ? (
                  <ul className="space-y-2 pl-2">
                    {newGoal.milestones.map((milestone, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-gray-400" />
                          <span>{milestone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => {
                            setNewGoal({
                              ...newGoal,
                              milestones: newGoal.milestones.filter((_, i) => i !== index)
                            });
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    Breaking your goal into milestones helps track progress.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddGoal(false);
                  setNewGoal({
                    title: "",
                    description: "",
                    duration: 14,
                    category: "",
                    milestones: []
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={createGoal}>Save Goal</Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Goals List */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoals.map(goal => (
              <Card 
                key={goal.id} 
                className={`${darkMode ? 'bg-gray-700' : ''} ${
                  goal.completed ? 'border-green-500 dark:border-green-700' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {goal.completed && <CheckCircle size={18} className="text-green-500" />}
                      {goal.title}
                    </CardTitle>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {goal.category && (
                    <Badge variant="outline" className="mr-2 mt-1">
                      {goal.category}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="py-2">
                  {goal.description && (
                    <p className="text-sm mb-3">{goal.description}</p>
                  )}
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <CalendarClock size={14} className="text-gray-500" /> 
                      Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                    </span>
                    <span className={`flex items-center gap-1 ${getTimeColor(getDaysRemaining(goal.targetDate), goal.completed)}`}>
                      <Calendar size={14} /> 
                      {goal.completed ? 'Completed' : `${getDaysRemaining(goal.targetDate)} days left`}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  
                  {!goal.completed && (
                    <div className="mb-3 flex gap-2">
                      <Button
                        size="sm"
                        className="w-full"
                        variant={editingGoalId === goal.id ? "default" : "outline"}
                        onClick={() => setEditingGoalId(editingGoalId === goal.id ? null : goal.id)}
                      >
                        <Edit size={14} className="mr-1" /> Update Progress
                      </Button>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => toggleGoalCompletion(goal.id)}
                      >
                        <CheckCircle size={14} className="mr-1" /> Complete
                      </Button>
                    </div>
                  )}
                  
                  {editingGoalId === goal.id && (
                    <div className="mb-3">
                      <div className="px-2 py-4">
                        <Slider
                          defaultValue={[goal.progress]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) => updateGoalProgress(goal.id, value[0])}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold mb-2 flex items-center">
                        <Target size={14} className="mr-1" /> Milestones
                      </h4>
                      <ul className="space-y-2">
                        {goal.milestones.map(milestone => (
                          <li 
                            key={milestone.id} 
                            className="flex items-center justify-between text-sm"
                            onClick={() => !goal.completed && toggleMilestoneCompletion(goal.id, milestone.id)}
                          >
                            <div className="flex items-center gap-2 cursor-pointer">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                                ${milestone.completed 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-400'
                                }`}
                              >
                                {milestone.completed && <Check size={12} />}
                              </div>
                              <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                                {milestone.title}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Add Milestone (if not completed) */}
                  {!goal.completed && editingGoalId === goal.id && (
                    <div className="mt-3">
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newMilestone}
                          onChange={(e) => setNewMilestone(e.target.value)}
                          placeholder="Add a milestone"
                          className={`flex-grow text-sm ${darkMode ? 'bg-gray-800 border-gray-600' : ''}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newMilestone.trim()) {
                              e.preventDefault();
                              addMilestone(goal.id);
                            }
                          }}
                        />
                        <Button 
                          size="sm"
                          onClick={() => newMilestone.trim() && addMilestone(goal.id)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0">
                  <div className="text-xs text-gray-500">
                    Created: {format(new Date(goal.created), 'MMM d, yyyy')}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Target size={48} className="mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
            <p className="mb-4">
              {selectedFilter === "all" 
                ? "Set your first study goal to track your progress." 
                : selectedFilter === "active"
                  ? "You have no active goals. Create one or check completed goals."
                  : "You haven't completed any goals yet. Keep going!"}
            </p>
            <Button onClick={() => setShowAddGoal(true)}>Create Your First Goal</Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}