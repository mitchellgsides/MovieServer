const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIES = require("./movies");
require("dotenv");

const app = express();
app.use(helmet());
app.use(morgan("tiny"));
app.use(cors());

function authorizationBearer(req, res, next) {
  const authToken = req.get("Authorization");
  const apiToken = process.env.API_TOKEN;
  console.log(authToken);
  console.log(apiToken);

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
}

app.use(authorizationBearer(req, res, next));

app.get("/movies", (req, res) => {
  let results = MOVIES;
  const { genre, country, vote } = req.query;
  if (!genre && !country && !vote) {
    return res
      .status(400)
      .send(
        "Please enter a genre, country, or average vote to search for movies"
      );
  }

  if (genre) {
    results = results.filter(movie =>
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if (country) {
    results = results.filter(movie =>
      movie.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  if (vote) {
    results = results.filter(movie => movie.avg_vote >= vote);
  }
  if (results.length > 0) {
    return res.json(results);
  }
  return res.send("Sorry, no movies match those parameters.");
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log("Welcome, movie lovers!");
});
