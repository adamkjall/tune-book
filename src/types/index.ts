export interface Song {
  id: string | number;
  title: string;
  artist: string;
  lessonLink: string;
  lessonLinks?: Array<{ url: string; label: string }>;
  songLinkYoutube: string;
  songLinkSpotify: string;
  tabsLink: string;
  tabsLinks?: Array<{ url: string; label: string }>;
  tabsPdfUrl?: string; // Firebase Storage URL for uploaded PDF
  notes: string;
  progress: number;
  category: string; // Category ID from categories config
  tuning?: string;
}

