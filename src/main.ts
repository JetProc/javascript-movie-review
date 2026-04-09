import type { AppElements } from "../types/dom";
import { fetchMovieDetail, fetchMoviePageData } from "./API/api";
import { PAGE_TITLE } from "./constants/constant";
import { getAppElements } from "./services/AppElementService";
import {
  clearMovieDetailModal,
  closeMovieDetailModal,
  initializeMovieDetailModal,
  openMovieDetailModal,
  renderMovieDetail,
  syncMovieDetailModalClosedState,
} from "./services/MovieDetailModalService";
import { notifyEmptyQuery, notifyError } from "./services/NotifyService";
import { makeSkeleton, renderHeroMovie, renderMovies } from "./services/RenderService";
import type { State } from "../types/state";

const state: State = {
  currentPage: 0,
  totalPage: 0,
  movieList: [],
  query: "",
};
let latestMovieDetailRequestId = 0;

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

const getMovieIdFromTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return null;
  }

  const movieItem = target.closest<HTMLElement>(".item[data-movie-id]");
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

const openMovieDetailById = async (elements: AppElements, movieId: number) => {
  const requestId = ++latestMovieDetailRequestId;

  clearMovieDetailModal(elements);

  try {
    const movieDetail = await fetchMovieDetail(movieId);

    if (requestId !== latestMovieDetailRequestId) {
      return;
    }

    renderMovieDetail(movieDetail, elements);
    openMovieDetailModal(elements);
  } catch (error) {
    if (requestId !== latestMovieDetailRequestId) {
      return;
    }

    closeMovieDetailModal(elements);
    notifyError(error);
  }
};

const main = async () => {
  const elements = getAppElements();

  initializeMovieDetailModal(elements);
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

  elements.movieList.addEventListener("click", async (event) => {
    const movieId = getMovieIdFromTarget(event.target);

    if (!movieId) {
      return;
    }

    await openMovieDetailById(elements, movieId);
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
    await openMovieDetailById(elements, movieId);
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

    await openMovieDetailById(elements, heroMovie.id);
  });

  elements.closeModal.addEventListener("click", () => {
    closeMovieDetailModal(elements);
  });

  elements.modalBackground.addEventListener("click", (event) => {
    if (event.target !== elements.modalBackground) {
      return;
    }

    closeMovieDetailModal(elements);
  });

  elements.modalBackground.addEventListener("close", () => {
    syncMovieDetailModalClosedState(elements);
    clearMovieDetailTriggerFocus();
  });
};
