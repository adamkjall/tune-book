import { useParams, Link } from 'react-router-dom'
import SongList from '@/components/SongList'
import SongForm from '@/components/SongForm'
import CategoryTabs from '@/components/CategoryTabs'
import { useFirestoreSongs } from '@/hooks/useFirestoreSongs'
import { useSongStore } from '@/store/useSongStore'
import type { Song, Category } from '@/types'

function App() {
  const { category = 'currently-working' } = useParams<{ category?: Category }>()
  const { songs, addSong: addSongToFirestore, updateSong: updateSongInFirestore, deleteSong: deleteSongFromFirestore } = useFirestoreSongs()
  const { showForm, editingSong, openForm, openEditForm, closeForm } = useSongStore()

  const addSong = async (song: Song) => {
    const { id, ...songData } = song
    await addSongToFirestore(songData as any)
    closeForm()
  }

  const updateSong = async (updatedSong: Song) => {
    const { id, ...updates } = updatedSong
    await updateSongInFirestore(String(id), updates)
    closeForm()
  }

  const deleteSong = async (id: number) => {
    await deleteSongFromFirestore(String(id))
  }

  const filteredSongs = songs.filter(s => s.category === category)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">🎸 Guitar Learning Tracker</h1>
          <p className="text-slate-400 text-center">Track your guitar journey</p>
          <div className="flex justify-center mt-4">
            <Link 
              to="/artists"
              className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2"
            >
              <span>👥</span> Browse by Artist
            </Link>
          </div>
        </header>

        <CategoryTabs />

        {!showForm && (
          <button
            onClick={openForm}
            className="w-full mb-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            + Add New Song
          </button>
        )}

        {showForm && (
          <SongForm
            song={editingSong}
            onSubmit={editingSong ? updateSong : addSong}
            onCancel={closeForm}
          />
        )}

        <SongList
          songs={filteredSongs}
          onEdit={openEditForm}
          onDelete={deleteSong}
          onUpdateProgress={async (id, progress) => {
            await updateSongInFirestore(String(id), { progress })
          }}
        />
      </div>
    </div>
  )
}

export default App
