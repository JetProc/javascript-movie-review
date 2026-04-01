import { Movie } from "../../types/movie";

interface RequestOptions {
  method: "GET" | "POST";
  headers: {
    accept: string;
    Authorization: string;
  };
}

interface FetchMoviePageDataResponse {
  currentPage: number;
  totalPages: number;
  results: Movie[];
}
