import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useFirestoreSongs } from '@/hooks/useFirestoreSongs'
import { useSpotifyTrack } from '@/hooks/useSpotifyData'
import { useSongStore } from '@/store/useSongStore'
import SongForm from '@/components/SongForm'
import type { Song } from '@/types'

function SongPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { songs, loading, updateSong: updateSongInFirestore, deleteSong: deleteSongFromFirestore } = useFirestoreSongs()
  const { showForm, editingSong, openEditForm, closeForm } = useSongStore()
  const song = songs.find(s => s.id === id)
  const [localProgress, setLocalProgress] = useState(song?.progress || 0)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Use TanStack Query for Spotify data caching
  const { data: spotifyTrack, isLoading: imageLoading } = useSpotifyTrack(
    song?.title || '',
    song?.artist || ''
  )

  // Update local state when song changes
  useEffect(() => {
    setLocalProgress(song?.progress || 0)
  }, [song?.progress])

  const updateSong = async (updatedSong: Song) => {
    const { id, ...updates } = updatedSong
    await updateSongInFirestore(String(id), updates)
    closeForm()
  }

  const deleteSong = async () => {
    if (confirm(`Delete "${song?.title}"?`)) {
      await deleteSongFromFirestore(String(song?.id))
      navigate('/currently-working')
    }
  }

  const updateProgress = (progress: number) => {
    setLocalProgress(progress) // Update UI immediately
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Debounce: only save after user stops dragging for 500ms
    saveTimeoutRef.current = setTimeout(() => {
      if (song) {
        updateSongInFirestore(String(song.id), { progress })
      }
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

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Extract Spotify track ID from URL
  const getSpotifyId = (url: string) => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  }

  // Check if URL is Ultimate Guitar
  const isUltimateGuitar = (url: string) => {
    return url.includes('ultimate-guitar.com') || url.includes('tabs.ultimate-guitar.com')
  }

  // Only show loading if we have no data at all (not cached)
  if (loading && songs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Song not found</h1>
          <Link to="/currently-working" className="text-blue-400 hover:text-blue-300">
            ← Back to songs
          </Link>
        </div>
      </div>
    )
  }

  const youtubeId = song.lessonLink ? getYouTubeId(song.lessonLink) : (song.songLinkYoutube ? getYouTubeId(song.songLinkYoutube) : null)
  const additionalYoutubeIds = song.lessonLinks?.map(link => ({ id: getYouTubeId(link.url), label: link.label })).filter(item => item.id) || []
  const spotifyId = song.songLinkSpotify ? getSpotifyId(song.songLinkSpotify) : null

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero section with album art */}
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900">
        {spotifyTrack?.albumImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl"
            style={{ backgroundImage: `url(${spotifyTrack.albumImage})` }}
          />
        )}
        
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <Link 
            to="/currently-working"
            className="text-slate-400 hover:text-white mb-4 inline-flex items-center gap-2"
          >
            ← Back to songs
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start mt-4">
            {/* Album Art */}
            <div className="w-full md:w-64 h-64 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden shadow-2xl">
              {imageLoading && (
                <div className="w-full h-full bg-slate-700 animate-pulse" />
              )}
              {!imageLoading && spotifyTrack?.albumImage && (
                <img 
                  src={spotifyTrack.albumImage} 
                  alt={`${song.title} album art`}
                  className="w-full h-full object-cover"
                />
              )}
              {!imageLoading && !spotifyTrack?.albumImage && (
                <div className="w-full h-full flex items-center justify-center text-6xl text-slate-600">
                  🎵
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{song.title}</h1>
              <Link 
                to={`/artist/${encodeURIComponent(song.artist)}`}
                className="text-2xl text-slate-400 hover:text-blue-400 transition inline-block mb-3"
              >
                {song.artist}
              </Link>
              
              {song.tuning && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-lg text-sm mb-4 ml-3">
                  🎸 {song.tuning}
                </div>
              )}

              {spotifyTrack && (
                <p className="text-slate-400 mb-4">Album: {spotifyTrack.albumName}</p>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Learning Progress</span>
                  <span className="text-lg font-bold text-blue-400">{localProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localProgress}
                  onChange={(e) => updateProgress(Number.parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => openEditForm(song)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={deleteSong}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Links */}
        {(song.lessonLink || song.lessonLinks?.length || song.songLinkYoutube || song.songLinkSpotify || song.tabsLink || song.tabsLinks?.length) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Resources</h2>
            <div className="flex flex-wrap gap-3">
              {song.lessonLink && (
                <a
                  href={song.lessonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                >
                  📺 Lesson Video
                </a>
              )}
              {song.lessonLinks?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                >
                  📺 {link.label}
                </a>
              ))}
              {song.songLinkYoutube && (
                <a
                  href={song.songLinkYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                >
                  🎵 YouTube
                </a>
              )}
              {song.songLinkSpotify && (
                <a
                  href={song.songLinkSpotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2"
                >
                  🎵 Spotify
                </a>
              )}
              {song.tabsLink && (
                <a
                  href={song.tabsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition flex items-center gap-2"
                >
                  📄 Tabs/Chords
                </a>
              )}
              {song.tabsLinks?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition flex items-center gap-2"
                >
                  📄 {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Embedded Media */}
        <div className="space-y-6 mb-8">
          {/* Main YouTube Embed */}
          {youtubeId && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {song.lessonLink && getYouTubeId(song.lessonLink) === youtubeId ? 'Main Lesson Video' : 'Song Video'}
              </h2>
              <div className="relative pb-[56.25%] h-0 bg-slate-800 rounded-lg overflow-hidden">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Additional YouTube Embeds */}
          {additionalYoutubeIds.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {additionalYoutubeIds.map((item, index) => (
                <div key={index}>
                  <h2 className="text-2xl font-bold mb-4">{item.label}</h2>
                  <div className="relative pb-[56.25%] h-0 bg-slate-800 rounded-lg overflow-hidden">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${item.id}`}
                      title={`${item.label} video player`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Spotify Embed */}
          {spotifyId && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Listen on Spotify</h2>
              <div className="bg-slate-800 rounded-lg overflow-hidden" style={{ height: '352px' }}>
                <iframe
                  className="w-full h-full"
                  src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator`}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs - Ultimate Guitar and others */}
        {(song.tabsLink || Boolean(song.tabsLinks?.length) || song.tabsPdfUrl) && (
          <div className="mb-8 space-y-6">
            {/* PDF Viewer */}
            {song.tabsPdfUrl && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Tabs PDF</h2>
                <div className="bg-slate-800 rounded-lg overflow-hidden" style={{ height: '800px' }}>
                  <iframe
                    src={song.tabsPdfUrl}
                    className="w-full h-full"
                    title="Tabs PDF"
                  />
                </div>
              </div>
            )}
            
            {song.tabsLink && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Tabs & Chords</h2>
                <div className="bg-slate-800 rounded-lg p-6 text-center border-2 border-slate-700">
                  <p className="text-slate-400 mb-4">
                    {isUltimateGuitar(song.tabsLink) ? 'Ultimate Guitar tabs work best in their own tab' : 'Tabs are best viewed on the original site'}
                  </p>
                  <a
                    href={song.tabsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-lg font-medium"
                  >
                    📄 Open Tabs in Ultimate Guitar
                  </a>
                </div>
              </div>
            )}
            {song.tabsLinks?.map((link, index) => (
              <div key={index}>
                <h2 className="text-2xl font-bold mb-4">{link.label}</h2>
                <div className="bg-slate-800 rounded-lg p-6 text-center border-2 border-slate-700">
                  <p className="text-slate-400 mb-4">
                    {isUltimateGuitar(link.url) ? 'Ultimate Guitar tabs work best in their own tab' : `${link.label} tabs are best viewed on the original site`}
                  </p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-lg font-medium"
                  >
                    📄 Open {link.label}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {song.notes && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Notes</h2>
            <div className="p-6 bg-slate-800 rounded-lg">
              <p className="whitespace-pre-wrap text-slate-300">{song.notes}</p>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <SongForm
          song={editingSong}
          onSubmit={updateSong}
          onCancel={closeForm}
        />
      )}
    </div>
  )
}

export default SongPage
