export const createImageUrl = (baseUrl: string, imageUrlPath: string) =>
  imageUrlPath ? `${baseUrl}${imageUrlPath}` : `../images/default-thumbnail.jpeg`;
