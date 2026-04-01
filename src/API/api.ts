import { FetchMoviePageDataResponse, RequestOptions } from "./config";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_LANGUAGE = "ko-KR";

export const createRequestOptions = (): RequestOptions => ({
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
  },
});

const getMovieEndpointPath = (query: string): string => (query ? "/search/movie" : "/movie/popular");

const createMovieApiUrl = (query: string, page: number): URL => {
  const url = new URL(`${TMDB_BASE_URL}${getMovieEndpointPath(query)}`);

  url.searchParams.set("language", DEFAULT_LANGUAGE);
  url.searchParams.set("page", String(page));

  if (query) {
    url.searchParams.set("query", query);
  }

  return url;
};

export const fetchMoviePageData = async (page: number, query: string = ""): Promise<FetchMoviePageDataResponse> => {
  const response = await fetch(createMovieApiUrl(query, page), createRequestOptions());

  if (!response.ok) {
    throw new Error(`영화 정보를 불러오는데 실패했습니다: ${response.status}`);
  }

  const data = await response.json();

  const movies = data.results.map((movie: any) => {
    return {
      id: movie.id,
      title: movie.title,
      rate: movie.vote_average,
      thumbnail_path: movie.poster_path,
      hero_path: movie.backdrop_path,
    };
  });

  return {
    currentPage: data.page ?? 0,
    totalPages: data.total_pages ?? 0,
    results: movies,
  };
};
