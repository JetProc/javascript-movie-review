import { AppElements } from "../types/dom";
import { Movie } from "../types/movie";
import { fetchMoviePageData } from "./API/api";
import { FetchMoviePageDataResponse } from "./API/config";
import { BASE_URL, SKELETON_MOVIE_COUNT } from "./constants/constant";
import starImage from "./images/star_empty.png";
import { State } from "../types/state";
import { createImageUrl } from "./utils/MovieUtil";
import { $ } from "./utils/util";

const state: State = {
  currentPage: 0,
  totalPage: 0,
  movieList: [],
  query: "",
};

// DOM 한 번에 가져오는 함수
const getAppElements = (): AppElements => ({
  movieList: $<HTMLUListElement>(".thumbnail-list"),
  searchForm: $<HTMLFormElement>("#search-form"),
  searchInput: $<HTMLInputElement>("#search-input"),

  heroBackdrop: $<HTMLDivElement>("#hero-backdrop"),
  heroRate: $<HTMLDivElement>("#hero-rate"),
  heroRateValue: $<HTMLSpanElement>("#hero-rate-value"),
  heroTitle: $<HTMLHeadingElement>("#hero-title"),

  skeletonCard: $<HTMLUListElement>(".skeleton-card"),
  seeMoreBtn: $<HTMLButtonElement>("#see-more-btn"),
});

// 쿼리를 받아서 fetch 함
const fetchMoviePages = async (query: string): Promise<FetchMoviePageDataResponse> => {
  const response: FetchMoviePageDataResponse = await fetchMoviePageData(state.currentPage + 1, query);

  updateMovieState({
    currentPage: response.currentPage,
    totalPage: response.totalPages,
    movieList: response.results,
    query: query,
  });

  return response;
};

//
const createMovieListItemMarkup = (movie: Movie) => {
  if (!movie.thumbnail_path) movie.thumbnail_path = `../images/default-thumbnail.jpeg`;

  const posterImageUrl = createImageUrl(BASE_URL.POSTER_BASE_URL, movie.thumbnail_path);

  return /* html */ `<li>
    <div class="item">
      <img class="thumbnail" src="${posterImageUrl}" alt="${movie.title}" />
      <div class="item-desc">
        <p class="rate">
          <img src="${starImage}" class="star" alt="" aria-hidden="true" />
          <span>${movie.rate}</span>
        </p>
        <strong>${movie.title}</strong>
      </div>
    </div>
  </li>`;
};

const renderMovies = (movies: Movie[], movieListElement: HTMLUListElement) => {
  movieListElement.innerHTML = movies.map(createMovieListItemMarkup).join("");
};

const renderHeroMovie = (movie: Movie, elements: AppElements) => {
  const posterImageUrl = createImageUrl(BASE_URL.HERO_BASE_URL, movie.hero_path!);

  elements.heroBackdrop.style.backgroundImage = posterImageUrl ? `url("${posterImageUrl}")` : "";
  elements.heroRate.hidden = false;
  elements.heroRateValue.textContent = String(movie.rate);
  elements.heroTitle.textContent = movie.title;
};

const updateMovieState = (newState: State) => {
  state.query = newState.query;
  state.currentPage = newState.currentPage;
  state.totalPage = newState.totalPage;
  state.movieList = newState.movieList;
};

// const createMovieQuery = (query: string) => {
//   const normalizedQuery = query.trim();

//   return normalizedQuery;
// };

const loadMovies = async (state: State, elements: AppElements, query = "") => {
  elements.skeletonCard.innerHTML = makeSkeleton();

  // const movieQuery = createMovieQuery(query);
  const firstPage = await fetchMoviePages(query);

  //popular일 때만 hero => state에 query가 없을때만 hero
  // if (!state.query) {
  //   renderHeroMovie(firstPage.results[0], elements.hero);
  // }
  if (!state.query) {
    renderHeroMovie(firstPage.results[0], elements);
  }

  elements.skeletonCard.innerHTML = "";

  renderMovies(state.movieList, elements.movieList);
  // console.log(state.visibleMovies);
};

const initializeMoviePage = async (state: State, elements: AppElements) => {
  await loadMovies(state, elements);

  elements.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadMovies(state, elements, elements.searchInput.value);
  });
};

const main = async () => {
  const elements = getAppElements();

  // bindEvents(elements);

  await initializeMoviePage(state, elements);
};

//todo: throw error를 콘솔이 아니라 ui로 변경해야 함
window.addEventListener("load", () => {
  void main().catch((error) => console.log(error));
});

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

  return Array.from({ length: SKELETON_MOVIE_COUNT }, () => skeletonItemMarkup).join("");
};
