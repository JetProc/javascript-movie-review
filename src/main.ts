import type { AppElements } from "../types/dom";
import type { Movie } from "../types/movie";
import { fetchMoviePageData } from "./API/api";
import type { FetchMoviePageDataResponse } from "./API/api.types";
import { BASE_URL, SKELETON_MOVIE_COUNT, IMAGE_URL } from "./constants/constant";
import type { State } from "../types/state";
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
  siteHeader: $<HTMLElement>(".site-header"),
  searchForm: $<HTMLFormElement>("#search-form"),
  searchInput: $<HTMLInputElement>("#search-input"),

  heroSection: $<HTMLElement>("#hero-section"),
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

  return response;
};

const createMovieListItemMarkup = (movie: Movie) => {
  const posterImageUrl = createImageUrl(BASE_URL.POSTER_BASE_URL, movie.thumbnail_path ?? "");

  return /* html */ `<li>
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
  </li>`;
};

const renderMovies = (movies: Movie[], movieListElement: HTMLUListElement) => {
  movieListElement.innerHTML = movies.map(createMovieListItemMarkup).join("");
};

const renderHeroMovie = (movie: Movie, elements: AppElements) => {
  const posterImageUrl = createImageUrl(BASE_URL.HERO_BASE_URL, movie.hero_path ?? "");

  elements.heroBackdrop.style.backgroundImage = posterImageUrl ? `url("${posterImageUrl}")` : "";
  elements.heroRate.hidden = false;
  elements.heroRateValue.textContent = String(movie.rate);
  elements.heroTitle.textContent = movie.title;
};

const syncHeroSection = (elements: AppElements) => {
  const shouldShowHero = state.query === "" && state.movieList.length > 0;

  elements.heroSection.hidden = !shouldShowHero;

  if (!shouldShowHero) {
    return;
  }

  renderHeroMovie(state.movieList[0], elements);
};

const syncSeeMoreButton = (elements: AppElements) => {
  const shouldHideSeeMoreButton = state.currentPage >= state.totalPage;

  elements.seeMoreBtn.hidden = shouldHideSeeMoreButton;
};

const updateMovieState = (newState: State) => {
  state.query = newState.query;
  state.currentPage = newState.currentPage;
  state.totalPage = newState.totalPage;
  state.movieList = newState.movieList;
};

const makeSkeleton = (skeletonCardElement: HTMLUListElement) => {
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

  skeletonCardElement.innerHTML = Array.from({ length: SKELETON_MOVIE_COUNT }, () => skeletonItemMarkup).join("");
};

const loadMovies = async (elements: AppElements) => {
  makeSkeleton(elements.skeletonCard);

  const response = await fetchMoviePages(state.query);

  updateMovieState({
    currentPage: response.currentPage,
    totalPage: response.totalPages,
    movieList: [...state.movieList, ...response.results],
    query: state.query,
  });

  elements.skeletonCard.innerHTML = "";

  renderMovies(state.movieList, elements.movieList);
  syncSeeMoreButton(elements);
};

const initializeMoviePage = async (elements: AppElements) => {
  await loadMovies(elements);
  syncHeroSection(elements);
};

const main = async () => {
  const elements = getAppElements();

  bindEvents(elements);

  await initializeMoviePage(elements);
};

//todo: throw error를 콘솔이 아니라 ui로 변경해야 함
window.addEventListener("load", () => {
  void main().catch((error) => console.log(error));
});

const bindEvents = (elements: AppElements) => {
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
      query,
    });
    console.log(query);

    await loadMovies(elements);
    syncHeroSection(elements);
  });
};
