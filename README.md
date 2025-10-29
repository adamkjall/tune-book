# 🎸 Guitar Learning Tracker

A Progressive Web App (PWA) for tracking your guitar learning journey.

## Features

- **Song Management**: Add, edit, and delete songs you're learning
- **Progress Tracking**: Visual slider to track your learning progress for each song
- **Categories**: Organize songs into "Currently Working", "Backlog", and "Learned"
- **Links**: Store YouTube lessons, song links (YouTube/Spotify), tabs/chords
- **Notes**: Keep notes about tuning, gotchas, and tips
- **PWA**: Installable on mobile devices with native app feel
- **Local Storage**: All data stored locally in your browser

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Biome** - Linting and formatting
- **vite-plugin-pwa** - PWA support

## Project Structure

```
src/
├── components/     # React components
│   ├── SongCard.jsx
│   ├── SongForm.jsx
│   └── SongList.jsx
├── hooks/          # Custom React hooks
│   └── useLocalStorage.js
├── pages/          # Page components (future use)
├── utils/          # Utility functions (future use)
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Usage

1. Click "Add New Song" to add a song you're learning
2. Fill in the details: title, artist, links, notes
3. Use the progress slider to track how well you've learned the song
4. Switch between categories to organize your songs
5. Edit or delete songs as needed

## PWA Installation

On mobile devices, you can install this app:
- iOS: Tap Share button → Add to Home Screen
- Android: Tap menu → Install App

The app works offline once installed!
