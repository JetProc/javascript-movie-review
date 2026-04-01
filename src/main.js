import starImage from "./images/star_empty.png";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const HERO_BASE_URL = "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces";
const DEFAULT_LANGUAGE = "ko-KR";
const INITIAL_PAGE = 1;
const SKELETON_MOVIE_COUNT = 20;

const MOVIE_LIST_TYPE = {
  POPULAR: "popular",
  SEARCH: "search",
};

// interface Movie {
//   id: number;
//   title: string;
//   vote_average: number;
//   poster_path: string | null;
// }

const $ = (selector) => {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`${selector} 요소를 찾을 수 없습니다`);
  }

  return element;
};

// DOM 한 번에 가져오는 함수
const getAppElements = () => ({
  movieList: $(".thumbnail-list"),
  searchForm: $("#search-form"),
  searchInput: $("#search-input"),
  hero: {
    heroBackdrop: $("#hero-backdrop"),
    heroRate: $("#hero-rate"),
    heroRateValue: $("#hero-rate-value"),
    heroTitle: $("#hero-title"),
  },
  skeletonCard: $(".skeleton-card"),
  seeMoreBtn: $("#see-more-btn"),
});

//이 Movie state를 타입으로 만들어야 할 듯
const createInitialMovieState = {
  type: MOVIE_LIST_TYPE.POPULAR,
  query: "",
  currentPage: 0,
  totalPages: 0,
  visibleMovies: [], //현재 보이는 영화들
};

//option을 type? 상수?
const createRequestOptions = () => ({
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
  },
});

// 이것도 타입? 정규식?으로 해야할지
const createPosterImageUrl = (baseURL, posterPath) =>
  posterPath ? `${baseURL}${posterPath}` : "";

//이건 TS 제네릭 써서 공통으로 묶는 걸로 만들어야될 듯
const getMovieEndpointPath = (type) =>
  type === MOVIE_LIST_TYPE.SEARCH ? "/search/movie" : "/movie/popular";

//이 함수도 TS로 바꾸면서 없어져야 할 것 같아요 > 지금은 쿼리 여부에 따라 search인지 popular인지 구분하는데 더 좋은 방법 고민, 혹은 제너릭 잘 사용
const resolveMovieListType = (query) =>
  query ? MOVIE_LIST_TYPE.SEARCH : MOVIE_LIST_TYPE.POPULAR;

//사실 위의 함수들이 다 이 함수를 위한 유틸이긴 합니다. 즉, API url 만들기 위해 필요한 정보들 주는 함수들
const createMovieApiUrl = ({ type, query, page }) => {
  const url = new URL(`${TMDB_BASE_URL}${getMovieEndpointPath(type)}`);

  url.searchParams.set("language", DEFAULT_LANGUAGE);
  url.searchParams.set("page", String(page));

  if (type === MOVIE_LIST_TYPE.SEARCH) {
    url.searchParams.set("query", query);
  }

  return url;
};

const parseMoviePageResponse = async (response, fallbackPage) => {
  const data = await response.json();

  return {
    page: data.page ?? fallbackPage,
    totalPages: data.total_pages ?? 0,
    results: data.results ?? [],
  };
};

const fetchMoviePage = async ({ type, query, page }) => {
  const response = await fetch(
    createMovieApiUrl({ type, query, page }),
    createRequestOptions(),
  );

  if (!response.ok) {
    throw new Error(`영화 정보를 불러오는데 실패했습니다: ${response.status}`);
  }

  return parseMoviePageResponse(response, page);
};

const fetchInitialMoviePages = async ({ type, query }) => {
  const firstPage = await fetchMoviePage({
    type,
    query,
    page: INITIAL_PAGE,
  });
  const nextPageNumber = firstPage.page + 1;

  if (nextPageNumber > firstPage.totalPages) {
    return { firstPage };
  }

  return { firstPage };
};

const createMovieListItemMarkup = (movie) => {
  const posterImageUrl = createPosterImageUrl(
    POSTER_BASE_URL,
    movie.poster_path,
  );

  return /* html */ `<li>
    <div class="item">
      <img class="thumbnail" src="${posterImageUrl}" alt="${movie.title}" />
      <div class="item-desc">
        <p class="rate">
          <img src="${starImage}" class="star" alt="" aria-hidden="true" />
          <span>${movie.vote_average}</span>
        </p>
        <strong>${movie.title}</strong>
      </div>
    </div>
  </li>`;
};

const renderMovies = (movies, movieList) => {
  movieList.innerHTML = movies.map(createMovieListItemMarkup).join("");
};

const renderHeroMovie = (movie, hero) => {
  const posterImageUrl = createPosterImageUrl(
    HERO_BASE_URL,
    movie.backdrop_path,
  );

  hero.heroBackdrop.style.backgroundImage = posterImageUrl
    ? `url("${posterImageUrl}")`
    : "";
  hero.heroRate.hidden = false;
  hero.heroRateValue.textContent = String(movie.vote_average ?? "");
  hero.heroTitle.textContent = movie.title ?? "";
};

const updateMovieState = (
  state,
  { type, query, firstPage, prefetchedPage },
) => {
  state.type = type;
  state.query = query;
  state.currentPage = firstPage.page;
  state.totalPages = firstPage.totalPages;
  state.visibleMovies = firstPage.results;
};

const createMovieQuery = (query) => {
  const normalizedQuery = query.trim();

  return {
    type: resolveMovieListType(normalizedQuery), //popular인지 searçh인지
    query: normalizedQuery,
  };
};

const loadMovies = async (state, elements, query = "") => {
  elements.skeletonCard.innerHTML = makeSkeleton();

  const movieQuery = createMovieQuery(query);
  const { firstPage, prefetchedPage } =
    await fetchInitialMoviePages(movieQuery);

  updateMovieState(state, {
    ...movieQuery,
    firstPage,
    prefetchedPage,
  });

  //popular일 때만 hero
  if (movieQuery.type === MOVIE_LIST_TYPE.POPULAR) {
    renderHeroMovie(firstPage.results[0], elements.hero);
  }

  elements.skeletonCard.innerHTML = "";

  renderMovies(state.visibleMovies, elements.movieList);
  // console.log(state.visibleMovies);
};

const initializeMoviePage = async (state, elements) => {
  await loadMovies(state, elements);

  elements.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadMovies(state, elements, elements.searchInput.value);
  });
};

const main = async () => {
  const state = createInitialMovieState;
  const elements = getAppElements();

  // bindEvents(elements);

  await initializeMoviePage(state, elements);
};

//todo: throw error를 콘솔이 아니라 ui로 변경해야 함
window.addEventListener("load", () => {
  void main().catch((error) => console.log(error));
});

// function bindEvents(elements) {
//   elements.seeMoreBtn.addEventListener("click", () => {
//     const newState = {
//       type: MOVIE_LIST_TYPE.POPULAR,
//       query: "",
//       currentPage: currentPage + 1,
//       totalPages: 0,
//       visibleMovies: [], //현재 보이는 영화들
//     };

//     loadMovies({ newState, elements });
//   });
// }
const makeSkeleton = () => {
  const skeletonItemMarkup = /* html */ `<li>
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
  </li>`;

  return Array.from(
    { length: SKELETON_MOVIE_COUNT },
    () => skeletonItemMarkup,
  ).join("");
};
