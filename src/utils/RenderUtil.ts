import type { AppElements } from "../../types/dom";
import type { Movie } from "../../types/movie";
import { BASE_URL, IMAGE_URL, SKELETON_MOVIE_COUNT } from "../constants/constant";
import { createImageUrl } from "./MovieUtil";

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

export const renderMovies = (movies: Movie[], movieListElement: HTMLUListElement) => {
  movieListElement.innerHTML = movies.map(createMovieListItemMarkup).join("");
};

export const renderHeroMovie = (movie: Movie, elements: AppElements) => {
  const posterImageUrl = createImageUrl(BASE_URL.HERO_BASE_URL, movie.hero_path ?? "");

  elements.heroBackdrop.style.backgroundImage = posterImageUrl ? `url("${posterImageUrl}")` : "";
  elements.heroRate.hidden = false;
  elements.heroRateValue.textContent = String(movie.rate);
  elements.heroTitle.textContent = movie.title;
};

export const makeSkeleton = (skeletonCardElement: HTMLUListElement) => {
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
