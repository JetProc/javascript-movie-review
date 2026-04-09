export interface AppElements {
  movieList: HTMLUListElement;
  siteHeader: HTMLElement;
  searchForm: HTMLFormElement;
  searchInput: HTMLInputElement;
  noResult: HTMLDivElement;
  movieSectionTitle: HTMLHeadingElement;

  heroSection: HTMLElement;
  heroBackdrop: HTMLDivElement;
  heroRate: HTMLDivElement;
  heroRateValue: HTMLSpanElement;
  heroTitle: HTMLHeadingElement;
  heroDetailButton: HTMLButtonElement;

  skeletonCard: HTMLUListElement;
  seeMoreBtn: HTMLButtonElement;

  modalBackground: HTMLDialogElement;
  closeModal: HTMLButtonElement;
  modalCloseIcon: HTMLImageElement;
  modalPosterImage: HTMLImageElement;
  modalTitle: HTMLHeadingElement;
  modalCategory: HTMLParagraphElement;
  modalRateIcon: HTMLImageElement;
  modalRateValue: HTMLSpanElement;
  myRatingMessage: HTMLSpanElement;
  myRatingScore: HTMLSpanElement;
  myRatingButtons: HTMLButtonElement[];
  modalDetail: HTMLParagraphElement;
}
