# Quick Start Guide

## 🚀 Ready to Go!

Your Guitar Learning Tracker is set up and ready to use.

### Start Development

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

### Project Features

✅ React 19 with Vite
✅ Tailwind CSS for styling
✅ Biome for linting/formatting
✅ PWA-ready with manifest.json
✅ LocalStorage persistence
✅ Mobile-friendly responsive design

### Components Overview

- **SongCard**: Individual song display with progress slider and links
- **SongForm**: Add/edit songs with all metadata
- **SongList**: Grid layout of all songs in current category

### Hooks

- **useLocalStorage**: Persistent state management

### Next Steps

1. Run `npm run dev` to start coding
2. Add more components in `src/components/`
3. Add custom hooks in `src/hooks/`
4. Add utilities in `src/utils/`
5. Create page components in `src/pages/`

### PWA Setup (Optional)

To make this a full PWA with offline support:

```bash
npm install -D vite-plugin-pwa workbox-window
```

Then uncomment PWA plugin in `vite.config.js` and add service worker registration.

### Build for Production

```bash
npm run build
npm run preview
```

The built files will be in the `dist/` directory.

### Code Quality

```bash
npm run lint      # Check code
npm run format    # Format code
```

Happy coding! 🎸
