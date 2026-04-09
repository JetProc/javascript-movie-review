import { MOVIE_USER_RATING_STORAGE_KEY } from "../constants/constant";
import type { MovieUserRating } from "../../types/movie";
import { isMovieUserRating } from "../services/MovieRatingService";

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type StoredMovieRatings = Record<string, MovieUserRating>;

export interface MovieRatingRepository {
  get(movieId: number): Promise<MovieUserRating | null>;
  getMany(movieIds: number[]): Promise<Record<number, MovieUserRating | null>>;
  set(movieId: number, rating: MovieUserRating): Promise<void>;
}

class LocalStorageMovieRatingRepository implements MovieRatingRepository {
  constructor(private readonly storage?: StorageLike | null) {}

  private readRatings(): StoredMovieRatings {
    if (!this.storage) {
      return {};
    }

    try {
      const storedValue = this.storage.getItem(MOVIE_USER_RATING_STORAGE_KEY);

      if (!storedValue) {
        return {};
      }

      const parsedValue = JSON.parse(storedValue);

      if (typeof parsedValue !== "object" || parsedValue === null) {
        return {};
      }

      return Object.entries(parsedValue).reduce<StoredMovieRatings>((ratings, [movieId, rating]) => {
        if (isMovieUserRating(rating)) {
          ratings[movieId] = rating;
        }

        return ratings;
      }, {});
    } catch {
      return {};
    }
  }

  private writeRatings(ratings: StoredMovieRatings) {
    if (!this.storage) {
      return;
    }

    this.storage.setItem(MOVIE_USER_RATING_STORAGE_KEY, JSON.stringify(ratings));
  }

  async get(movieId: number) {
    const ratings = this.readRatings();

    return ratings[String(movieId)] ?? null;
  }

  async getMany(movieIds: number[]) {
    const ratings = this.readRatings();

    return movieIds.reduce<Record<number, MovieUserRating | null>>((result, movieId) => {
      result[movieId] = ratings[String(movieId)] ?? null;

      return result;
    }, {});
  }

  async set(movieId: number, rating: MovieUserRating) {
    const ratings = this.readRatings();

    ratings[String(movieId)] = rating;
    this.writeRatings(ratings);
  }
}

export const createMovieRatingRepository = (
  storage: StorageLike | null | undefined = typeof window === "undefined" ? undefined : window.localStorage,
) => {
  return new LocalStorageMovieRatingRepository(storage);
};
