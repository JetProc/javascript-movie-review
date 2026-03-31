import image from "../templates/images/star_filled.png";

addEventListener("load", () => {
  const app = document.querySelector("#app");
  const buttonImage = document.createElement("img");
  buttonImage.src = image;

  if (app) {
    app.appendChild(buttonImage);

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
      },
    };

    fetch("https://api.themoviedb.org/3/movie/popular?page=1", options)
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  }
});
