import { useQuery } from '@tanstack/react-query'
import { searchSpotifyArtist, searchSpotifyTrack, type SpotifyArtist, type SpotifyTrack } from '@/utils/spotify'

export function useSpotifyArtist(artistName: string) {
  return useQuery({
    queryKey: ['spotify-artist', artistName.toLowerCase()],
    queryFn: () => searchSpotifyArtist(artistName),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - artist data rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
    enabled: !!artistName,
  })
}

export function useSpotifyTrack(trackName: string, artistName: string) {
  return useQuery({
    queryKey: ['spotify-track', trackName.toLowerCase(), artistName.toLowerCase()],
    queryFn: () => searchSpotifyTrack(trackName, artistName),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
    enabled: !!trackName && !!artistName,
  })
}
