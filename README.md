# Ultimate Study Focus Suite

The **Ultimate Study Focus Suite** is a streamlined, browser-based productivity application designed for students to enhance focus and manage study tasks efficiently. It provides a distraction-free experience with powerful tools like a customizable Pomodoro timer, task manager, interactive calendar, and progress dashboard. Integrated with YouTube playlists and ambient sounds for motivation, the app runs seamlessly either locally or via a hosted link at [https://study-focus-gcf6.onrender.com](https://study-focus-gcf6.onrender.com).

---

## Features

### General Features

- **Tab Navigation**: Seamlessly switch between Pomodoro, Tasks, Calendar, and Progress tabs with accessible buttons.
- **Responsive Design**: Adapts to mobile and desktop screens for a consistent experience.
- **Error Handling**: Displays user-friendly error messages with detailed logs for troubleshooting.
- **Loading State**: Indicates "Loading…" while retrieving tasks, ensuring a smooth startup.
- **Local Storage**: Persists tasks and settings securely in the browser.
- **Accessibility**: Includes labels and semantic structure for screen reader compatibility.
- **Task Categories**: Organize tasks into categories (e.g., Math, Science) with filtering options.

![image](https://github.com/user-attachments/assets/72aa003e-194f-4708-bbe6-649bc18d1266)


---

### Pomodoro Timer

- **Customizable Timer**: Adjust work (default 25 min) and break (default 5 min) durations with automatic session toggling.
- **Timer Controls**: Start, pause, reset, or skip to the next session.
- **Sound Feedback**: Plays an alarm at session end with a toggle option.
- **Ambient Sounds**: Offers background sounds (rain, lo-fi, forest) during sessions, selectable from three presets.
- **Notifications**: Sends browser notifications when sessions end, if permitted.
- **Task Integration**: Links tasks to sessions, displaying titles, playlists, and session counts.
- **UI**: Clean, centered layout with intuitive blue buttons.

![image](https://github.com/user-attachments/assets/78f82a0e-d860-46a7-984b-9bb7d1d92106)


---

### Tasks

- **Task Creation**: Add tasks with titles, optional YouTube playlists, and categories; includes input validation.
- **Task Properties**: Tracks ID, title, date, completion status, session count, playlist, and category.
- **Task Actions**: Mark tasks as complete, delete them, or open playlists in a new tab.
- **Sorting and Filtering**: Sort by date, title, or category; filter by category or completion status.
- **UI**: Organized list with red action links for easy interaction.

![image](https://github.com/user-attachments/assets/bff447b8-2f7e-4cd2-8376-49c82cd226ea)


---

### Calendar

- **Monthly Calendar**: Displays tasks in a monthly view with adjustable height.
- **Task Scheduling**: Add tasks by clicking dates, with prompts for details and validation.
- **Drag-and-Drop**: Reschedule tasks by dragging them to new dates.
- **Event Styling**: Highlights completed tasks in green, incomplete in blue, with category and playlist indicators.
- **Category Filtering**: Filter calendar tasks by category or view all.
- **UI**: Wide, clean layout for optimal visibility.

  ![image](https://github.com/user-attachments/assets/861e9671-d4b4-44af-a652-6c05b27ba523)


---

### Progress Dashboard

- **Session Tracking**: Shows total sessions and time spent per task or category.
- **Visual Summary**: Presents a bar chart of sessions by date or category with distinct colors.
- **UI**: Compact layout accessible via the Progress tab.

![image](https://github.com/user-attachments/assets/597bb07d-515a-4ff8-afc2-79f426058aa5)


---

## Tech Stack

- **Frontend**: Express + Vite/React
- **Styling**: Tailwind CSS (locally processed)
- **Storage**: Browser LocalStorage
- **Deployment**: Hosted on Render

---
