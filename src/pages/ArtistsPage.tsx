import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useFirestoreSongs } from '@/hooks/useFirestoreSongs'
import { useSpotifyArtist } from '@/hooks/useSpotifyData'
import { getArtistImage } from '@/utils/spotify'
import type { Song } from '@/types'

function ArtistCard({ name, count }: { name: string; count: number }) {
  const { data: spotifyData, isLoading: loading } = useSpotifyArtist(name)
  
  return (
    <Link
      to={`/artist/${encodeURIComponent(name)}`}
      className="group bg-slate-800 hover:bg-slate-750 rounded-lg p-6 transition border border-slate-700 hover:border-slate-600"
    >
      <div className="w-full h-32 mb-4 rounded bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-700 animate-pulse" />
        )}
        {!loading && getArtistImage(spotifyData, 'medium') && (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${getArtistImage(spotifyData, 'medium')})` 
            }}
          />
        )}
      </div>
      <h2 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition">
        {name}
      </h2>
      <p className="text-slate-400 text-sm">
        {count} {count === 1 ? 'song' : 'songs'}
      </p>
      {spotifyData && spotifyData.genres.length > 0 && (
        <p className="text-slate-500 text-xs mt-1 truncate">
          {spotifyData.genres[0]}
        </p>
      )}
    </Link>
  )
}

function ArtistsPage() {
  const { songs } = useFirestoreSongs()
  
  const artists = useMemo(() => {
    const artistsMap = songs.reduce((acc, song) => {
      const artist = song.artist
      if (!acc[artist]) {
        acc[artist] = { name: artist, count: 0 }
      }
      acc[artist].count++
      return acc
    }, {} as Record<string, { name: string; count: number }>)
    
    return Object.values(artistsMap).sort((a, b) => 
      a.name.localeCompare(b.name)
    )
  }, [songs])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-8">
          <Link 
            to="/currently-working"
            className="text-slate-400 hover:text-white mb-4 inline-flex items-center gap-2"
          >
            ← Back to songs
          </Link>
          <h1 className="text-4xl font-bold mb-2">Artists</h1>
          <p className="text-slate-400">Browse songs by artist</p>
        </header>

        {artists.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No artists yet. Add some songs to get started!</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <ArtistCard key={artist.name} name={artist.name} count={artist.count} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtistsPage
