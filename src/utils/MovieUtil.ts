import { IMAGE_URL } from "../constants/constant";

export const createImageUrl = (baseUrl: string, imageUrlPath: string) => {
  console.log(imageUrlPath.length > 0);
  return imageUrlPath.length > 0 ? `${baseUrl}${imageUrlPath}` : IMAGE_URL.DEFAULT_THUMBNAIL_IMAGE_URL;
};
