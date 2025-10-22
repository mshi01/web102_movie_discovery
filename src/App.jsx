import { useState } from 'react'
import './App.css'

const API_KEY = "ad832014"

function App() {
  const [movie, setMovie] = useState(null)
  const [bannedList, setBannedList] = useState([])
  const [viewedList, setViewedList] = useState([])

  const keywords = ["child", "love", "man", "war", "girl", "humor", "cartoon", "life"];

  const getRandomMovie = async () => {
    let data = null;
    let attempts = 0;

    while (attempts < 15) {
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      const randomPage = Math.floor(Math.random() * 10) + 1;

      const searchResponse = await fetch(
        `https://www.omdbapi.com/?s=${randomKeyword}&page=${randomPage}&apikey=${API_KEY}`
      );
      const searchData = await searchResponse.json();

      if (searchData.Response === "True") {
        // Pick a random movie from the search results
        const randomMovie = searchData.Search[
          Math.floor(Math.random() * searchData.Search.length)
        ];

        // Fetch full details for that movie
        const detailResponse = await fetch(
          `https://www.omdbapi.com/?i=${randomMovie.imdbID}&apikey=${API_KEY}`
        );
        const detailData = await detailResponse.json();

        if (detailData.Response === "True" && detailData.Poster !== "N/A" && !isBanned(detailData)) {
          data = detailData;
          break;
        }
      }

      attempts++;
    }

    setMovie(data);
    setViewedList((prev) =>
        prev.some((m) => m.imdbID === data.imdbID)
          ? prev
          : [...prev, { title: data.Title, year: data.Year }]
      );
  };

  const isBanned = (movie) => {
    const genres = movie.Genre?.split(",").map((g) => g.trim()) || [];
    const director = movie.Director?.trim();
    return genres.some((g) => bannedList.includes(g)) || bannedList.includes(director);
  };

  const handleBan = (value) => {
    if (!bannedList.includes(value)) setBannedList([...bannedList, value]);
  };

  const handleUnban = (value) => {
    setBannedList(bannedList.filter((v) => v !== value));
  };

  return (
    <div className="app">
      <h1>Explore Movies You'll Love</h1>
<div className="container">
  <div className="viewed-list">
          <h3>🎥 Viewed Movies</h3>
          {viewedList.length === 0 ? (
            <p>No movies viewed yet.</p>
          ) : (
            <ul>
              {viewedList.map((m) => (
                <li key={m.title}>{m.title} ({m.year})</li>
              ))}
            </ul>
          )}
        </div>

      <div className="movie-container">
      {movie && (
        <div className="movie-card">
          <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
          <h2>{movie.Title}</h2>
          <p>
            <strong>Year:</strong> {movie.Year}
          </p>
          <p>
            <strong>Genre:</strong>{" "}
            {movie.Genre.split(",").map((g) => (
              <span key={g} className="clickable" onClick={() => handleBan(g.trim())}>
                {g.trim()}
              </span>
            ))}
          </p>
          <p>
            <strong>Director:</strong>{" "}
            <span className="clickable" onClick={() => handleBan(movie.Director.trim())}>
              {movie.Director}
            </span>
          </p>
          <p>
            <strong>Plot:</strong> {movie.Plot}
          </p>
        </div>
      )}

      <button onClick={getRandomMovie}>Discover Movie</button>
      </div>

      <div className="ban-list">
        <h3>🚫 Banned List</h3>
        {bannedList.length === 0 ? (
          <p>No banned genres or directors.</p>
        ) : (
          <ul>
            {bannedList.map((item) => (
              <li key={item} onClick={() => handleUnban(item)}>
                {item} ✖
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </div>
  );
}

export default App
