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
const PUBLIC_IMAGE_BASE_URL = "./images/";
const BASE_URL = {
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  POSTER_BASE_URL: "https://image.tmdb.org/t/p/w200",
  DETAIL_POSTER_BASE_URL: "https://image.tmdb.org/t/p/original",
  HERO_BASE_URL: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces"
};
const DEFAULT_LANGUAGE = "ko-KR";
const API_REQUEST_TIMEOUT_MS = 5e3;
const SKELETON_MOVIE_COUNT = 20;
const MOVIE_USER_RATING_STORAGE_KEY = "movie-user-ratings";
const IMAGE_URL = {
  STAR_IMAGE_URL: `${PUBLIC_IMAGE_BASE_URL}star_empty.png`,
  FILLED_STAR_IMAGE_URL: `${PUBLIC_IMAGE_BASE_URL}star_filled.png`,
  MODAL_CLOSE_BUTTON_IMAGE_URL: `${PUBLIC_IMAGE_BASE_URL}modal_button_close.png`,
  DEFAULT_THUMBNAIL_IMAGE_URL: `${PUBLIC_IMAGE_BASE_URL}default-thumbnail.jpeg`
};
const API_PATH = {
  POPULAR_MOVIE: `/movie/popular`,
  SEARCH_MOVIE: `/search/movie`,
  MOVIE_DETAIL: (movieId) => `/movie/${movieId}`
};
const PAGE_TITLE = {
  POPULAR: "지금 인기 있는 영화",
  SEARCH: (query) => `"${query}" 검색 결과`
};
const getMovieEndpointPath = (query) => query ? API_PATH.SEARCH_MOVIE : API_PATH.POPULAR_MOVIE;
const createTmdbApiUrl = (path) => {
  const url = new URL(`${BASE_URL.TMDB_BASE_URL}${path}`);
  url.searchParams.set("language", DEFAULT_LANGUAGE);
  return url;
};
const createMovieApiUrl = (page, query) => {
  const url = createTmdbApiUrl(getMovieEndpointPath(query));
  url.searchParams.set("page", String(page));
  if (query) {
    url.searchParams.set("query", query);
  }
  return url;
};
const createMovieDetailApiUrl = (movieId) => {
  return createTmdbApiUrl(API_PATH.MOVIE_DETAIL(movieId));
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
      hero_path: movie.backdrop_path,
      userRating: null
    };
  });
  return {
    currentPage: data.page ?? 0,
    totalPages: data.total_pages ?? 0,
    results: movies
  };
};
const mapFetchMovieDetailResponse = (data) => {
  const movieDetail = {
    poster_path: data.poster_path,
    title: data.title,
    release_year: data.release_date ? data.release_date.slice(0, 4) : "",
    genres: data.genres.map(({ name }) => name),
    rate: data.vote_average,
    overview: data.overview ?? "",
    userRating: null
  };
  return movieDetail;
};
const TIMEOUT_ERROR_MESSAGE = "영화 정보를 불러오는데 시간이 너무 오래 걸립니다. 다시 시도해주세요.";
const fetchTmdbData = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...createRequestOptions(),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`영화 정보를 불러오는데 실패했습니다: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(TIMEOUT_ERROR_MESSAGE);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
const fetchMoviePageData = async (page, query = "") => {
  const data = await fetchTmdbData(createMovieApiUrl(page, query));
  return mapFetchMoviePageDataResponse(data);
};
const fetchMovieDetail = async (movieId) => {
  const data = await fetchTmdbData(createMovieDetailApiUrl(movieId));
  return mapFetchMovieDetailResponse(data);
};
const $ = (selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`${selector} 요소를 찾을 수 없습니다`);
  }
  return element;
};
const $$ = (selector) => {
  const elements = Array.from(document.querySelectorAll(selector));
  if (elements.length === 0) {
    throw new Error(`${selector} 요소를 찾을 수 없습니다`);
  }
  return elements;
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
  heroDetailButton: $(".hero-detail-button"),
  skeletonCard: $(".skeleton-card"),
  infiniteScrollSentinel: $("#infinite-scroll-sentinel"),
  modalBackground: $("#modalBackground"),
  closeModal: $("#closeModal"),
  modalCloseIcon: $("#modalCloseIcon"),
  modalPosterImage: $("#modalPosterImage"),
  modalTitle: $("#modalTitle"),
  modalCategory: $("#modalCategory"),
  modalRateIcon: $("#modalRateIcon"),
  modalRateValue: $("#modalRateValue"),
  myRatingMessage: $("#myRatingMessage"),
  myRatingScore: $("#myRatingScore"),
  myRatingButtons: $$(".my-rating-star-button"),
  modalDetail: $("#modalDetail")
});
const MOVIE_USER_RATING_LABELS = {
  2: "최악이예요",
  4: "별로예요",
  6: "보통이에요",
  8: "재미있어요",
  10: "명작이에요"
};
const MOVIE_USER_RATING_OPTIONS = Object.keys(MOVIE_USER_RATING_LABELS).map(
  (key) => Number(key)
);
const DEFAULT_MOVIE_USER_RATING_LABEL = "별점을 남겨보세요";
const isMovieUserRating = (value) => {
  return typeof value === "number" && MOVIE_USER_RATING_OPTIONS.some((option) => option === value);
};
const getMovieUserRatingLabel = (userRating) => {
  return userRating ? MOVIE_USER_RATING_LABELS[userRating] : DEFAULT_MOVIE_USER_RATING_LABEL;
};
const formatMovieUserRatingScore = (userRating) => {
  return `(${userRating ?? 0}/10)`;
};
const applyMovieUserRating = (movie, userRating) => {
  return {
    ...movie,
    userRating
  };
};
const applyMovieUserRatings = (movies, userRatingsByMovieId) => {
  return movies.map((movie) => applyMovieUserRating(movie, userRatingsByMovieId[movie.id] ?? null));
};
const createImageUrl = (baseUrl, imageUrlPath) => {
  return imageUrlPath.length > 0 ? `${baseUrl}${imageUrlPath}` : IMAGE_URL.DEFAULT_THUMBNAIL_IMAGE_URL;
};
const formatMovieRate = (rate) => {
  return (Math.round(rate * 10) / 10).toFixed(1);
};
const createMovieCategoryText = ({ release_year, genres }) => {
  return [release_year, genres.join(", ")].filter((text) => text.length > 0).join(" · ");
};
const setMovieDetailModalVisibility = (elements, isOpen) => {
  elements.modalBackground.classList.toggle("active", isOpen);
  elements.modalBackground.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("modal-open", isOpen);
};
const clearMovieDetailModal = (elements) => {
  elements.modalPosterImage.src = "";
  elements.modalPosterImage.alt = "";
  elements.modalTitle.textContent = "";
  elements.modalCategory.textContent = "";
  elements.modalCategory.hidden = true;
  elements.modalRateIcon.src = IMAGE_URL.FILLED_STAR_IMAGE_URL;
  elements.modalRateValue.textContent = "";
  renderMovieUserRating(null, elements);
  elements.modalDetail.textContent = "";
};
const syncMovieDetailModalClosedState = (elements) => {
  setMovieDetailModalVisibility(elements, false);
  clearMovieDetailModal(elements);
};
const initializeMovieDetailModal = (elements) => {
  elements.modalCloseIcon.src = IMAGE_URL.MODAL_CLOSE_BUTTON_IMAGE_URL;
  elements.modalRateIcon.src = IMAGE_URL.FILLED_STAR_IMAGE_URL;
  clearMovieDetailModal(elements);
  setMovieDetailModalVisibility(elements, false);
};
const renderMovieDetail = (movieDetail, elements) => {
  const posterImageUrl = createImageUrl(BASE_URL.DETAIL_POSTER_BASE_URL, movieDetail.poster_path ?? "");
  elements.modalPosterImage.src = posterImageUrl;
  elements.modalPosterImage.alt = movieDetail.title;
  elements.modalTitle.textContent = movieDetail.title;
  elements.modalCategory.textContent = createMovieCategoryText(movieDetail);
  elements.modalCategory.hidden = elements.modalCategory.textContent.length === 0;
  elements.modalRateIcon.src = IMAGE_URL.FILLED_STAR_IMAGE_URL;
  elements.modalRateValue.textContent = formatMovieRate(movieDetail.rate);
  renderMovieUserRating(movieDetail.userRating, elements);
  elements.modalDetail.textContent = movieDetail.overview;
};
const renderMovieUserRating = (userRating, elements) => {
  elements.myRatingMessage.textContent = getMovieUserRatingLabel(userRating);
  elements.myRatingScore.textContent = formatMovieUserRatingScore(userRating);
  elements.myRatingButtons.forEach((button, index) => {
    const starImage = button.querySelector("img");
    const thresholdRating = MOVIE_USER_RATING_OPTIONS[index];
    const isFilledStar = userRating !== null && thresholdRating <= userRating;
    button.setAttribute("aria-pressed", String(isFilledStar));
    if (starImage) {
      starImage.src = isFilledStar ? IMAGE_URL.FILLED_STAR_IMAGE_URL : IMAGE_URL.STAR_IMAGE_URL;
    }
  });
};
const openMovieDetailModal = (elements) => {
  if (!elements.modalBackground.open) {
    elements.modalBackground.showModal();
  }
  setMovieDetailModalVisibility(elements, true);
};
const closeMovieDetailModal = (elements) => {
  if (elements.modalBackground.open) {
    elements.modalBackground.close();
  }
  syncMovieDetailModalClosedState(elements);
};
const createMovieDetailController = ({
  elements,
  loadMovieDetail,
  movieRatingRepository: movieRatingRepository2,
  onError,
  onMovieRated
}) => {
  let latestRequestId = 0;
  let currentMovieDetailId;
  let currentMovieDetail;
  const resetCurrentMovieDetailState = () => {
    latestRequestId += 1;
    currentMovieDetailId = null;
    currentMovieDetail = null;
  };
  const loadMovieDetailWithUserRating = async (movieId) => {
    const [movieDetail, userRating] = await Promise.all([loadMovieDetail(movieId), movieRatingRepository2.get(movieId)]);
    return applyMovieUserRating(movieDetail, userRating);
  };
  const openById = async (movieId) => {
    resetCurrentMovieDetailState();
    const requestId = latestRequestId;
    clearMovieDetailModal(elements);
    try {
      const movieDetail = await loadMovieDetailWithUserRating(movieId);
      if (requestId !== latestRequestId) {
        return;
      }
      currentMovieDetailId = movieId;
      currentMovieDetail = movieDetail;
      renderMovieDetail(movieDetail, elements);
      openMovieDetailModal(elements);
    } catch (error) {
      if (requestId !== latestRequestId) {
        return;
      }
      close();
      onError(error);
    }
  };
  const updateUserRating = async (userRating) => {
    if (!currentMovieDetailId || !currentMovieDetail) {
      return;
    }
    await movieRatingRepository2.set(currentMovieDetailId, userRating);
    currentMovieDetail = applyMovieUserRating(currentMovieDetail, userRating);
    onMovieRated(currentMovieDetailId, userRating);
    renderMovieDetail(currentMovieDetail, elements);
  };
  const close = () => {
    closeMovieDetailModal(elements);
    resetCurrentMovieDetailState();
  };
  const syncClosedState = () => {
    resetCurrentMovieDetailState();
  };
  return {
    openById,
    updateUserRating,
    close,
    syncClosedState
  };
};
const createMovieListItemElement = (movie) => {
  const posterImageUrl = createImageUrl(BASE_URL.POSTER_BASE_URL, movie.thumbnail_path ?? "");
  const listItem = document.createElement("li");
  const item = document.createElement("div");
  const thumbnail = document.createElement("img");
  const itemDesc = document.createElement("div");
  const rate = document.createElement("p");
  const star = document.createElement("img");
  const rateValue = document.createElement("span");
  const title = document.createElement("strong");
  item.className = "item";
  item.dataset.movieId = String(movie.id);
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.setAttribute("aria-label", `${movie.title} 상세 보기`);
  thumbnail.className = "thumbnail";
  thumbnail.src = posterImageUrl;
  itemDesc.className = "item-desc";
  rate.className = "rate";
  star.src = IMAGE_URL.STAR_IMAGE_URL;
  star.className = "star";
  star.setAttribute("aria-hidden", "true");
  rateValue.textContent = formatMovieRate(movie.rate);
  title.textContent = movie.title;
  rate.append(star, rateValue);
  itemDesc.append(rate, title);
  item.append(thumbnail, itemDesc);
  listItem.append(item);
  return listItem;
};
const createSkeletonListItemElement = () => {
  const listItem = document.createElement("li");
  const item = document.createElement("div");
  const thumbnail = document.createElement("div");
  const itemDesc = document.createElement("div");
  const rate = document.createElement("p");
  const rateIcon = document.createElement("span");
  const rateValue = document.createElement("span");
  const title = document.createElement("div");
  item.className = "item";
  item.setAttribute("aria-hidden", "true");
  thumbnail.className = "thumbnail thumbnail-skeleton skeleton";
  itemDesc.className = "item-desc";
  rate.className = "rate rate-skeleton";
  rateIcon.className = "rate-icon-skeleton skeleton";
  rateValue.className = "rate-value-skeleton skeleton";
  title.className = "title-skeleton skeleton";
  rate.append(rateIcon, rateValue);
  itemDesc.append(rate, title);
  item.append(thumbnail, itemDesc);
  listItem.append(item);
  return listItem;
};
const renderMovies = (movies, movieListElement) => {
  movieListElement.replaceChildren(...movies.map(createMovieListItemElement));
};
const renderHeroMovie = (movie, elements) => {
  const posterImageUrl = createImageUrl(BASE_URL.HERO_BASE_URL, movie.hero_path ?? "");
  elements.heroBackdrop.style.backgroundImage = posterImageUrl ? `url("${posterImageUrl}")` : "";
  elements.heroRate.hidden = false;
  elements.heroRateValue.textContent = formatMovieRate(movie.rate);
  elements.heroTitle.textContent = movie.title;
};
const makeSkeleton = (skeletonCardElement) => {
  skeletonCardElement.replaceChildren(...Array.from({ length: SKELETON_MOVIE_COUNT }, createSkeletonListItemElement));
};
const createInitialMoviePageState = () => ({
  currentPage: 0,
  totalPage: 0,
  movieList: [],
  query: ""
});
const createNextMoviePageState = (state2, response, movieList, query, shouldReset) => {
  const previousMovieList = shouldReset ? [] : state2.movieList;
  return {
    currentPage: response.currentPage,
    totalPage: response.totalPages,
    movieList: [...previousMovieList, ...movieList],
    query
  };
};
const syncMovieSectionTitle = (elements, state2) => {
  if (state2.currentPage !== 1) {
    return;
  }
  elements.movieSectionTitle.textContent = state2.query ? PAGE_TITLE.SEARCH(state2.query) : PAGE_TITLE.POPULAR;
};
const syncMoviePage = (elements, state2) => {
  const shouldShowHero = state2.query === "" && state2.movieList.length > 0;
  const shouldHideSentinel = state2.movieList.length === 0 || state2.currentPage >= state2.totalPage;
  const shouldHideNoResultSection = !(state2.query !== "" && state2.movieList.length === 0);
  elements.heroSection.hidden = !shouldShowHero;
  elements.siteHeader.classList.toggle("site-header--overlay", shouldShowHero);
  elements.infiniteScrollSentinel.hidden = shouldHideSentinel;
  elements.noResult.hidden = shouldHideNoResultSection;
  if (shouldShowHero) {
    renderHeroMovie(state2.movieList[0], elements);
  }
};
const applyMovieUserRatingToMovieList = (movieList, movieId, userRating) => {
  return movieList.map((movie) => {
    if (movie.id !== movieId) {
      return movie;
    }
    return applyMovieUserRating(movie, userRating);
  });
};
function t(t2, e2) {
  if (!(t2 instanceof e2)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function e(t2, e2) {
  for (var s2 = 0; s2 < e2.length; s2++) {
    var i2 = e2[s2];
    i2.enumerable = i2.enumerable || false;
    i2.configurable = true;
    if ("value" in i2) i2.writable = true;
    Object.defineProperty(t2, i2.key, i2);
  }
}
function s(t2, s2, i2) {
  if (s2) e(t2.prototype, s2);
  return t2;
}
var i = Object.defineProperty;
var n = function(t2, e2) {
  return i(t2, "name", { value: e2, configurable: true });
};
var o = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\r\n  <path d="m8.94 8 4.2-4.193a.67.67 0 0 0-.947-.947L8 7.06l-4.193-4.2a.67.67 0 1 0-.947.947L7.06 8l-4.2 4.193a.667.667 0 0 0 .217 1.093.666.666 0 0 0 .73-.146L8 8.94l4.193 4.2a.666.666 0 0 0 1.094-.217.665.665 0 0 0-.147-.73L8.94 8Z" fill="currentColor"/>\r\n</svg>\r\n';
var a = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\r\n  <path d="M16 2.667a13.333 13.333 0 1 0 0 26.666 13.333 13.333 0 0 0 0-26.666Zm0 24A10.667 10.667 0 0 1 5.333 16a10.56 10.56 0 0 1 2.254-6.533l14.946 14.946A10.56 10.56 0 0 1 16 26.667Zm8.413-4.134L9.467 7.587A10.56 10.56 0 0 1 16 5.333 10.667 10.667 0 0 1 26.667 16a10.56 10.56 0 0 1-2.254 6.533Z" fill="currentColor"/>\r\n</svg>\r\n';
var r = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\r\n  <path d="M16 14.667A1.333 1.333 0 0 0 14.667 16v5.333a1.333 1.333 0 0 0 2.666 0V16A1.333 1.333 0 0 0 16 14.667Zm.507-5.227a1.333 1.333 0 0 0-1.014 0 1.334 1.334 0 0 0-.44.28 1.56 1.56 0 0 0-.28.44c-.075.158-.11.332-.106.507a1.332 1.332 0 0 0 .386.946c.13.118.279.213.44.28a1.334 1.334 0 0 0 1.84-1.226 1.4 1.4 0 0 0-.386-.947 1.334 1.334 0 0 0-.44-.28ZM16 2.667a13.333 13.333 0 1 0 0 26.666 13.333 13.333 0 0 0 0-26.666Zm0 24a10.666 10.666 0 1 1 0-21.333 10.666 10.666 0 0 1 0 21.333Z" fill="currentColor"/>\r\n</svg>\r\n';
var c = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\r\n  <path d="m19.627 11.72-5.72 5.733-2.2-2.2a1.334 1.334 0 1 0-1.88 1.881l3.133 3.146a1.333 1.333 0 0 0 1.88 0l6.667-6.667a1.333 1.333 0 1 0-1.88-1.893ZM16 2.667a13.333 13.333 0 1 0 0 26.666 13.333 13.333 0 0 0 0-26.666Zm0 24a10.666 10.666 0 1 1 0-21.333 10.666 10.666 0 0 1 0 21.333Z" fill="currentColor"/>\r\n</svg>\r\n';
var l = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\r\n  <path d="M16.334 17.667a1.334 1.334 0 0 0 1.334-1.333v-5.333a1.333 1.333 0 0 0-2.665 0v5.333a1.333 1.333 0 0 0 1.33 1.333Zm-.508 5.227c.325.134.69.134 1.014 0 .165-.064.314-.159.44-.28a1.56 1.56 0 0 0 .28-.44c.076-.158.112-.332.107-.507a1.332 1.332 0 0 0-.387-.946 1.532 1.532 0 0 0-.44-.28 1.334 1.334 0 0 0-1.838 1.226 1.4 1.4 0 0 0 .385.947c.127.121.277.216.44.28Zm.508 6.773a13.333 13.333 0 1 0 0-26.667 13.333 13.333 0 0 0 0 26.667Zm0-24A10.667 10.667 0 1 1 16.54 27a10.667 10.667 0 0 1-.206-21.333Z" fill="currentColor"/>\r\n</svg>\r\n';
var h = n(function(t2) {
  return new DOMParser().parseFromString(t2, "text/html").body.childNodes[0];
}, "stringToHTML"), d = n(function(t2) {
  var e2 = new DOMParser().parseFromString(t2, "application/xml");
  return document.importNode(e2.documentElement, true).outerHTML;
}, "getSvgNode");
var u = { CONTAINER: "sn-notifications-container", NOTIFY: "sn-notify", NOTIFY_CONTENT: "sn-notify-content", NOTIFY_ICON: "sn-notify-icon", NOTIFY_CLOSE: "sn-notify-close", NOTIFY_TITLE: "sn-notify-title", NOTIFY_TEXT: "sn-notify-text", IS_X_CENTER: "sn-is-x-center", IS_Y_CENTER: "sn-is-y-center", IS_CENTER: "sn-is-center", IS_LEFT: "sn-is-left", IS_RIGHT: "sn-is-right", IS_TOP: "sn-is-top", IS_BOTTOM: "sn-is-bottom", NOTIFY_OUTLINE: "sn-notify-outline", NOTIFY_FILLED: "sn-notify-filled", NOTIFY_ERROR: "sn-notify-error", NOTIFY_WARNING: "sn-notify-warning", NOTIFY_SUCCESS: "sn-notify-success", NOTIFY_INFO: "sn-notify-info", NOTIFY_FADE: "sn-notify-fade", NOTIFY_FADE_IN: "sn-notify-fade-in", NOTIFY_SLIDE: "sn-notify-slide", NOTIFY_SLIDE_IN: "sn-notify-slide-in", NOTIFY_AUTOCLOSE: "sn-notify-autoclose" }, f = { ERROR: "error", WARNING: "warning", SUCCESS: "success", INFO: "info" }, p = { OUTLINE: "outline", FILLED: "filled" }, I = { FADE: "fade", SLIDE: "slide" }, v = { CLOSE: d(o), SUCCESS: d(c), ERROR: d(a), WARNING: d(l), INFO: d(r) };
var N = n(function(t2) {
  t2.wrapper.classList.add(u.NOTIFY_FADE), setTimeout(function() {
    t2.wrapper.classList.add(u.NOTIFY_FADE_IN);
  }, 100);
}, "fadeIn"), O = n(function(t2) {
  t2.wrapper.classList.remove(u.NOTIFY_FADE_IN), setTimeout(function() {
    t2.wrapper.remove();
  }, t2.speed);
}, "fadeOut"), T = n(function(t2) {
  t2.wrapper.classList.add(u.NOTIFY_SLIDE), setTimeout(function() {
    t2.wrapper.classList.add(u.NOTIFY_SLIDE_IN);
  }, 100);
}, "slideIn"), E = n(function(t2) {
  t2.wrapper.classList.remove(u.NOTIFY_SLIDE_IN), setTimeout(function() {
    t2.wrapper.remove();
  }, t2.speed);
}, "slideOut");
var m = (function() {
  function e2(s2) {
    var i2 = this;
    t(this, e2);
    this.notifyOut = n(function(t2) {
      t2(i2);
    }, "notifyOut");
    var o2 = s2.notificationsGap, a2 = o2 === void 0 ? 20 : o2, r2 = s2.notificationsPadding, c2 = r2 === void 0 ? 20 : r2, l2 = s2.status, h2 = l2 === void 0 ? "success" : l2, d2 = s2.effect, u2 = d2 === void 0 ? I.FADE : d2, f2 = s2.type, p2 = f2 === void 0 ? "outline" : f2, v2 = s2.title, N2 = s2.text, O2 = s2.showIcon, T2 = O2 === void 0 ? true : O2, E2 = s2.customIcon, m2 = E2 === void 0 ? "" : E2, w2 = s2.customClass, y = w2 === void 0 ? "" : w2, L = s2.speed, C = L === void 0 ? 500 : L, F = s2.showCloseButton, _ = F === void 0 ? true : F, S = s2.autoclose, g = S === void 0 ? true : S, R = s2.autotimeout, Y = R === void 0 ? 3e3 : R, x = s2.position, A = x === void 0 ? "right top" : x, b = s2.customWrapper, k = b === void 0 ? "" : b;
    if (this.customWrapper = k, this.status = h2, this.title = v2, this.text = N2, this.showIcon = T2, this.customIcon = m2, this.customClass = y, this.speed = C, this.effect = u2, this.showCloseButton = _, this.autoclose = g, this.autotimeout = Y, this.notificationsGap = a2, this.notificationsPadding = c2, this.type = p2, this.position = A, !this.checkRequirements()) {
      console.error("You must specify 'title' or 'text' at least.");
      return;
    }
    this.setContainer(), this.setWrapper(), this.setPosition(), this.showIcon && this.setIcon(), this.showCloseButton && this.setCloseButton(), this.setContent(), this.container.prepend(this.wrapper), this.setEffect(), this.notifyIn(this.selectedNotifyInEffect), this.autoclose && this.autoClose(), this.setObserver();
  }
  s(e2, [{ key: "checkRequirements", value: function t2() {
    return !!(this.title || this.text);
  } }, { key: "setContainer", value: function t2() {
    var t3 = document.querySelector(".".concat(u.CONTAINER));
    t3 ? this.container = t3 : (this.container = document.createElement("div"), this.container.classList.add(u.CONTAINER), document.body.appendChild(this.container)), this.notificationsPadding && this.container.style.setProperty("--sn-notifications-padding", "".concat(this.notificationsPadding, "px")), this.notificationsGap && this.container.style.setProperty("--sn-notifications-gap", "".concat(this.notificationsGap, "px"));
  } }, { key: "setPosition", value: function t2() {
    this.container.classList[this.position === "center" ? "add" : "remove"](u.IS_CENTER), this.container.classList[this.position.includes("left") ? "add" : "remove"](u.IS_LEFT), this.container.classList[this.position.includes("right") ? "add" : "remove"](u.IS_RIGHT), this.container.classList[this.position.includes("top") ? "add" : "remove"](u.IS_TOP), this.container.classList[this.position.includes("bottom") ? "add" : "remove"](u.IS_BOTTOM), this.container.classList[this.position.includes("x-center") ? "add" : "remove"](u.IS_X_CENTER), this.container.classList[this.position.includes("y-center") ? "add" : "remove"](u.IS_Y_CENTER);
  } }, { key: "setCloseButton", value: function t2() {
    var t3 = this;
    var e3 = document.createElement("div");
    e3.classList.add(u.NOTIFY_CLOSE), e3.innerHTML = v.CLOSE, this.wrapper.appendChild(e3), e3.addEventListener("click", function() {
      t3.close();
    });
  } }, { key: "setWrapper", value: function t2() {
    var t3 = this;
    switch (this.customWrapper ? this.wrapper = h(this.customWrapper) : this.wrapper = document.createElement("div"), this.wrapper.style.setProperty("--sn-notify-transition-duration", "".concat(this.speed, "ms")), this.wrapper.classList.add(u.NOTIFY), this.type) {
      case p.OUTLINE:
        this.wrapper.classList.add(u.NOTIFY_OUTLINE);
        break;
      case p.FILLED:
        this.wrapper.classList.add(u.NOTIFY_FILLED);
        break;
      default:
        this.wrapper.classList.add(u.NOTIFY_OUTLINE);
    }
    switch (this.status) {
      case f.SUCCESS:
        this.wrapper.classList.add(u.NOTIFY_SUCCESS);
        break;
      case f.ERROR:
        this.wrapper.classList.add(u.NOTIFY_ERROR);
        break;
      case f.WARNING:
        this.wrapper.classList.add(u.NOTIFY_WARNING);
        break;
      case f.INFO:
        this.wrapper.classList.add(u.NOTIFY_INFO);
        break;
    }
    this.autoclose && (this.wrapper.classList.add(u.NOTIFY_AUTOCLOSE), this.wrapper.style.setProperty("--sn-notify-autoclose-timeout", "".concat(this.autotimeout + this.speed, "ms"))), this.customClass && this.customClass.split(" ").forEach(function(e3) {
      t3.wrapper.classList.add(e3);
    });
  } }, { key: "setContent", value: function t2() {
    var t3 = document.createElement("div");
    t3.classList.add(u.NOTIFY_CONTENT);
    var e3, s2;
    this.title && (e3 = document.createElement("div"), e3.classList.add(u.NOTIFY_TITLE), e3.textContent = this.title.trim(), this.showCloseButton || (e3.style.paddingRight = "0")), this.text && (s2 = document.createElement("div"), s2.classList.add(u.NOTIFY_TEXT), s2.innerHTML = this.text.trim(), this.title || (s2.style.marginTop = "0")), this.wrapper.appendChild(t3), this.title && t3.appendChild(e3), this.text && t3.appendChild(s2);
  } }, { key: "setIcon", value: function t2() {
    var t3 = n(function(t4) {
      switch (t4) {
        case f.SUCCESS:
          return v.SUCCESS;
        case f.ERROR:
          return v.ERROR;
        case f.WARNING:
          return v.WARNING;
        case f.INFO:
          return v.INFO;
      }
    }, "computedIcon"), e3 = document.createElement("div");
    e3.classList.add(u.NOTIFY_ICON), e3.innerHTML = this.customIcon || t3(this.status), (this.status || this.customIcon) && this.wrapper.appendChild(e3);
  } }, { key: "setObserver", value: function t2() {
    var t3 = this;
    var e3 = new IntersectionObserver(function(e4) {
      if (e4[0].intersectionRatio <= 0) t3.close();
      else return;
    }, { threshold: 0 });
    setTimeout(function() {
      e3.observe(t3.wrapper);
    }, this.speed);
  } }, { key: "notifyIn", value: function t2(t2) {
    t2(this);
  } }, { key: "autoClose", value: function t2() {
    var t3 = this;
    setTimeout(function() {
      t3.close();
    }, this.autotimeout + this.speed);
  } }, { key: "close", value: function t2() {
    this.notifyOut(this.selectedNotifyOutEffect);
  } }, { key: "setEffect", value: function t2() {
    switch (this.effect) {
      case I.FADE:
        this.selectedNotifyInEffect = N, this.selectedNotifyOutEffect = O;
        break;
      case I.SLIDE:
        this.selectedNotifyInEffect = T, this.selectedNotifyOutEffect = E;
        break;
      default:
        this.selectedNotifyInEffect = N, this.selectedNotifyOutEffect = O;
    }
  } }]);
  return e2;
})();
n(m, "Notify");
var w = m;
globalThis.Notify = w;
const notify = (status, title, text) => {
  new w({
    status,
    title,
    text,
    effect: "fade",
    speed: 300,
    showCloseButton: true,
    autoclose: true,
    autotimeout: 3e3,
    type: "outline",
    position: "right top"
  });
};
const notifyError = (error) => {
  const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
  notify("error", "오류가 발생했습니다", errorMessage);
};
const notifyEmptyQuery = () => {
  notify("warning", "검색어를 입력해주세요", "영화 제목을 입력한 뒤 다시 시도해주세요.");
};
class LocalStorageMovieRatingRepository {
  constructor(storage) {
    this.storage = storage;
  }
  //get ratings in localstorage
  readRatings() {
    if (!this.storage) {
      return {};
    }
    try {
      const storedValue = this.storage.getItem(MOVIE_USER_RATING_STORAGE_KEY);
      if (!storedValue) {
        return {};
      }
      const parsedValue = JSON.parse(storedValue);
      if (!parsedValue) {
        return {};
      }
      const ratings = {};
      for (const [movieId, rating] of Object.entries(parsedValue)) {
        if (isMovieUserRating(rating)) {
          ratings[movieId] = rating;
        }
      }
      return ratings;
    } catch {
      return {};
    }
  }
  //set ratings in localstorage
  writeRatings(ratings) {
    if (!this.storage) {
      return;
    }
    this.storage.setItem(MOVIE_USER_RATING_STORAGE_KEY, JSON.stringify(ratings));
  }
  async get(movieId) {
    const ratings = this.readRatings();
    return ratings[String(movieId)] ?? null;
  }
  async getMany(movieIds) {
    const ratings = this.readRatings();
    const result = {};
    for (const movieId of movieIds) {
      result[movieId] = ratings[String(movieId)] ?? null;
    }
    return result;
  }
  async set(movieId, rating) {
    const ratings = this.readRatings();
    ratings[String(movieId)] = rating;
    this.writeRatings(ratings);
  }
}
const createMovieRatingRepository = (storage) => {
  if (typeof window !== "undefined") {
    return new LocalStorageMovieRatingRepository(window.localStorage);
  }
  return new LocalStorageMovieRatingRepository(null);
};
const state = createInitialMoviePageState();
const movieRatingRepository = createMovieRatingRepository();
let isLoading = false;
let failedPage = null;
const clearSkeleton = (elements) => {
  elements.skeletonCard.replaceChildren();
};
const handleAsyncError = (elements, error) => {
  clearSkeleton(elements);
  syncMoviePage(elements, state);
  notifyError(error);
};
const executeWithErrorHandling = async (elements, action) => {
  try {
    await action();
  } catch (error) {
    handleAsyncError(elements, error);
  }
};
const getMovieIdFromTarget = (target) => {
  if (!(target instanceof Element)) {
    return null;
  }
  const movieItem = target.closest(".item[data-movie-id]");
  const movieId = movieItem?.dataset.movieId;
  if (!movieId) {
    return null;
  }
  const parsedMovieId = Number(movieId);
  return Number.isNaN(parsedMovieId) ? null : parsedMovieId;
};
const blurActiveElement = () => {
  if (!(document.activeElement instanceof HTMLElement)) {
    return;
  }
  document.activeElement.blur();
};
const clearMovieDetailTriggerFocus = () => {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      blurActiveElement();
    });
    return;
  }
  blurActiveElement();
};
const hydrateMoviesWithUserRatings = async (movieList) => {
  const movieRatings = await movieRatingRepository.getMany(movieList.map(({ id }) => id));
  return applyMovieUserRatings(movieList, movieRatings);
};
const loadMovies = async (elements, query = state.query, shouldReset = false) => {
  if (isLoading) return;
  isLoading = true;
  if (shouldReset) {
    failedPage = null;
  }
  const nextPage = shouldReset ? 1 : state.currentPage + 1;
  makeSkeleton(elements.skeletonCard);
  try {
    const response = await fetchMoviePageData(nextPage, query);
    const hydratedMovieList = await hydrateMoviesWithUserRatings(response.results);
    const nextState = createNextMoviePageState(state, response, hydratedMovieList, query, shouldReset);
    Object.assign(state, nextState);
    syncMovieSectionTitle(elements, state);
    renderMovies(state.movieList, elements.movieList);
    syncMoviePage(elements, state);
    failedPage = null;
  } catch (error) {
    failedPage = nextPage;
    throw error;
  } finally {
    clearSkeleton(elements);
    isLoading = false;
  }
};
const bindEvents = (elements, detailController) => {
  const observer = new IntersectionObserver(async (entries) => {
    const entry = entries[0];
    if (!entry.isIntersecting) {
      failedPage = null;
      return;
    }
    const hasMorePages = state.currentPage < state.totalPage;
    const isFailedCurrentNextPage = failedPage === state.currentPage + 1;
    if (!isLoading && hasMorePages && !isFailedCurrentNextPage) {
      await executeWithErrorHandling(elements, () => loadMovies(elements));
    }
  });
  observer.observe(elements.infiniteScrollSentinel);
  elements.movieList.addEventListener("click", async (event) => {
    const movieId = getMovieIdFromTarget(event.target);
    if (!movieId) {
      return;
    }
    await detailController.openById(movieId);
  });
  elements.movieList.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const movieId = getMovieIdFromTarget(event.target);
    if (!movieId) {
      return;
    }
    event.preventDefault();
    await detailController.openById(movieId);
  });
  elements.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = elements.searchInput.value.trim();
    if (!query) {
      notifyEmptyQuery();
      elements.searchInput.focus();
      return;
    }
    await executeWithErrorHandling(elements, () => loadMovies(elements, query, true));
  });
  elements.heroDetailButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const heroMovie = state.movieList[0];
    if (!heroMovie) {
      return;
    }
    await detailController.openById(heroMovie.id);
  });
  elements.closeModal.addEventListener("click", () => {
    detailController.close();
  });
  elements.modalBackground.addEventListener("click", (event) => {
    if (event.target !== elements.modalBackground) {
      return;
    }
    detailController.close();
  });
  elements.modalBackground.addEventListener("close", () => {
    if (elements.modalBackground.classList.contains("active")) {
      syncMovieDetailModalClosedState(elements);
      detailController.syncClosedState();
    }
    clearMovieDetailTriggerFocus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !elements.modalBackground.open) {
      return;
    }
    detailController.close();
  });
  elements.myRatingButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const ratingValue = Number(button.dataset.userRating);
      if (!isMovieUserRating(ratingValue)) {
        return;
      }
      try {
        await detailController.updateUserRating(ratingValue);
      } catch (error) {
        notifyError(error);
      }
    });
  });
};
const main = async () => {
  const elements = getAppElements();
  const detailController = createMovieDetailController({
    elements,
    loadMovieDetail: fetchMovieDetail,
    movieRatingRepository,
    onError: notifyError,
    onMovieRated: (movieId, userRating) => {
      state.movieList = applyMovieUserRatingToMovieList(state.movieList, movieId, userRating);
    }
  });
  initializeMovieDetailModal(elements);
  bindEvents(elements, detailController);
  await executeWithErrorHandling(elements, () => loadMovies(elements));
};
window.addEventListener("load", () => {
  void main();
});
