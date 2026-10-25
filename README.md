# 🎓 CampusFlow — Student Productivity & Study OS

> A sleek, distraction-free academic workspace built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. Designed for students to manage coursework deadlines, structure study sessions, run Pomodoro focus sprints, capture lecture notes, and track weekly productivity.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)

---

## ✨ Features

- **📊 Comprehensive Dashboard**
  - Instant overview of today's pending tasks, urgent upcoming deadlines, and study streaks.
  - Interactive **Weekly Progress Visualization** displaying daily focus minutes and tasks accomplished over the last 7 days.
  - Cognitive science-backed study tips (Active Recall, Spaced Repetition, Feynman Technique).

- **✅ Academic Task Manager**
  - Full CRUD for assignments, problem sets, and milestones.
  - Multi-criteria filtering by completion status, enrolled course, priority level (Urgent, High, Medium, Low), and search keywords.
  - Relative due date badges (`Due Today`, `Tomorrow`, `3d overdue`).
  - Estimated study minutes per assignment.

- **📅 Structured Study Planner**
  - Schedule time-blocked study sessions by subject, date, and duration.
  - Visual workload distribution bar showing credit/hour allocations across courses.
  - One-click **"Start Focus"** transition into the Pomodoro timer with pre-selected subjects.

- **⏱️ Configurable Focus Timer**
  - Deep Work intervals (Focus, Short Break, Long Break) with circular SVG progress animation.
  - Audio chimes powered by the browser's native **Web Audio API** (no external audio files or network requests needed).
  - Subject tagging to log focus hours directly to specific enrolled courses.
  - Session history and daily focus milestone tracking.

- **📝 Quick Notes & Formula Bank**
  - Pin important formulas, lecture summaries, or exam checklists to the top.
  - Subject tagging, search across titles and body text, and one-click copy to clipboard.

- **🎨 Subject & Course Management**
  - Add, edit, and organize semester courses with course codes (e.g., CS 201, MATH 240) and credit counts.
  - Curated color palette markers to color-code tasks, study blocks, and notes.

- **⚙️ Settings & Privacy-First Data Management**
  - Personalize student name, university, major, and term.
  - Custom focus durations and break cycles.
  - **100% Client-Side Local Storage**: All data stays private in your browser (`localStorage`). No external database, tracking, or paid API keys required.
  - Export full JSON backups, restore from backups, or reset to rich sample study data anytime.

---

## 🗂️ Project Architecture & Folder Structure

For beginners exploring this codebase, here is an explanation of how the files and directories are organized:

```
campusflow/
├── index.html                   # HTML entry point with web fonts & metadata
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler and Tailwind configuration
└── src/
    ├── main.tsx                 # React application mounting point
    ├── App.tsx                  # Root layout, navigation router & view controller
    ├── index.css                # Global styles, Tailwind imports, and dark theme
    ├── types/
    │   └── index.ts             # TypeScript interfaces (Task, Subject, StudySession, Note)
    ├── utils/
    │   ├── dateUtils.ts         # Relative date calculations, calendar & time math
    │   ├── sound.ts             # Native Web Audio API chime synthesizers
    │   └── storage.ts           # LocalStorage CRUD, seed datasets & backup exports
    ├── context/
    │   └── AppContext.tsx       # Central React State Provider managing all entities
    └── components/
        ├── common/
        │   ├── ConfirmModal.tsx # Reusable accessible confirmation dialogs
        │   └── ToastContainer.tsx # Unobtrusive action notifications
        ├── navigation/
        │   ├── Sidebar.tsx      # Desktop navigation sidebar with live counters
        │   └── MobileNavbar.tsx # Mobile top header, drawer menu & bottom bar
        ├── dashboard/
        │   └── DashboardView.tsx # Analytics, 7-day progress chart & urgent tasks
        ├── tasks/
        │   ├── TaskManagerView.tsx # Filterable task table & status controllers
        │   └── TaskModal.tsx    # Accessible modal for creating & editing tasks
        ├── planner/
        │   ├── StudyPlannerView.tsx # Workload allocation bar & schedule blocks
        │   └── StudySessionModal.tsx # Modal for scheduling study sessions
        ├── timer/
        │   └── FocusTimerView.tsx # Circular Pomodoro focus timer with audio cues
        ├── notes/
        │   ├── QuickNotesView.tsx # Pinned note board with search & copy features
        │   └── NoteModal.tsx    # Modal for writing notes & tagging subjects
        ├── subjects/
        │   ├── SubjectsView.tsx # Course catalog, credit tally & subject stats
        │   └── SubjectModal.tsx # Modal for adding courses and custom colors
        └── settings/
            └── SettingsView.tsx # Profile customization, timer defaults & backups
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0.0 or later)
- `npm`, `yarn`, or `pnpm`

### Installation

1. **Clone or download the repository:**
   ```bash
   git clone https://github.com/your-username/campusflow.git
   cd campusflow
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## 🛠️ Build & Production

To generate an optimized production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

To verify TypeScript code quality:

```bash
npm run lint
```

---

## 🌐 Free Static Deployment Guide

CampusFlow is a static single-page web app with zero backend dependencies. You can deploy it for free in minutes:

### Option A: Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Click **Deploy**.

### Option B: Netlify

1. Push your code to GitHub.
2. Sign in to [netlify.com](https://netlify.com) and select **"Add new site" > "Import an existing project"**.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy Site**.

### Option C: GitHub Pages

1. In `vite.config.ts`, set `base: '/<repository-name>/'` (if deploying to a subpath).
2. Install `gh-pages` or use the standard GitHub Actions workflow for Vite:
   Create `.github/workflows/deploy.yml` with the official GitHub Pages action for Node.js.

---

## 🔒 Data & Privacy

- **Zero Remote Tracking:** No user cookies, tracking pixels, or telemetry.
- **Offline Capable:** Works without an active internet connection once loaded.
- **Data Portability:** Easily download your data as `.json` under **Settings > Export Local Backup** to migrate between browsers or save periodic checkpoints.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
