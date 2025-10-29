import { Link, useNavigate } from "react-router-dom";
import { type ChangeEvent, useState, useEffect, useRef } from "react";
import { useSpotifyTrack } from "@/hooks/useSpotifyData";
import type { Song } from "@/types";

interface SongCardProps {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (id: number) => void;
  onUpdateProgress: (id: number, progress: number) => void;
}

function SongCard({ song, onEdit, onDelete, onUpdateProgress }: SongCardProps) {
  const navigate = useNavigate();
  const [localProgress, setLocalProgress] = useState(song.progress || 0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Use cached Spotify data
  const { data: spotifyTrack, isLoading: imageLoading } = useSpotifyTrack(
    song.title,
    song.artist
  );

  // Update local state when song prop changes
  useEffect(() => {
    setLocalProgress(song.progress || 0);
  }, [song.progress]);

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number.parseInt(e.target.value);
    setLocalProgress(newProgress); // Update UI immediately

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce: only save after user stops dragging for 500ms
    saveTimeoutRef.current = setTimeout(() => {
      onUpdateProgress(song.id, newProgress);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition flex flex-col cursor-pointer"
      onClick={() => navigate(`/song/${song.id}`)}
    >
      <div className="flex flex-1">
        {/* Album Art */}
        <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 relative">
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
        <div className="flex-1 p-3 flex flex-col">
          {/* Title, Artist and Action Buttons */}
          <div className="flex justify-between items-start gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {song.title}
              </h3>
              <Link
                to={`/artist/${encodeURIComponent(song.artist)}`}
                className="text-sm text-slate-400 hover:text-blue-400 transition block"
                onClick={(e) => e.stopPropagation()}
              >
                {song.artist}
              </Link>
              {song.tuning && song.tuning !== "Standard (E A D G B E)" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300 mt-1">
                  🎸 {song.tuning}
                </span>
              )}
            </div>

            {/* Action buttons - vertical stack */}
            <div className="flex flex-col gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(song);
                }}
                className="p-2 bg-slate-700 hover:bg-blue-600 rounded transition"
                title="Edit song"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${song.title}"?`)) {
                    onDelete(song.id);
                  }
                }}
                className="p-2 bg-slate-700 hover:bg-red-600 rounded transition"
                title="Delete song"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Links horizontal stack */}
          {(song.lessonLink ||
            song.songLinkYoutube ||
            song.songLinkSpotify ||
            song.tabsLink) && (
            <div className="flex gap-2 items-center mb-3">
              {(song.lessonLink || song.songLinkYoutube) && (
                <a
                  href={song.lessonLink || song.songLinkYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2 bg-red-500/10 hover:bg-slate-700/50 rounded-lg transition"
                  onClick={(e) => e.stopPropagation()}
                  title="YouTube"
                >
                  <svg
                    className="w-5 h-5 text-red-500 group-hover:text-slate-400 transition"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
              {song.songLinkSpotify && (
                <a
                  href={song.songLinkSpotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2 bg-green-500/10 hover:bg-slate-700/50 rounded-lg transition"
                  onClick={(e) => e.stopPropagation()}
                  title="Spotify"
                >
                  <svg
                    className="w-5 h-5 text-green-500 group-hover:text-slate-400 transition"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </a>
              )}
              {song.tabsLink && (
                <a
                  href={song.tabsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2 bg-orange-500/10 hover:bg-slate-700/50 rounded-lg transition"
                  onClick={(e) => e.stopPropagation()}
                  title="Tabs"
                >
                  <svg
                    className="w-5 h-5 text-orange-500 group-hover:text-slate-400 transition"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="15" y2="17" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* song.notes && (
        <div className="p-2 m-3 bg-slate-900 rounded text-xs text-slate-300">
          <p className="font-medium text-slate-400 mb-1">Notes:</p>
          <p className="whitespace-pre-wrap">{song.notes}</p>
        </div>
      ) */}

      {/* Progress Bar - Full Width Bottom */}
      <div className="w-full px-3 pb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-medium text-blue-400">
            {localProgress}%
          </span>
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
    </div>
  );
}

export default SongCard;
