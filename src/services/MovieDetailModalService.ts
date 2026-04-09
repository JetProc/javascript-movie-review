import type { AppElements } from "../../types/dom";
import type { MovieDetail } from "../../types/movie";
import { BASE_URL, IMAGE_URL } from "../constants/constant";
import { createImageUrl, formatMovieRate } from "./MovieService";

const createMovieCategoryText = ({ release_year, genres }: MovieDetail) => {
  return [release_year, genres.join(", ")].filter((text) => text.length > 0).join(" · ");
};

const setMovieDetailModalVisibility = (elements: AppElements, isOpen: boolean) => {
  elements.modalBackground.classList.toggle("active", isOpen);
  elements.modalBackground.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("modal-open", isOpen);
};

export const clearMovieDetailModal = (elements: AppElements) => {
  elements.modalPosterImage.src = "";
  elements.modalPosterImage.alt = "";
  elements.modalTitle.textContent = "";
  elements.modalCategory.textContent = "";
  elements.modalCategory.hidden = true;
  elements.modalRateIcon.src = IMAGE_URL.FILLED_STAR_IMAGE_URL;
  elements.modalRateValue.textContent = "";
  elements.modalDetail.textContent = "";
};

export const syncMovieDetailModalClosedState = (elements: AppElements) => {
  setMovieDetailModalVisibility(elements, false);
};

export const initializeMovieDetailModal = (elements: AppElements) => {
  elements.modalCloseIcon.src = IMAGE_URL.MODAL_CLOSE_BUTTON_IMAGE_URL;
  elements.modalRateIcon.src = IMAGE_URL.FILLED_STAR_IMAGE_URL;
  clearMovieDetailModal(elements);

  closeMovieDetailModal(elements);
};

export const renderMovieDetail = (movieDetail: MovieDetail, elements: AppElements) => {
  const posterImageUrl = createImageUrl(BASE_URL.DETAIL_POSTER_BASE_URL, movieDetail.poster_path ?? "");

  elements.modalPosterImage.src = posterImageUrl;
  elements.modalPosterImage.alt = movieDetail.title;
  elements.modalTitle.textContent = movieDetail.title;
  elements.modalCategory.textContent = createMovieCategoryText(movieDetail);
  elements.modalCategory.hidden = elements.modalCategory.textContent.length === 0;
  elements.modalRateIcon.src = IMAGE_URL.FILLED_STAR_IMAGE_URL;
  elements.modalRateValue.textContent = formatMovieRate(movieDetail.rate);
  elements.modalDetail.textContent = movieDetail.overview;
};

export const openMovieDetailModal = (elements: AppElements) => {
  if (!elements.modalBackground.open) {
    elements.modalBackground.showModal();
  }

  setMovieDetailModalVisibility(elements, true);
};

export const closeMovieDetailModal = (elements: AppElements) => {
  if (elements.modalBackground.open) {
    elements.modalBackground.close();
  }

  setMovieDetailModalVisibility(elements, false);
  clearMovieDetailModal(elements);
};
