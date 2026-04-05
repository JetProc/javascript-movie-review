import type { FetchMoviePageDataResponse } from "./api.types";
import { createMovieApiUrl, createRequestOptions, mapFetchMoviePageDataResponse } from "./apiBuilder";
import { API_REQUEST_TIMEOUT_MS } from "../constants/constant";

const TIMEOUT_ERROR_MESSAGE = "영화 정보를 불러오는데 시간이 너무 오래 걸립니다. 다시 시도해주세요.";

export const fetchMoviePageData = async (page: number, query: string = ""): Promise<FetchMoviePageDataResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(createMovieApiUrl(page, query), {
      ...createRequestOptions(),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`영화 정보를 불러오는데 실패했습니다: ${response.status}`);
    }

    const data = await response.json();

    return mapFetchMoviePageDataResponse(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(TIMEOUT_ERROR_MESSAGE);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
