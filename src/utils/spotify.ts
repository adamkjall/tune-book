const SPOTIFY_CLIENT_ID = "24e5318628dd479b8a0b323a2737cd6c";
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export interface ArtistImage {
  url: string;
  width: number;
  height: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: ArtistImage[];
  genres: string[];
  followers: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  albumImage: string | null;
  albumName: string;
  artistName: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      )}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 min early

  return accessToken;
}

const artistCache = new Map<string, SpotifyArtist | null>();
const trackCache = new Map<string, SpotifyTrack | null>();

export async function searchSpotifyArtist(
  artistName: string
): Promise<SpotifyArtist | null> {
  const cacheKey = artistName.toLowerCase();

  if (artistCache.has(cacheKey)) {
    return artistCache.get(cacheKey)!;
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        artistName
      )}&type=artist&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search Spotify artist");
    }

    const data = await response.json();

    if (data.artists.items.length === 0) {
      artistCache.set(cacheKey, null);
      return null;
    }

    const artist = data.artists.items[0];
    const spotifyArtist: SpotifyArtist = {
      id: artist.id,
      name: artist.name,
      images: artist.images || [],
      genres: artist.genres || [],
      followers: artist.followers?.total || 0,
    };

    artistCache.set(cacheKey, spotifyArtist);
    return spotifyArtist;
  } catch (error) {
    console.error("Error fetching Spotify artist:", error);
    artistCache.set(cacheKey, null);
    return null;
  }
}

export function getArtistImage(
  artist: SpotifyArtist | null,
  size: "large" | "medium" | "small" = "large"
): string | null {
  if (!artist || !artist.images.length) {
    return null;
  }

  // Spotify returns images sorted by size (largest first)
  if (size === "large") {
    return artist.images[0]?.url || null;
  }
  if (size === "medium") {
    return artist.images[1]?.url || artist.images[0]?.url || null;
  }
  // small
  return (
    artist.images[2]?.url ||
    artist.images[1]?.url ||
    artist.images[0]?.url ||
    null
  );
}

export async function searchSpotifyTrack(
  trackName: string,
  artistName: string
): Promise<SpotifyTrack | null> {
  const cacheKey = `${trackName.toLowerCase()}-${artistName.toLowerCase()}`;

  if (trackCache.has(cacheKey)) {
    return trackCache.get(cacheKey)!;
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(
        trackName
      )}%20artist:${encodeURIComponent(artistName)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search Spotify track");
    }

    const data = await response.json();

    if (data.tracks.items.length === 0) {
      trackCache.set(cacheKey, null);
      return null;
    }

    const track = data.tracks.items[0];
    const spotifyTrack: SpotifyTrack = {
      id: track.id,
      name: track.name,
      albumImage: track.album.images[0]?.url || null,
      albumName: track.album.name,
      artistName: track.artists[0]?.name || artistName,
    };

    trackCache.set(cacheKey, spotifyTrack);
    return spotifyTrack;
  } catch (error) {
    console.error("Error fetching Spotify track:", error);
    trackCache.set(cacheKey, null);
    return null;
  }
}
