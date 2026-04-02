export const createImageUrl = (baseUrl: string, imageUrlPath: string) => {
  console.log(imageUrlPath.length > 0);
  return imageUrlPath.length > 0 ? `${baseUrl}${imageUrlPath}` : `/images/default-thumbnail.jpeg`;
};
