import type { AppElements } from "../../types/dom";
import { $ } from "./util";

export const getAppElements = (): AppElements => ({
  movieList: $<HTMLUListElement>(".thumbnail-list"),
  siteHeader: $<HTMLElement>(".site-header"),
  searchForm: $<HTMLFormElement>("#search-form"),
  searchInput: $<HTMLInputElement>("#search-input"),
  noResult: $<HTMLDivElement>(".no-result"),
  movieSectionTitle: $<HTMLHeadingElement>(".movie-section-title"),

  heroSection: $<HTMLElement>("#hero-section"),
  heroBackdrop: $<HTMLDivElement>("#hero-backdrop"),
  heroRate: $<HTMLDivElement>("#hero-rate"),
  heroRateValue: $<HTMLSpanElement>("#hero-rate-value"),
  heroTitle: $<HTMLHeadingElement>("#hero-title"),

  skeletonCard: $<HTMLUListElement>(".skeleton-card"),
  seeMoreBtn: $<HTMLButtonElement>("#see-more-btn"),
});
