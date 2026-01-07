# My Daily Habits

A comprehensive habit tracking application designed to help users build and maintain positive daily routines. Track your progress with interactive calendars, detailed statistics, and insightful visualizations.

## Features

- **Multiple Habit Types**: Support for different habit tracking methods including:
  - Yes/No habits (simple completion tracking)
  - Counter habits (numerical goals)
  - Timer habits (time-based tracking)

- **Calendar Heatmap**: Visualize your habit streaks and consistency with an interactive GitHub-style calendar heatmap

- **Detailed Statistics**: Comprehensive stats including completion rates, streaks, and productivity graphs

- **Year Review**: Annual summary of your habit progress and achievements

- **Monthly Summaries**: Monthly breakdowns of habit performance

- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

- **Data Persistence**: Local storage for habit data (future updates may include cloud sync)

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Package Manager**: Bun

## Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm, yarn, or bun package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lovable-s-creation/my-daily-habits.git
   cd my-daily-habits
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun run dev
   ```

4. **Open your browser**

   Navigate to `http://localhost:5173` to view the application.

## Usage

### Adding a Habit

1. Click the "Add Habit" button on the main page
2. Choose your habit type (Yes/No, Counter, or Timer)
3. Set the habit name, description, and specific parameters
4. Save to start tracking

### Tracking Progress

- **Yes/No Habits**: Simply mark as completed each day
- **Counter Habits**: Increment the counter as you perform the habit
- **Timer Habits**: Start/stop timers to track time spent

### Viewing Statistics

- Navigate to the "Stats" page for detailed analytics
- View calendar heatmaps for visual progress
- Check productivity graphs and completion rates

### Year Review

- Access the "Year Review" page for annual summaries
- See your overall progress and achievements

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AddHabitModal.tsx
│   ├── CalendarHeatmap.tsx
│   ├── HabitList.tsx
│   └── ...
├── pages/              # Main application pages
│   ├── Index.tsx
│   ├── Stats.tsx
│   └── YearReview.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── ...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components powered by [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
