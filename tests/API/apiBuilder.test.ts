import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMovieApiUrl, createRequestOptions, mapFetchMoviePageDataResponse } from "../../src/API/apiBuilder";

describe("apiBuilder", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_TMDB_API_KEY", "test-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("인기 영화 조회 URL을 생성한다", () => {
    const url = createMovieApiUrl(1, "");

    expect(url.pathname).toBe("/3/movie/popular");
    expect(url.searchParams.get("language")).toBe("ko-KR");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.has("query")).toBe(false);
  });

  it("검색어가 있으면 검색 URL을 생성한다", () => {
    const url = createMovieApiUrl(2, "해리");

    expect(url.pathname).toBe("/3/search/movie");
    expect(url.searchParams.get("language")).toBe("ko-KR");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("query")).toBe("해리");
  });

  it("TMDB 요청 옵션을 생성한다", () => {
    expect(createRequestOptions()).toEqual({
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: "Bearer test-api-key",
      },
    });
  });

  it("TMDB 응답을 Movie 페이지 데이터로 변환한다", () => {
    const response = mapFetchMoviePageDataResponse({
      page: 3,
      total_pages: 10,
      results: [
        {
          id: 1,
          title: "해리 포터와 마법사의 돌",
          vote_average: 7.8,
          poster_path: "/poster-1.jpg",
          backdrop_path: "/backdrop-1.jpg",
        },
      ],
    });

    expect(response).toEqual({
      currentPage: 3,
      totalPages: 10,
      results: [
        {
          id: 1,
          title: "해리 포터와 마법사의 돌",
          rate: 7.8,
          thumbnail_path: "/poster-1.jpg",
          hero_path: "/backdrop-1.jpg",
        },
      ],
    });
  });

  it("페이지 정보가 없으면 기본값 0으로 변환한다", () => {
    const response = mapFetchMoviePageDataResponse({
      results: [],
    });

    expect(response).toEqual({
      currentPage: 0,
      totalPages: 0,
      results: [],
    });
  });
});
