import type { AppElements } from "../../types/dom";
import type { MovieDetail } from "../../types/movie";
import { BASE_URL, IMAGE_URL } from "../constants/constant";
import { createImageUrl } from "./MovieService";

const createMovieCategoryText = ({ release_year, genres }: MovieDetail) => {
  return [release_year, genres.join(", ")].filter((text) => text.length > 0).join(" · ");
};

const setMovieDetailModalVisibility = (elements: AppElements, isOpen: boolean) => {
  elements.modalBackground.classList.toggle("active", isOpen);
  elements.modalBackground.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("modal-open", isOpen);
};

export const initializeMovieDetailModal = (elements: AppElements) => {
  elements.modalCloseIcon.src = IMAGE_URL.MODAL_CLOSE_BUTTON_IMAGE_URL;
  elements.modalRateIcon.src = IMAGE_URL.FILLED_STAR_IMAGE_URL;

  closeMovieDetailModal(elements);
};

export const renderMovieDetail = (movieDetail: MovieDetail, elements: AppElements) => {
  const posterImageUrl = createImageUrl(BASE_URL.DETAIL_POSTER_BASE_URL, movieDetail.poster_path ?? "");

  elements.modalPosterImage.src = posterImageUrl;
  elements.modalPosterImage.alt = movieDetail.title;
  elements.modalTitle.textContent = movieDetail.title;
  elements.modalCategory.textContent = createMovieCategoryText(movieDetail);
  elements.modalRateIcon.src = IMAGE_URL.FILLED_STAR_IMAGE_URL;
  elements.modalRateValue.textContent = String(movieDetail.rate);
  elements.modalDetail.textContent = movieDetail.overview;
};

export const openMovieDetailModal = (elements: AppElements) => {
  setMovieDetailModalVisibility(elements, true);
};

export const closeMovieDetailModal = (elements: AppElements) => {
  setMovieDetailModalVisibility(elements, false);
};
