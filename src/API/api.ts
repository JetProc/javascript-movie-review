import type { FetchMoviePageDataResponse } from "./api.types";
import { createMovieApiUrl, createRequestOptions, mapFetchMoviePageDataResponse } from "./apiBuilder";

export const fetchMoviePageData = async (page: number, query: string = ""): Promise<FetchMoviePageDataResponse> => {
  const response = await fetch(createMovieApiUrl(page, query), createRequestOptions());

  if (!response.ok) {
    throw new Error(`영화 정보를 불러오는데 실패했습니다: ${response.status}`);
  }

  const data = await response.json();

  return mapFetchMoviePageDataResponse(data);
};
