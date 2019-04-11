const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIES = require("./movies");
require("dotenv").config();

const app = express();
app.use(helmet());
const morganSettings =
  process.env.NODE_ENC === "production" ? "tiny" : "common";
app.use(morgan(morganSettings));
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get("Authorization").split(" ")[2];
  const apiToken = process.env.API_TOKEN;

  if (!authToken || authToken !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

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

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {});
