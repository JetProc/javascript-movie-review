import type { AppElements } from "../types/dom";
import { fetchMoviePageData } from "./API/api";
import { PAGE_TITLE } from "./constants/constant";
import type { State } from "../types/state";
import { getAppElements } from "./utils/AppElementUtil";
import { notifyEmptyQuery, notifyError } from "./utils/NotifyUtil";
import { makeSkeleton, renderHeroMovie, renderMovies } from "./utils/RenderUtil";

const state: State = {
  currentPage: 0,
  totalPage: 0,
  movieList: [],
  query: "",
};

const syncHeroSection = (elements: AppElements) => {
  const shouldShowHero = state.query === "" && state.movieList.length > 0;

  elements.heroSection.hidden = !shouldShowHero;
  elements.siteHeader.classList.toggle("site-header--overlay", shouldShowHero);

  if (!shouldShowHero) {
    return;
  }

  renderHeroMovie(state.movieList[0], elements);
};

const syncSeeMoreButton = (elements: AppElements) => {
  const shouldHideSeeMoreButton = state.currentPage >= state.totalPage;

  elements.seeMoreBtn.hidden = shouldHideSeeMoreButton;
};

const syncNoResultSection = (elements: AppElements) => {
  const shouldHideNoResultSection = !(state.query !== "" && state.movieList.length === 0);

  elements.noResult.hidden = shouldHideNoResultSection;
};

const updateMovieState = (newState: State) => {
  state.query = newState.query;
  state.currentPage = newState.currentPage;
  state.totalPage = newState.totalPage;
  state.movieList = newState.movieList;
};

const clearSkeleton = (elements: AppElements) => {
  elements.skeletonCard.replaceChildren();
};

const syncPage = (elements: AppElements) => {
  syncHeroSection(elements);
  syncSeeMoreButton(elements);
  syncNoResultSection(elements);
};

const loadMovies = async (elements: AppElements, query: string = state.query, shouldReset = false) => {
  const nextPage = shouldReset ? 1 : state.currentPage + 1;
  const previousMovieList = shouldReset ? [] : state.movieList;

  makeSkeleton(elements.skeletonCard);

  try {
    const response = await fetchMoviePageData(nextPage, query);

    updateMovieState({
      currentPage: response.currentPage,
      totalPage: response.totalPages,
      movieList: [...previousMovieList, ...response.results],
      query,
    });

    if (state.currentPage === 1) {
      elements.movieSectionTitle.textContent = state.query ? PAGE_TITLE.SEARCH(state.query) : PAGE_TITLE.POPULAR;
    }

    renderMovies(state.movieList, elements.movieList);
    syncPage(elements);
  } finally {
    clearSkeleton(elements);
  }
};

const initializeMoviePage = async (elements: AppElements) => {
  await loadMovies(elements);
};

const handleAsyncError = (elements: AppElements, error: unknown) => {
  clearSkeleton(elements);
  syncPage(elements);
  notifyError(error);
};

const executeWithErrorHandling = async (elements: AppElements, action: () => Promise<void>) => {
  try {
    await action();
  } catch (error) {
    handleAsyncError(elements, error);
  }
};

const main = async () => {
  const elements = getAppElements();

  bindEvents(elements);

  await executeWithErrorHandling(elements, () => initializeMoviePage(elements));
};

window.addEventListener("load", () => {
  void main();
});

const bindEvents = (elements: AppElements) => {
  elements.seeMoreBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    await executeWithErrorHandling(elements, () => loadMovies(elements));
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
};
