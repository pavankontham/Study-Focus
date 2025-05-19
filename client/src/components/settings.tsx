import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { safeLocalStorage } from "@/lib/local-storage";
import { AppSettings } from "@/types";
import { defaultAppSettings, themeOptions, motivationalQuotes } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  X, Plus, Download, Upload, Bell, Palette, 
  Type, MonitorCheck, BellRing, FolderClosed, 
  Lock, Database, SunMoon, Book, 
  CheckCircle, Clock, ListChecks, Mountain
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SettingsProps {
  darkMode: boolean;
  setAppSettings: (settings: AppSettings) => void;
  settings: AppSettings;
}

const FOCUS_BACKGROUNDS = [
  { id: "none", name: "No Background", icon: <X size={18} /> },
  { id: "forest", name: "Forest", icon: <Mountain size={18} /> },
  { id: "beach", name: "Beach", icon: <SunMoon size={18} /> },
  { id: "mountains", name: "Mountains", icon: <Mountain size={18} /> },
  { id: "library", name: "Library", icon: <Book size={18} /> },
];

export default function Settings({ darkMode, settings, setAppSettings }: SettingsProps) {
  const [newBlockedSite, setNewBlockedSite] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [siteError, setSiteError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [focusBackground, setFocusBackground] = useState(settings.focusBackground || "none");
  const [pomodoroDefaults, setPomodoroDefaults] = useState({
    work: 25,
    shortBreak: 5,
    longBreak: 15
  });
  const [autoBackupInterval, setAutoBackupInterval] = useState(settings.autoBackupInterval || 5);
  const { toast } = useToast();

  // Update settings and save to localStorage
  const updateSettings = (updatedSettings: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updatedSettings };
    setAppSettings(newSettings);
    safeLocalStorage.setItem('appSettings', newSettings);
    
    // Show success toast
    toast({
      title: "Settings Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  // Blocked sites management
  const addBlockedSite = () => {
    setSiteError("");
    const site = newBlockedSite.trim();
    
    if (!site) {
      setSiteError("Please enter a website URL");
      return;
    }
    
    if (settings.blockedSites.includes(site)) {
      setSiteError("This site is already in your list");
      return;
    }
    
    updateSettings({ blockedSites: [...settings.blockedSites, site] });
    setNewBlockedSite("");
  };

  const removeBlockedSite = (site: string) => {
    updateSettings({ 
      blockedSites: settings.blockedSites.filter(s => s !== site) 
    });
  };

  // Category management
  const addCategory = () => {
    setCategoryError("");
    const category = newCategory.trim();
    
    if (!category) {
      setCategoryError("Please enter a category name");
      return;
    }
    
    if (settings.customCategories.includes(category)) {
      setCategoryError("This category already exists");
      return;
    }
    
    updateSettings({ 
      customCategories: [...settings.customCategories, category] 
    });
    setNewCategory("");
  };

  const removeCategory = (category: string) => {
    updateSettings({ 
      customCategories: settings.customCategories.filter(c => c !== category) 
    });
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "This browser does not support desktop notifications",
        variant: "destructive"
      });
      return;
    }
    
    const permission = await Notification.requestPermission();
    updateSettings({
      notificationsPermission: permission === "granted"
    });
    
    if (permission === "granted") {
      // Show sample notification
      new Notification("Notification Test", {
        body: "Notifications are now enabled for the Ultimate Study Focus Suite",
        icon: "/favicon.ico"
      });
    }
  };

  // Reset to default settings
  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to default values? This won't affect your tasks or other data.")) {
      setAppSettings(defaultAppSettings);
      safeLocalStorage.setItem('appSettings', defaultAppSettings);
      
      toast({
        title: "Settings Reset",
        description: "All settings have been restored to default values.",
      });
    }
  };

  // Export data
  const exportData = () => {
    const appData = {
      tasks: safeLocalStorage.getItem('tasks', []),
      sessions: safeLocalStorage.getItem('sessions', []),
      pomoSettings: safeLocalStorage.getItem('pomoSettings', {}),
      notes: safeLocalStorage.getItem('studyNotes', {}),
      goals: safeLocalStorage.getItem('studyGoals', []),
      appSettings: settings
    };
    
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_suite_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Your data has been exported successfully.",
    });
  };

  // Import data
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast({
        title: "Invalid File",
        description: "Please upload a JSON file.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.tasks) safeLocalStorage.setItem('tasks', data.tasks);
        if (data.sessions) safeLocalStorage.setItem('sessions', data.sessions);
        if (data.pomoSettings) safeLocalStorage.setItem('pomoSettings', data.pomoSettings);
        if (data.notes) safeLocalStorage.setItem('studyNotes', data.notes);
        if (data.goals) safeLocalStorage.setItem('studyGoals', data.goals);
        if (data.appSettings) {
          safeLocalStorage.setItem('appSettings', data.appSettings);
          setAppSettings(data.appSettings);
        }
        
        toast({
          title: "Import Complete",
          description: "Your data has been imported successfully. The page will refresh momentarily.",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Error importing data:', error);
        toast({
          title: "Import Failed",
          description: "Error importing data. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  // Auto-backup settings
  const updateAutoBackupInterval = (value: number) => {
    setAutoBackupInterval(value);
    updateSettings({ autoBackupInterval: value });
  };

  // Update Pomodoro defaults
  const updatePomodoroDefaults = () => {
    const pomoSettings = {
      work: pomodoroDefaults.work * 60,
      shortBreak: pomodoroDefaults.shortBreak * 60,
      longBreak: pomodoroDefaults.longBreak * 60
    };
    
    safeLocalStorage.setItem('pomoSettings', pomoSettings);
    updateSettings({ pomodoroDefaults });
    
    toast({
      title: "Pomodoro Defaults Updated",
      description: "Your Pomodoro timer settings have been updated.",
    });
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
          <h2 className="text-2xl font-bold">Settings</h2>
          <Button onClick={resetToDefaults} variant="outline" className="text-red-500">
            Reset to Defaults
          </Button>
        </div>
        
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette size={16} /> Appearance
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Mountain size={16} /> Focus Mode
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <ListChecks size={16} /> Preferences
            </TabsTrigger>
            <TabsTrigger value="pomodoro" className="flex items-center gap-2">
              <Clock size={16} /> Pomodoro
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database size={16} /> Data
            </TabsTrigger>
          </TabsList>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose how Ultimate Study Focus Suite looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(themeOptions).map(([key, theme]) => (
                    <Button
                      key={key}
                      onClick={() => updateSettings({ theme: key as any })}
                      variant={settings.theme === key ? "default" : "outline"}
                      className={`flex flex-col items-center gap-2 h-auto py-4 ${darkMode && settings.theme !== key ? 'border-gray-600' : ''}`}
                    >
                      <span className="text-2xl">{theme.icon}</span> 
                      <span>{theme.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Font Size */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type size={20} /> Font Size
                </CardTitle>
                <CardDescription>Adjust the text size throughout the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Small (12px)</span>
                    <span className="font-bold">{settings.fontSize}px</span>
                    <span>Large (24px)</span>
                  </div>
                  <Slider
                    value={[settings.fontSize]}
                    min={12}
                    max={24}
                    step={1}
                    onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                  />
                  
                  <div className="pt-4">
                    <p className="text-sm" style={{ fontSize: `${settings.fontSize}px` }}>
                      This is a preview of the selected font size.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Focus Mode Tab */}
          <TabsContent value="focus" className="space-y-6">
            {/* Focus Mode Background */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mountain size={20} /> Focus Mode Background
                </CardTitle>
                <CardDescription>Choose a background image for focus mode</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={focusBackground} 
                  onValueChange={(value) => {
                    setFocusBackground(value);
                    updateSettings({ focusBackground: value });
                  }}
                  className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                  {FOCUS_BACKGROUNDS.map((bg) => (
                    <div key={bg.id}>
                      <RadioGroupItem 
                        value={bg.id} 
                        id={`bg-${bg.id}`} 
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor={`bg-${bg.id}`}
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {bg.icon}
                        <span className="mt-2">{bg.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
            
            {/* Blocked Sites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={20} /> Blocked Sites
                </CardTitle>
                <CardDescription>Sites to block during focus mode sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    placeholder="e.g., facebook.com, twitter.com"
                    value={newBlockedSite}
                    onChange={(e) => setNewBlockedSite(e.target.value)}
                    className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                  />
                  <Button onClick={addBlockedSite} className="flex items-center gap-1">
                    <Plus size={16} /> Add
                  </Button>
                </div>
                
                {siteError && (
                  <div className="text-red-500 mb-4">{siteError}</div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4 max-h-40 overflow-y-auto p-2 border rounded">
                  {settings.blockedSites.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 w-full text-center py-4">
                      No blocked sites. Add sites to block during focus mode.
                    </div>
                  ) : (
                    settings.blockedSites.map((site, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {site}
                        <button 
                          onClick={() => removeBlockedSite(site)} 
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <b>Note:</b> Site blocking requires a browser extension for full functionality. This list can be exported and imported into most site-blocking extensions.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Focus Mode Behavior */}
            <Card>
              <CardHeader>
                <CardTitle>Focus Mode Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="focus-mode-tips" 
                    checked={settings.showFocusModeTips ?? true}
                    onCheckedChange={(checked) => updateSettings({ showFocusModeTips: checked })}
                  />
                  <Label htmlFor="focus-mode-tips">Show motivational quotes during focus mode</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="fullscreen-focus" 
                    checked={settings.fullscreenFocusMode ?? false}
                    onCheckedChange={(checked) => updateSettings({ fullscreenFocusMode: checked })}
                  />
                  <Label htmlFor="fullscreen-focus">Request fullscreen during focus mode</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="restrict-navigation" 
                    checked={settings.restrictNavigation ?? false}
                    onCheckedChange={(checked) => updateSettings({ restrictNavigation: checked })}
                  />
                  <Label htmlFor="restrict-navigation">Restrict navigation during active Pomodoro sessions</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRing size={20} /> Notifications
                </CardTitle>
                <CardDescription>Configure system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={requestNotificationPermission}
                    className="flex items-center gap-2"
                    variant={settings.notificationsPermission ? "default" : "outline"}
                  >
                    <Bell size={16} />
                    {settings.notificationsPermission ? "Notifications Enabled" : "Enable Notifications"}
                  </Button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.notificationsPermission ? 
                      "Notifications are enabled for timer alerts and session changes." : 
                      "Enable browser notifications for timer alerts."}
                  </span>
                </div>
                
                {settings.notificationsPermission && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="pomodoro-notifications" 
                        checked={settings.pomodoroNotifications ?? true}
                        onCheckedChange={(checked) => updateSettings({ pomodoroNotifications: checked })}
                      />
                      <Label htmlFor="pomodoro-notifications">Pomodoro session notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="task-notifications" 
                        checked={settings.taskNotifications ?? true}
                        onCheckedChange={(checked) => updateSettings({ taskNotifications: checked })}
                      />
                      <Label htmlFor="task-notifications">Task deadline notifications</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Custom Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderClosed size={20} /> Task Categories
                </CardTitle>
                <CardDescription>Define custom categories for organizing tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    placeholder="e.g., Math, Science, Language"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                  />
                  <Button onClick={addCategory} className="flex items-center gap-1">
                    <Plus size={16} /> Add
                  </Button>
                </div>
                
                {categoryError && (
                  <div className="text-red-500 mb-4">{categoryError}</div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4 max-h-40 overflow-y-auto p-2 border rounded">
                  {settings.customCategories.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 w-full text-center py-4">
                      No custom categories. Add categories to organize your tasks.
                    </div>
                  ) : (
                    settings.customCategories.map((category, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {category}
                        <button 
                          onClick={() => removeCategory(category)} 
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Quote Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Motivational Quotes</CardTitle>
                <CardDescription>Manage motivational quotes that appear during breaks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 overflow-y-auto p-2 border rounded mb-4">
                  {motivationalQuotes.map((quote, index) => (
                    <div 
                      key={index} 
                      className={`p-2 mb-2 rounded ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                    >
                      "{quote}"
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coming soon: Add your own custom motivational quotes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pomodoro Tab */}
          <TabsContent value="pomodoro" className="space-y-6">
            {/* Default Pomodoro Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} /> Default Timer Settings
                </CardTitle>
                <CardDescription>Set your preferred Pomodoro timer durations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="work-duration"
                        value={[pomodoroDefaults.work]}
                        min={1}
                        max={120}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => setPomodoroDefaults({...pomodoroDefaults, work: value[0]})}
                      />
                      <span className="w-16 text-center">{pomodoroDefaults.work} min</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="short-break">Short Break (minutes)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="short-break"
                        value={[pomodoroDefaults.shortBreak]}
                        min={1}
                        max={30}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => setPomodoroDefaults({...pomodoroDefaults, shortBreak: value[0]})}
                      />
                      <span className="w-16 text-center">{pomodoroDefaults.shortBreak} min</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="long-break">Long Break (minutes)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="long-break"
                        value={[pomodoroDefaults.longBreak]}
                        min={5}
                        max={60}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => setPomodoroDefaults({...pomodoroDefaults, longBreak: value[0]})}
                      />
                      <span className="w-16 text-center">{pomodoroDefaults.longBreak} min</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button onClick={updatePomodoroDefaults}>Save Default Durations</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Auto Start Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Session Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-start-breaks" 
                    checked={settings.autoStartBreaks ?? true}
                    onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
                  />
                  <Label htmlFor="auto-start-breaks">Auto-start breaks when work session ends</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-start-work" 
                    checked={settings.autoStartWork ?? false}
                    onCheckedChange={(checked) => updateSettings({ autoStartWork: checked })}
                  />
                  <Label htmlFor="auto-start-work">Auto-start work sessions when breaks end</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="long-break-interval-setting" 
                    checked={settings.customLongBreakInterval ?? false}
                    onCheckedChange={(checked) => updateSettings({ customLongBreakInterval: checked })}
                  />
                  <Label htmlFor="long-break-interval-setting">Customize long break interval</Label>
                </div>
                
                {settings.customLongBreakInterval && (
                  <div className="ml-6 pt-2">
                    <Label htmlFor="long-break-interval">Long break after this many sessions:</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        id="long-break-interval"
                        value={[settings.longBreakInterval || 4]}
                        min={2}
                        max={8}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => updateSettings({ longBreakInterval: value[0] })}
                      />
                      <span className="w-16 text-center">{settings.longBreakInterval || 4}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} /> Data Management
                </CardTitle>
                <CardDescription>Export and import your study data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={exportData}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download size={16} /> Export All Data
                  </Button>
                  
                  <label className="cursor-pointer">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => document.getElementById('import-data')?.click()}
                    >
                      <Upload size={16} /> Import Data
                    </Button>
                    <input 
                      type="file" 
                      id="import-data"
                      onChange={importData}
                      className="hidden"
                      accept=".json,application/json"
                    />
                  </label>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Exports/imports all data including tasks, sessions, settings, notes, and goals.
                </p>
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Auto-Backup</h4>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex justify-between">
                      <span>Backup Interval (minutes)</span>
                      <span>{autoBackupInterval}</span>
                    </div>
                    <Slider
                      value={[autoBackupInterval]}
                      min={1}
                      max={60}
                      step={1}
                      onValueChange={(value) => updateAutoBackupInterval(value[0])}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your data is automatically backed up to browser storage every {autoBackupInterval} minutes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Data Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Data Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Your data is stored locally on your device and is not sent to any server.
                  Exporting your data regularly is recommended to prevent data loss.
                </p>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="analytics-opt-out" 
                    checked={settings.analyticsOptOut ?? false}
                    onCheckedChange={(checked) => updateSettings({ analyticsOptOut: checked })}
                  />
                  <Label htmlFor="analytics-opt-out">Opt out of anonymous usage analytics</Label>
                </div>
                
                <Button 
                  variant="outline" 
                  className="text-red-500"
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all your data? This cannot be undone!")) {
                      localStorage.clear();
                      toast({
                        title: "Data Cleared",
                        description: "All data has been removed. The page will refresh.",
                      });
                      setTimeout(() => window.location.reload(), 2000);
                    }
                  }}
                >
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}