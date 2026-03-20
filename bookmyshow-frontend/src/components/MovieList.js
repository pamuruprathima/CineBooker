// src/components/MovieList.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const MovieList = ({ city, onMovieSelect }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    // Fetch movies for the selected city
    axios
      .get(`http://localhost:3000/movies?cityId=${city.id}`)
      .then((res) => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching movies:", err);
        setLoading(false);
      });
  }, [city]);

  if (!city) return <h2 style={{ textAlign: "center" }}>Select a city to see movies</h2>;
  if (loading) return <h2 style={{ textAlign: "center" }}>Loading movies...</h2>;

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "20px",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => onMovieSelect(movie)}
            style={{
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: "10px",
              width: "200px",
              padding: "10px",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
          >
            <img
              src={movie.poster || "https://via.placeholder.com/180x260"}
              alt={movie.title}
              style={{ width: "180px", height: "260px", borderRadius: "10px" }}
            />
            <h3 style={{ marginTop: "10px" }}>{movie.title}</h3>
            <p>{movie.language}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
