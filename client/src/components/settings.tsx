import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { safeLocalStorage } from "@/lib/local-storage";
import { AppSettings } from "@/types";
import { defaultAppSettings, themeOptions } from "@/lib/constants";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Download, Upload, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsProps {
  darkMode: boolean;
  setAppSettings: (settings: AppSettings) => void;
  settings: AppSettings;
}

export default function Settings({ darkMode, settings, setAppSettings }: SettingsProps) {
  const [newBlockedSite, setNewBlockedSite] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [siteError, setSiteError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const updateSettings = (updatedSettings: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updatedSettings };
    setAppSettings(newSettings);
    safeLocalStorage.setItem('appSettings', newSettings);
  };

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

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    
    const permission = await Notification.requestPermission();
    updateSettings({
      notificationsPermission: permission === "granted"
    });
  };

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
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('Please upload a JSON file.');
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
        
        alert('Data successfully imported! Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        <div className="space-y-8">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Theme</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(themeOptions).map(([key, theme]) => (
                <Button
                  key={key}
                  onClick={() => updateSettings({ theme: key as any })}
                  variant={settings.theme === key ? "default" : "outline"}
                  className={`flex items-center gap-2 ${darkMode && settings.theme !== key ? 'border-gray-600' : ''}`}
                >
                  <span>{theme.icon}</span> {theme.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Font Size */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Font Size</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Small</span>
                <span>{settings.fontSize}px</span>
                <span>Large</span>
              </div>
              <Slider
                value={[settings.fontSize]}
                min={12}
                max={24}
                step={1}
                onValueChange={(value) => updateSettings({ fontSize: value[0] })}
              />
            </div>
          </div>
          
          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="flex items-center gap-2">
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
          </div>
          
          {/* Blocked Sites */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Blocked Sites (Focus Mode)</h3>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                placeholder="e.g., facebook.com"
                value={newBlockedSite}
                onChange={(e) => setNewBlockedSite(e.target.value)}
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
              />
              <Button onClick={addBlockedSite} className="flex items-center gap-1">
                <Plus size={16} /> Add
              </Button>
            </div>
            
            {siteError && (
              <div className="text-red-500 mb-2">{siteError}</div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.blockedSites.map((site, index) => (
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
              ))}
              {settings.blockedSites.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No blocked sites. Add sites to block during focus mode.
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Note: Blocking requires a browser extension to fully function.
            </p>
          </div>
          
          {/* Custom Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Custom Task Categories</h3>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                placeholder="e.g., Math, Computer Science"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
              />
              <Button onClick={addCategory} className="flex items-center gap-1">
                <Plus size={16} /> Add
              </Button>
            </div>
            
            {categoryError && (
              <div className="text-red-500 mb-2">{categoryError}</div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.customCategories.map((category, index) => (
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
              ))}
            </div>
          </div>
          
          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Exports/imports all data including tasks, sessions, settings, notes, and goals.
            </p>
          </div>
          
          {/* Focus Mode Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Focus Mode Settings</h3>
            <div className="flex items-center space-x-2">
              <Switch id="focus-mode-tips" />
              <Label htmlFor="focus-mode-tips">Show motivational tips in focus mode</Label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Coming soon: Additional focus mode features and customization options.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}