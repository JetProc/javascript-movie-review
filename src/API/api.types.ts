import type { Movie } from "../../types/movie";

export interface RequestOptions {
  method: "GET" | "POST";
  headers: {
    accept: string;
    Authorization: string;
  };
}

export interface FetchMoviePageDataResponse {
  currentPage: number;
  totalPages: number;
  results: Movie[];
}

export interface TmdbMovieResponse {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbFetchMoviePageDataResponse {
  page?: number;
  total_pages?: number;
  results: TmdbMovieResponse[];
}
