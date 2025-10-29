import SongCard from './SongCard'
import type {Song} from '@/types'

interface SongListProps {
  songs: Song[];
  onEdit: (song: Song) => void;
  onDelete: (id: number) => void;
  onUpdateProgress: (id: number, progress: number) => void;
}

function SongList({ songs, onEdit, onDelete, onUpdateProgress }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-xl">No songs in this category yet</p>
        <p className="text-sm mt-2">Add your first song to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {songs.map(song => (
        <SongCard
          key={song.id}
          song={song}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateProgress={onUpdateProgress}
        />
      ))}
    </div>
  )
}

export default SongList
