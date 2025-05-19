export const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "It always seems impossible until it's done.",
  "You don't have to be great to start, but you have to start to be great.",
  "The expert in anything was once a beginner.",
  "Dreams don't work unless you do.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "The best way to predict the future is to create it.",
  "The only place where success comes before work is in the dictionary.",
  "If you're going through hell, keep going.",
  "Hard work beats talent when talent doesn't work hard.",
  "You are never too old to set another goal or to dream a new dream.",
  "Never give up on a dream just because of the time it will take to accomplish it.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts."
];

export const soundOptions = {
  "bell": "🔔 Bell",
  "chime": "🎐 Chime",
  "digital": "📱 Digital Alert",
  "notification": "💬 Notification",
  "custom": "🎵 Custom Sound"
};

export const ambientOptions = {
  "rain": "🌧️ Rainfall",
  "forest": "🌳 Forest Ambience",
  "coffee": "☕ Coffee Shop",
  "white": "🌊 White Noise",
  "brown": "🌫️ Brown Noise",
  "none": "🔇 None"
};

export const priorityColors = {
  "High": "#EF4444",
  "Medium": "#F59E0B",
  "Low": "#3B82F6"
};

export const defaultAppSettings = {
  theme: 'light',
  fontSize: 16,
  blockedSites: [],
  customCategories: ['Math', 'Science', 'Language', 'History', 'Computer Science'],
  notificationsPermission: false,
  
  // Focus mode settings
  focusBackground: 'none',
  showFocusModeTips: true,
  fullscreenFocusMode: false,
  restrictNavigation: false,
  
  // Notification settings
  pomodoroNotifications: true,
  taskNotifications: true,
  
  // Pomodoro settings
  autoStartBreaks: true,
  autoStartWork: false,
  customLongBreakInterval: false,
  longBreakInterval: 4,
  pomodoroDefaults: {
    work: 25,
    shortBreak: 5,
    longBreak: 15
  },
  
  // Data settings
  autoBackupInterval: 5,
  analyticsOptOut: false
};

export const themeOptions = {
  'light': {
    name: 'Light',
    icon: '☀️'
  },
  'dark': {
    name: 'Dark',
    icon: '🌙'
  },
  'blue': {
    name: 'Ocean',
    icon: '🌊'
  },
  'green': {
    name: 'Forest',
    icon: '🌲'
  }
};

export const studyResources = [
  {
    title: "Effective Study Techniques",
    description: "Learn methods like spaced repetition, active recall, and the Pomodoro technique.",
    icon: "📚",
    link: "https://www.coursera.org/articles/study-techniques"
  },
  {
    title: "Memory Enhancement",
    description: "Techniques to improve memory retention and recall for better learning outcomes.",
    icon: "🧠",
    link: "https://www.health.harvard.edu/mind-and-mood/7-ways-to-keep-your-memory-sharp-at-any-age"
  },
  {
    title: "Focus & Concentration",
    description: "Methods to improve attention span and reduce distractions.",
    icon: "🎯",
    link: "https://www.verywellmind.com/how-to-improve-your-concentration-4584922"
  },
  {
    title: "Note-Taking Strategies",
    description: "Effective ways to take and organize notes for better understanding and recall.",
    icon: "📝",
    link: "https://learningcenter.unc.edu/tips-and-tools/effective-note-taking-in-class/"
  },
  {
    title: "Time Management",
    description: "Frameworks for managing your study time efficiently.",
    icon: "⏰",
    link: "https://www.mindtools.com/pages/article/newHTE_00.htm"
  },
  {
    title: "Academic Journals & Research",
    description: "Access to scholarly articles and research papers.",
    icon: "🔎",
    link: "https://scholar.google.com/"
  },
  {
    title: "Subject-Specific Resources",
    description: "Curated resources for different academic disciplines.",
    icon: "📖",
    link: "https://www.khanacademy.org/"
  },
  {
    title: "Study Group Formation",
    description: "Tips for forming and managing effective study groups.",
    icon: "👥",
    link: "https://www.thoughtco.com/how-to-form-a-study-group-3212069"
  }
];