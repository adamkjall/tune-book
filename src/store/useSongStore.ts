import { create } from 'zustand'
import type { Song } from '@/types'

interface SongStore {
  showForm: boolean
  editingSong: Song | null
  openForm: () => void
  openEditForm: (song: Song) => void
  closeForm: () => void
}

export const useSongStore = create<SongStore>((set) => ({
  showForm: false,
  editingSong: null,
  openForm: () => set({ showForm: true, editingSong: null }),
  openEditForm: (song) => set({ showForm: true, editingSong: song }),
  closeForm: () => set({ showForm: false, editingSong: null }),
}))
