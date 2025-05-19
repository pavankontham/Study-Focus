export const motivationalQuotes = [
  "The secret of getting ahead is getting started. – Mark Twain",
  "You don't have to be great to start, but you have to start to be great. – Zig Ziglar",
  "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Focus on being productive instead of busy. – Tim Ferriss",
  "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
  "The future depends on what you do today. – Mahatma Gandhi",
  "It always seems impossible until it's done. – Nelson Mandela",
  "Your time is limited, don't waste it living someone else's life. – Steve Jobs",
  "The best way to predict the future is to create it. – Abraham Lincoln",
];

export const soundOptions = {
  alarm: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
  chime: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  bell: 'https://actions.google.com/sounds/v1/alarms/bell_ringing_04.ogg',
};

export const ambientOptions = {
  rain: 'https://actions.google.com/sounds/v1/weather/rain_light_loop.ogg',
  coffee: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
  whiteNoise: 'https://actions.google.com/sounds/v1/ambiences/white_noise.ogg',
  forest: 'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg',
  ocean: 'https://actions.google.com/sounds/v1/water/ocean_shore.ogg',
};

export const priorityColors = {
  High: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-300 dark:border-red-700',
  },
  Medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  Low: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-300 dark:border-green-700',
  },
};

export const defaultAppSettings = {
  theme: 'light' as const,
  fontSize: 16,
  blockedSites: [],
  customCategories: ['Study', 'Work', 'Personal', 'Exercise', 'Reading'],
  notificationsPermission: false,
};

export const themeOptions = {
  light: {
    name: 'Light',
    icon: '☀️',
    className: 'light'
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    className: 'dark'
  },
  blue: {
    name: 'Blue',
    icon: '🔵',
    className: 'blue'
  },
  green: {
    name: 'Green',
    icon: '🟢',
    className: 'green'
  }
};

export const studyResources = [
  { 
    name: 'Notion',
    description: 'All-in-one workspace for notes, tasks, wikis, and databases',
    url: 'https://www.notion.so/',
    icon: '📝'
  },
  { 
    name: 'Quizlet',
    description: 'Flashcards and study tools for effective learning',
    url: 'https://quizlet.com/',
    icon: '🔄'
  },
  { 
    name: 'Khan Academy',
    description: 'Free courses across various subjects',
    url: 'https://www.khanacademy.org/',
    icon: '🎓'
  },
  { 
    name: 'Crash Course',
    description: 'Educational YouTube series',
    url: 'https://www.youtube.com/c/crashcourse',
    icon: '📚'
  },
  { 
    name: 'CS50',
    description: 'Harvard\'s introduction to computer science',
    url: 'https://cs50.harvard.edu/x/',
    icon: '💻'
  },
  { 
    name: 'Coursera',
    description: 'Online courses from top universities',
    url: 'https://www.coursera.org/',
    icon: '🌐'
  },
];
