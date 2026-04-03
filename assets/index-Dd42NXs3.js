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
  HERO_BASE_URL: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces"
};
const DEFAULT_LANGUAGE = "ko-KR";
const SKELETON_MOVIE_COUNT = 20;
const IMAGE_URL = {
  STAR_IMAGE_URL: `${PUBLIC_IMAGE_BASE_URL}star_empty.png`,
  DEFAULT_THUMBNAIL_IMAGE_URL: `${PUBLIC_IMAGE_BASE_URL}default-thumbnail.jpeg`
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
const $ = (selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`${selector} 요소를 찾을 수 없습니다`);
  }
  return element;
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
const createImageUrl = (baseUrl, imageUrlPath) => {
  return imageUrlPath.length > 0 ? `${baseUrl}${imageUrlPath}` : IMAGE_URL.DEFAULT_THUMBNAIL_IMAGE_URL;
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
const state = {
  currentPage: 0,
  totalPage: 0,
  movieList: [],
  query: ""
};
const fetchMoviePages = async (query) => {
  const response = await fetchMoviePageData(state.currentPage + 1, query);
  return response;
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
  void main().catch((error) => notifyError(error));
});
const bindEvents = (elements) => {
  elements.seeMoreBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    await loadMovies(elements);
  });
  elements.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = elements.searchInput.value.trim();
    if (!query) {
      notifyEmptyQuery();
      elements.searchInput.focus();
      return;
    }
    updateMovieState({
      currentPage: 0,
      totalPage: 0,
      movieList: [],
      query
    });
    await loadMovies(elements);
    syncHeroSection(elements);
  });
};
