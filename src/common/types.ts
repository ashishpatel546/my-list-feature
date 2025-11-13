export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Fantasy' | 'Horror' | 'Romance' | 'SciFi';

export interface WatchHistoryItem {
  contentId: string;
  watchedOn: Date;
  rating?: number;
}

export interface Preferences {
  favoriteGenres: Genre[];
  dislikedGenres: Genre[];
}

export interface Episode {
  episodeNumber: number;
  seasonNumber: number;
  releaseDate: Date;
  director: string;
  actors: string[];
}
