const MOVIES_PER_PAGE = 20;
const TOTAL_PAGES = 4;

const createMovie = (id: number) => ({
  id,
  title: `영화 ${id}`,
  vote_average: 7.5,
  poster_path: `/poster-${id}.jpg`,
  backdrop_path: `/backdrop-${id}.jpg`,
});

const createMoviePageResponse = (page: number) => ({
  page,
  total_pages: TOTAL_PAGES,
  results: Array.from({ length: MOVIES_PER_PAGE }, (_, index) => createMovie((page - 1) * MOVIES_PER_PAGE + index + 1)),
});

const mockPopularMoviePage = (page: number) => {
  cy.intercept(
    {
      method: "GET",
      hostname: "api.themoviedb.org",
      pathname: "/3/movie/popular",
      query: {
        language: "ko-KR",
        page: `${page}`,
      },
    },
    {
      delay: 300,
      body: createMoviePageResponse(page),
    },
  ).as(`getPopularMoviesPage${page}`);
};

const expectSkeletonUi = () => {
  cy.get(".skeleton-card .thumbnail-skeleton").should("have.length", MOVIES_PER_PAGE);
};

const expectMovieList = (page: number) => {
  const loadedMovieCount = page * MOVIES_PER_PAGE;
  const firstMovieTitle = "영화 1";
  const lastMovieTitle = `영화 ${loadedMovieCount}`;

  cy.get(".thumbnail-list li").should("have.length", loadedMovieCount);
  cy.contains(".thumbnail-list strong", firstMovieTitle).should("be.visible");
  cy.contains(".thumbnail-list strong", lastMovieTitle).should("be.visible");
  cy.get(".skeleton-card").should("be.empty");
};

const clickSeeMoreAndVerify = (page: number) => {
  cy.get("#see-more-btn").should("be.visible").click();
  expectSkeletonUi();
  cy.wait(`@getPopularMoviesPage${page}`);
  expectMovieList(page);
};

describe("메인 화면", () => {
  beforeEach(() => {
    Array.from({ length: TOTAL_PAGES }, (_, index) => index + 1).forEach(mockPopularMoviePage);
  });

  it("초기 로드 후 더보기 버튼으로 영화 목록을 3번 더 불러온다", () => {
    cy.visit("https://jetproc.github.io/javascript-movie-review");

    expectSkeletonUi();
    cy.wait("@getPopularMoviesPage1");
    expectMovieList(1);

    clickSeeMoreAndVerify(2);
    clickSeeMoreAndVerify(3);
    clickSeeMoreAndVerify(4);

    cy.get("#see-more-btn").should("not.be.visible");
  });
});
