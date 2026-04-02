import type { Movie } from "./movie";

export interface State {
  currentPage: number;
  totalPage: number;
  movieList: Movie[];
  query: string;
}
