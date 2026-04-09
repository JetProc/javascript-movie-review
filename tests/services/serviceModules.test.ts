import { afterEach, describe, expect, it, vi } from "vitest";

import { BASE_URL, IMAGE_URL } from "../../src/constants/constant";
import { getAppElements } from "../../src/services/AppElementService";
import {
  closeMovieDetailModal,
  initializeMovieDetailModal,
  openMovieDetailModal,
  renderMovieDetail,
} from "../../src/services/MovieDetailModalService";
import { createImageUrl } from "../../src/services/MovieService";
import { renderHeroMovie } from "../../src/services/RenderService";

const { notifyConstructorMock } = vi.hoisted(() => ({
  notifyConstructorMock: vi.fn(),
}));

vi.mock("simple-notify", () => ({
  default: notifyConstructorMock,
}));

vi.mock("simple-notify/dist/simple-notify.css", () => ({}));

import { notifyEmptyQuery, notifyError } from "../../src/services/NotifyService";

const createStubElement = <T extends Element>(name: string) => ({ name }) as unknown as T;

describe("service-like modules", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("앱에서 사용하는 주요 DOM 요소를 조회한다", () => {
    const elementBySelector = new Map<string, Element>([
      [".thumbnail-list", createStubElement<HTMLUListElement>("movieList")],
      [".site-header", createStubElement<HTMLElement>("siteHeader")],
      ["#search-form", createStubElement<HTMLFormElement>("searchForm")],
      ["#search-input", createStubElement<HTMLInputElement>("searchInput")],
      [".no-result", createStubElement<HTMLDivElement>("noResult")],
      [".movie-section-title", createStubElement<HTMLHeadingElement>("movieSectionTitle")],
      ["#hero-section", createStubElement<HTMLElement>("heroSection")],
      ["#hero-backdrop", createStubElement<HTMLDivElement>("heroBackdrop")],
      ["#hero-rate", createStubElement<HTMLDivElement>("heroRate")],
      ["#hero-rate-value", createStubElement<HTMLSpanElement>("heroRateValue")],
      ["#hero-title", createStubElement<HTMLHeadingElement>("heroTitle")],
      [".hero-detail-button", createStubElement<HTMLButtonElement>("heroDetailButton")],
      [".skeleton-card", createStubElement<HTMLUListElement>("skeletonCard")],
      ["#see-more-btn", createStubElement<HTMLButtonElement>("seeMoreBtn")],
      ["#modalBackground", createStubElement<HTMLDivElement>("modalBackground")],
      ["#closeModal", createStubElement<HTMLButtonElement>("closeModal")],
      ["#modalCloseIcon", createStubElement<HTMLImageElement>("modalCloseIcon")],
      ["#modalPosterImage", createStubElement<HTMLImageElement>("modalPosterImage")],
      ["#modalTitle", createStubElement<HTMLHeadingElement>("modalTitle")],
      ["#modalCategory", createStubElement<HTMLParagraphElement>("modalCategory")],
      ["#modalRateIcon", createStubElement<HTMLImageElement>("modalRateIcon")],
      ["#modalRateValue", createStubElement<HTMLSpanElement>("modalRateValue")],
      ["#modalDetail", createStubElement<HTMLParagraphElement>("modalDetail")],
    ]);

    const querySelector = vi.fn((selector: string) => elementBySelector.get(selector) ?? null);

    vi.stubGlobal("document", {
      querySelector,
    } as Pick<Document, "querySelector">);

    const elements = getAppElements();

    expect(querySelector).toHaveBeenCalledWith(".thumbnail-list");
    expect(querySelector).toHaveBeenCalledWith("#search-form");
    expect(querySelector).toHaveBeenCalledWith("#hero-backdrop");
    expect(querySelector).toHaveBeenCalledWith("#see-more-btn");
    expect(querySelector).toHaveBeenCalledWith("#modalBackground");
    expect(elements).toMatchObject({
      movieList: elementBySelector.get(".thumbnail-list"),
      siteHeader: elementBySelector.get(".site-header"),
      searchForm: elementBySelector.get("#search-form"),
      searchInput: elementBySelector.get("#search-input"),
      noResult: elementBySelector.get(".no-result"),
      movieSectionTitle: elementBySelector.get(".movie-section-title"),
      heroSection: elementBySelector.get("#hero-section"),
      heroBackdrop: elementBySelector.get("#hero-backdrop"),
      heroRate: elementBySelector.get("#hero-rate"),
      heroRateValue: elementBySelector.get("#hero-rate-value"),
      heroTitle: elementBySelector.get("#hero-title"),
      heroDetailButton: elementBySelector.get(".hero-detail-button"),
      skeletonCard: elementBySelector.get(".skeleton-card"),
      seeMoreBtn: elementBySelector.get("#see-more-btn"),
      modalBackground: elementBySelector.get("#modalBackground"),
      closeModal: elementBySelector.get("#closeModal"),
      modalCloseIcon: elementBySelector.get("#modalCloseIcon"),
      modalPosterImage: elementBySelector.get("#modalPosterImage"),
      modalTitle: elementBySelector.get("#modalTitle"),
      modalCategory: elementBySelector.get("#modalCategory"),
      modalRateIcon: elementBySelector.get("#modalRateIcon"),
      modalRateValue: elementBySelector.get("#modalRateValue"),
      modalDetail: elementBySelector.get("#modalDetail"),
    });
  });

  it("이미지 경로가 있으면 baseUrl과 합쳐서 반환한다", () => {
    expect(createImageUrl(BASE_URL.POSTER_BASE_URL, "/poster.jpg")).toBe(`${BASE_URL.POSTER_BASE_URL}/poster.jpg`);
  });

  it("이미지 경로가 없으면 기본 썸네일을 반환한다", () => {
    expect(createImageUrl(BASE_URL.POSTER_BASE_URL, "")).toBe(IMAGE_URL.DEFAULT_THUMBNAIL_IMAGE_URL);
  });

  it("히어로 영역을 현재 영화 정보로 동기화한다", () => {
    const elements = {
      heroBackdrop: {
        style: {
          backgroundImage: "",
        },
      },
      heroRate: {
        hidden: true,
      },
      heroRateValue: {
        textContent: "",
      },
      heroTitle: {
        textContent: "",
      },
    };

    renderHeroMovie(
      {
        id: 1,
        title: "해리 포터와 마법사의 돌",
        rate: 7.8,
        thumbnail_path: "/poster.jpg",
        hero_path: "/backdrop.jpg",
      },
      elements as never,
    );

    expect(elements.heroBackdrop.style.backgroundImage).toBe(`url("${BASE_URL.HERO_BASE_URL}/backdrop.jpg")`);
    expect(elements.heroRate.hidden).toBe(false);
    expect(elements.heroRateValue.textContent).toBe("7.8");
    expect(elements.heroTitle.textContent).toBe("해리 포터와 마법사의 돌");
  });

  it("상세 모달 요소를 초기화하고 영화 상세 정보를 렌더링한다", () => {
    const modalBackgroundClassToggle = vi.fn();
    const modalBackgroundSetAttribute = vi.fn();
    const bodyClassToggle = vi.fn();

    vi.stubGlobal(
      "document",
      {
        body: {
          classList: {
            toggle: bodyClassToggle,
          },
        },
      } as Pick<Document, "body">,
    );

    const elements = {
      modalBackground: {
        classList: {
          toggle: modalBackgroundClassToggle,
        },
        setAttribute: modalBackgroundSetAttribute,
      },
      modalCloseIcon: {
        src: "",
      },
      modalPosterImage: {
        src: "",
        alt: "",
      },
      modalTitle: {
        textContent: "",
      },
      modalCategory: {
        textContent: "",
      },
      modalRateIcon: {
        src: "",
      },
      modalRateValue: {
        textContent: "",
      },
      modalDetail: {
        textContent: "",
      },
    };

    initializeMovieDetailModal(elements as never);

    expect(elements.modalCloseIcon.src).toBe(IMAGE_URL.MODAL_CLOSE_BUTTON_IMAGE_URL);
    expect(elements.modalRateIcon.src).toBe(IMAGE_URL.FILLED_STAR_IMAGE_URL);
    expect(modalBackgroundClassToggle).toHaveBeenCalledWith("active", false);
    expect(modalBackgroundSetAttribute).toHaveBeenCalledWith("aria-hidden", "true");
    expect(bodyClassToggle).toHaveBeenCalledWith("modal-open", false);

    renderMovieDetail(
      {
        poster_path: "/detail-poster.jpg",
        title: "인사이드 아웃 2",
        release_year: "2024",
        genres: ["모험", "애니메이션"],
        rate: 7.7,
        overview: "새로운 감정들이 등장하며 벌어지는 이야기",
      },
      elements as never,
    );
    openMovieDetailModal(elements as never);

    expect(elements.modalPosterImage.src).toBe(`${BASE_URL.DETAIL_POSTER_BASE_URL}/detail-poster.jpg`);
    expect(elements.modalPosterImage.alt).toBe("인사이드 아웃 2");
    expect(elements.modalTitle.textContent).toBe("인사이드 아웃 2");
    expect(elements.modalCategory.textContent).toBe("2024 · 모험, 애니메이션");
    expect(elements.modalRateIcon.src).toBe(IMAGE_URL.FILLED_STAR_IMAGE_URL);
    expect(elements.modalRateValue.textContent).toBe("7.7");
    expect(elements.modalDetail.textContent).toBe("새로운 감정들이 등장하며 벌어지는 이야기");
    expect(modalBackgroundClassToggle).toHaveBeenCalledWith("active", true);
    expect(modalBackgroundSetAttribute).toHaveBeenCalledWith("aria-hidden", "false");
    expect(bodyClassToggle).toHaveBeenCalledWith("modal-open", true);

    closeMovieDetailModal(elements as never);

    expect(modalBackgroundClassToggle).toHaveBeenLastCalledWith("active", false);
    expect(modalBackgroundSetAttribute).toHaveBeenLastCalledWith("aria-hidden", "true");
    expect(bodyClassToggle).toHaveBeenLastCalledWith("modal-open", false);
  });

  it("오류 알림을 표시한다", () => {
    notifyError(new Error("네트워크 오류"));

    expect(notifyConstructorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        title: "오류가 발생했습니다",
        text: "네트워크 오류",
      }),
    );
  });

  it("빈 검색어 알림을 표시한다", () => {
    notifyEmptyQuery();

    expect(notifyConstructorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "warning",
        title: "검색어를 입력해주세요",
        text: "영화 제목을 입력한 뒤 다시 시도해주세요.",
      }),
    );
  });
});
