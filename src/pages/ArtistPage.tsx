import { useParams, Link } from 'react-router-dom'
import { useFirestoreSongs } from '@/hooks/useFirestoreSongs'
import { useSpotifyArtist } from '@/hooks/useSpotifyData'
import SongCard from '@/components/SongCard'
import SongForm from '@/components/SongForm'
import { useSongStore } from '@/store/useSongStore'
import { getArtistImage } from '@/utils/spotify'
import type { Song } from '@/types'

function ArtistPage() {
  const { artist } = useParams<{ artist: string }>()
  const { songs, updateSong: updateSongInFirestore, deleteSong: deleteSongFromFirestore } = useFirestoreSongs()
  const { showForm, editingSong, openEditForm, closeForm } = useSongStore()
  
  const decodedArtist = decodeURIComponent(artist || '')
  const artistSongs = songs.filter(s => s.artist.toLowerCase() === decodedArtist.toLowerCase())
  
  // Use TanStack Query for Spotify data caching
  const { data: spotifyArtist, isLoading: imageLoading } = useSpotifyArtist(decodedArtist)
  
  const updateSong = async (updatedSong: Song) => {
    const { id, ...updates } = updatedSong
    await updateSongInFirestore(String(id), updates)
    closeForm()
  }
  
  const deleteSong = async (id: number | string) => {
    await deleteSongFromFirestore(String(id))
  }

  const updateProgress = async (id: number | string, progress: number) => {
    await updateSongInFirestore(String(id), { progress })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero section with backdrop */}
      <div 
        className="relative h-64 md:h-96 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden"
      >
        {/* Backdrop image */}
        {!imageLoading && getArtistImage(spotifyArtist, 'large') && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ 
              backgroundImage: `url(${getArtistImage(spotifyArtist, 'large')})` 
            }}
          />
        )}
        
        {imageLoading && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        
        {/* Content */}
        <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-8">
          <Link 
            to="/currently-working"
            className="text-slate-400 hover:text-white mb-4 inline-flex items-center gap-2"
          >
            ← Back to songs
          </Link>
          <h1 className="text-5xl md:text-7xl font-bold mb-2">{decodedArtist}</h1>
          <p className="text-slate-400 text-lg">
            {artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}
          </p>
          {spotifyArtist && spotifyArtist.genres.length > 0 && (
            <p className="text-slate-500 text-sm mt-1">
              {spotifyArtist.genres.slice(0, 3).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Songs list */}
      <div className="max-w-6xl mx-auto p-4">
        {artistSongs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No songs found for this artist.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {artistSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onEdit={openEditForm}
                onDelete={deleteSong}
                onUpdateProgress={updateProgress}
              />
            ))}
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

export default ArtistPage
