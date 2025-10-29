import { Link, useNavigate } from 'react-router-dom'
import { type ChangeEvent, useState, useEffect, useRef } from 'react'
import { useSpotifyTrack } from '@/hooks/useSpotifyData'
import type { Song } from '@/types'

interface SongCardProps {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (id: number) => void;
  onUpdateProgress: (id: number, progress: number) => void;
}

function SongCard({ song, onEdit, onDelete, onUpdateProgress }: SongCardProps) {
  const navigate = useNavigate()
  const [localProgress, setLocalProgress] = useState(song.progress || 0)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  
  // Use cached Spotify data
  const { data: spotifyTrack, isLoading: imageLoading } = useSpotifyTrack(song.title, song.artist)

  // Update local state when song prop changes
  useEffect(() => {
    setLocalProgress(song.progress || 0)
  }, [song.progress])

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number.parseInt(e.target.value)
    setLocalProgress(newProgress) // Update UI immediately
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Debounce: only save after user stops dragging for 500ms
    saveTimeoutRef.current = setTimeout(() => {
      onUpdateProgress(song.id, newProgress)
    }, 500)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition flex flex-col md:flex-row relative group cursor-pointer" onClick={() => navigate(`/song/${song.id}`)}>
      {/* Action buttons - top right */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(song)
          }}
          className="p-2 bg-slate-700/80 hover:bg-blue-600 rounded-full transition backdrop-blur-sm"
          title="Edit song"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm(`Delete "${song.title}"?`)) {
              onDelete(song.id)
            }
          }}
          className="p-2 bg-slate-700/80 hover:bg-red-600 rounded-full transition backdrop-blur-sm"
          title="Delete song"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Album Art */}
      <div className="w-full md:w-40 h-40 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-slate-700 animate-pulse" />
        )}
        {!imageLoading && spotifyTrack?.albumImage && (
          <img 
            src={spotifyTrack.albumImage} 
            alt={`${song.title} album art`}
            className="w-full h-full object-cover"
          />
        )}
        {!imageLoading && !spotifyTrack?.albumImage && (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-slate-600">
            🎵
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pr-20">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white">{song.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Link 
              to={`/artist/${encodeURIComponent(song.artist)}`}
              className="text-slate-400 hover:text-blue-400 transition"
              onClick={(e) => e.stopPropagation()}
            >
              {song.artist}
            </Link>
            {song.tuning && song.tuning !== 'Standard (E A D G B E)' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                🎸 {song.tuning}
              </span>
            )}
          </div>
        </div>

          <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-medium text-blue-400">{localProgress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localProgress}
            onChange={handleProgressChange}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {(song.lessonLink || song.lessonLinks?.length || song.songLinkYoutube || song.songLinkSpotify || song.tabsLink || song.tabsLinks?.length) && (
          <div className="mb-4 flex flex-wrap gap-2">
          {song.lessonLink && (
            <a
              href={song.lessonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full transition"
              onClick={(e) => e.stopPropagation()}
            >
              📺 Lesson
            </a>
          )}
          {song.lessonLinks?.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full transition"
              onClick={(e) => e.stopPropagation()}
            >
              📺 {link.label}
            </a>
          ))}
          {song.songLinkYoutube && (
            <a
              href={song.songLinkYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full transition"
              onClick={(e) => e.stopPropagation()}
            >
              🎵 YouTube
            </a>
          )}
          {song.songLinkSpotify && (
            <a
              href={song.songLinkSpotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 rounded-full transition"
              onClick={(e) => e.stopPropagation()}
            >
              🎵 Spotify
            </a>
          )}
          {song.tabsLink && (
            <a
              href={song.tabsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded-full transition"
              onClick={(e) => e.stopPropagation()}
            >
              📄 Tabs
            </a>
          )}
          {song.tabsLinks?.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded-full transition"
              onClick={(e) => e.stopPropagation()}
            >
              📄 {link.label}
            </a>
          ))}
        </div>
      )}

      {song.notes && (
        <div className="p-3 bg-slate-900 rounded text-sm text-slate-300">
          <p className="font-medium text-slate-400 mb-1">Notes:</p>
          <p className="whitespace-pre-wrap">{song.notes}</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default SongCard
