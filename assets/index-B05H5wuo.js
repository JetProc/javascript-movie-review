(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const BASE_URL = {
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  POSTER_BASE_URL: "https://image.tmdb.org/t/p/w200",
  HERO_BASE_URL: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces"
};
const DEFAULT_LANGUAGE = "ko-KR";
const SKELETON_MOVIE_COUNT = 20;
const IMAGE_URL = {
  STAR_IMAGE_URL: "/images/star_empty.png",
  DEFAULT_THUMBNAIL_IMAGE_URL: `/images/default-thumbnail.jpeg`
};
const API_PATH = {
  POPULAR_MOVIE: `/movie/popular`,
  SEARCH_MOVIE: `/search/movie`
};
const PAGE_TITLE = {
  POPULAR: "지금 인기 있는 영화",
  SEARCH: (query) => `"${query}" 검색 결과`
};
const getMovieEndpointPath = (query) => query ? API_PATH.SEARCH_MOVIE : API_PATH.POPULAR_MOVIE;
const createMovieApiUrl = (page, query) => {
  const url = new URL(`${BASE_URL.TMDB_BASE_URL}${getMovieEndpointPath(query)}`);
  url.searchParams.set("language", DEFAULT_LANGUAGE);
  url.searchParams.set("page", String(page));
  if (query) {
    url.searchParams.set("query", query);
  }
  return url;
};
const createRequestOptions = () => ({
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxY2RmMTI0NTQyYzRiZjIyNjEyYWJmZjhhYjNlYmIwMCIsIm5iZiI6MTc3NDg3MTQ5NC45OTMsInN1YiI6IjY5Y2E2M2M2ZjJkMzZmZjUxYTczMmUzZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.7CsJG4Ymbhmk_nuJJgETYLrBHQ_wYFTrcNSmNysxC1M"}`
  }
});
const mapFetchMoviePageDataResponse = (data) => {
  const movies = data.results.map((movie) => {
    return {
      id: movie.id,
      title: movie.title,
      rate: movie.vote_average,
      thumbnail_path: movie.poster_path,
      hero_path: movie.backdrop_path
    };
  });
  return {
    currentPage: data.page ?? 0,
    totalPages: data.total_pages ?? 0,
    results: movies
  };
};
const fetchMoviePageData = async (page, query = "") => {
  const response = await fetch(createMovieApiUrl(page, query), createRequestOptions());
  if (!response.ok) {
    throw new Error(`영화 정보를 불러오는데 실패했습니다: ${response.status}`);
  }
  const data = await response.json();
  return mapFetchMoviePageDataResponse(data);
};
const createImageUrl = (baseUrl, imageUrlPath) => {
  return imageUrlPath.length > 0 ? `${baseUrl}${imageUrlPath}` : IMAGE_URL.DEFAULT_THUMBNAIL_IMAGE_URL;
};
const $ = (selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`${selector} 요소를 찾을 수 없습니다`);
  }
  return element;
};
const state = {
  currentPage: 0,
  totalPage: 0,
  movieList: [],
  query: ""
};
const getAppElements = () => ({
  movieList: $(".thumbnail-list"),
  siteHeader: $(".site-header"),
  searchForm: $("#search-form"),
  searchInput: $("#search-input"),
  noResult: $(".no-result"),
  movieSectionTitle: $(".movie-section-title"),
  heroSection: $("#hero-section"),
  heroBackdrop: $("#hero-backdrop"),
  heroRate: $("#hero-rate"),
  heroRateValue: $("#hero-rate-value"),
  heroTitle: $("#hero-title"),
  skeletonCard: $(".skeleton-card"),
  seeMoreBtn: $("#see-more-btn")
});
const fetchMoviePages = async (query) => {
  const response = await fetchMoviePageData(state.currentPage + 1, query);
  return response;
};
const createMovieListItemMarkup = (movie) => {
  const posterImageUrl = createImageUrl(BASE_URL.POSTER_BASE_URL, movie.thumbnail_path ?? "");
  return (
    /* html */
    `<li>
    <div class="item">
      <img class="thumbnail" src="${posterImageUrl}" alt="${movie.title}" />
      <div class="item-desc">
        <p class="rate">
          <img src="${IMAGE_URL.STAR_IMAGE_URL}" class="star" alt="" aria-hidden="true" />
          <span>${movie.rate}</span>
        </p>
        <strong>${movie.title}</strong>
      </div>
    </div>
  </li>`
  );
};
const renderMovies = (movies, movieListElement) => {
  movieListElement.innerHTML = movies.map(createMovieListItemMarkup).join("");
};
const renderHeroMovie = (movie, elements) => {
  const posterImageUrl = createImageUrl(BASE_URL.HERO_BASE_URL, movie.hero_path ?? "");
  elements.heroBackdrop.style.backgroundImage = posterImageUrl ? `url("${posterImageUrl}")` : "";
  elements.heroRate.hidden = false;
  elements.heroRateValue.textContent = String(movie.rate);
  elements.heroTitle.textContent = movie.title;
};
const syncHeroSection = (elements) => {
  const shouldShowHero = state.query === "" && state.movieList.length > 0;
  elements.heroSection.hidden = !shouldShowHero;
  elements.siteHeader.classList.toggle("site-header--overlay", shouldShowHero);
  if (!shouldShowHero) {
    return;
  }
  renderHeroMovie(state.movieList[0], elements);
};
const syncSeeMoreButton = (elements) => {
  const shouldHideSeeMoreButton = state.currentPage >= state.totalPage;
  elements.seeMoreBtn.hidden = shouldHideSeeMoreButton;
};
const syncNoResultSection = (elements) => {
  const shouldHideNoResultSection = !(state.query !== "" && state.movieList.length === 0);
  elements.noResult.hidden = shouldHideNoResultSection;
};
const updateMovieState = (newState) => {
  state.query = newState.query;
  state.currentPage = newState.currentPage;
  state.totalPage = newState.totalPage;
  state.movieList = newState.movieList;
};
const makeSkeleton = (skeletonCardElement) => {
  const skeletonItemMarkup = (
    /* html */
    `<li>
    <div class="item" aria-hidden="true">
      <div class="thumbnail thumbnail-skeleton skeleton"></div>
      <div class="item-desc">
        <p class="rate rate-skeleton">
          <span class="rate-icon-skeleton skeleton"></span>
          <span class="rate-value-skeleton skeleton"></span>
        </p>
        <div class="title-skeleton skeleton"></div>
      </div>
    </div>
  </li>`
  );
  skeletonCardElement.innerHTML = Array.from({ length: SKELETON_MOVIE_COUNT }, () => skeletonItemMarkup).join("");
};
const loadMovies = async (elements) => {
  makeSkeleton(elements.skeletonCard);
  const response = await fetchMoviePages(state.query);
  updateMovieState({
    currentPage: response.currentPage,
    totalPage: response.totalPages,
    movieList: [...state.movieList, ...response.results],
    query: state.query
  });
  if (state.currentPage === 1) {
    elements.movieSectionTitle.innerHTML = state.query ? PAGE_TITLE.SEARCH(state.query) : PAGE_TITLE.POPULAR;
  }
  elements.skeletonCard.innerHTML = "";
  renderMovies(state.movieList, elements.movieList);
  syncSeeMoreButton(elements);
  syncNoResultSection(elements);
};
const initializeMoviePage = async (elements) => {
  await loadMovies(elements);
  syncHeroSection(elements);
};
const main = async () => {
  const elements = getAppElements();
  bindEvents(elements);
  await initializeMoviePage(elements);
};
window.addEventListener("load", () => {
  void main().catch((error) => console.log(error));
});
const bindEvents = (elements) => {
  elements.seeMoreBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    await loadMovies(elements);
  });
  elements.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = elements.searchInput.value.trim();
    updateMovieState({
      currentPage: 0,
      totalPage: 0,
      movieList: [],
      query
    });
    console.log(query);
    await loadMovies(elements);
    syncHeroSection(elements);
  });
};
