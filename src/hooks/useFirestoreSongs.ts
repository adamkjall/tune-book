import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { Song } from '@/types'
import { useEffect } from 'react'

export function useFirestoreSongs() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch songs with TanStack Query
  const { data: songs = [], isLoading: loading, isFetching } = useQuery({
    queryKey: ['songs', user?.uid],
    queryFn: async () => {
      if (!user) return []
      
      const songsRef = collection(db, 'users', user.uid, 'songs')
      const q = query(songsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Song[]
    },
    enabled: !!user,
    refetchOnMount: false, // Use cached data on mount
    refetchOnWindowFocus: false,
  })

  // // Real-time listener (optional, keeps cache fresh)
  // useEffect(() => {
  //   if (!user) return
  //
  //   const songsRef = collection(db, 'users', user.uid, 'songs')
  //   const q = query(songsRef, orderBy('createdAt', 'desc'))
  //
  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const songsData = snapshot.docs.map(doc => ({
  //       ...doc.data(),
  //       id: doc.id,
  //     })) as Song[]
  //
  //     queryClient.setQueryData(['songs', user.uid], songsData)
  //   })
  //
  //   return unsubscribe
  // }, [user, queryClient])

  // Add song mutation
  const addSongMutation = useMutation({
    mutationFn: async (song: Omit<Song, 'id'>) => {
      if (!user) throw new Error('Not authenticated')
      
      const songsRef = collection(db, 'users', user.uid, 'songs')
      const docRef = await addDoc(songsRef, {
        ...song,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', user?.uid] })
    }
  })

  // Update song mutation
  const updateSongMutation = useMutation({
    mutationFn: async ({ songId, updates }: { songId: string; updates: Partial<Song> }) => {
      if (!user) throw new Error('Not authenticated')
      
      const songRef = doc(db, 'users', user.uid, 'songs', songId)
      await updateDoc(songRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', user?.uid] })
    }
  })

  // Delete song mutation
  const deleteSongMutation = useMutation({
    mutationFn: async (songId: string) => {
      if (!user) throw new Error('Not authenticated')
      
      const songRef = doc(db, 'users', user.uid, 'songs', songId)
      await deleteDoc(songRef)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', user?.uid] })
    }
  })

  return {
    songs,
    loading,
    addSong: (song: Omit<Song, 'id'>) => addSongMutation.mutateAsync(song),
    updateSong: (songId: string, updates: Partial<Song>) => 
      updateSongMutation.mutateAsync({ songId, updates }),
    deleteSong: (songId: string) => deleteSongMutation.mutateAsync(songId),
  }
}
