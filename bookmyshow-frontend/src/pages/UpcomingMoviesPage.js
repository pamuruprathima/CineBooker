import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UpcomingMoviesPage = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/movies/by-city?city=${cityName}`)
      .then((res) => {
        const upcoming = (res.data.movies || []).filter(
          (m) => new Date(m.release_date) > new Date()
        );
        setMovies(upcoming);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [cityName]);

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading upcoming movies...</h2>;

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", padding: "30px 50px", minHeight: "100vh", background: "#f8f9fa" }}>
      <button
        style={{ marginBottom: "20px", background: "transparent", border: "none", color: "#007bff", cursor: "pointer", fontSize: "16px" }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Upcoming Movies in {cityName}</h2>

      {movies.length === 0 ? (
        <p>No upcoming movies available.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "25px" }}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => navigate(`/movies/${cityName}/${movie.id}`)}
              style={{
                cursor: "pointer",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                overflow: "hidden",
                textAlign: "center",
                transition: "transform 0.2s ease-in",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={`/posters/${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`}
                alt={movie.title}
                style={{ width: "100%", height: "280px", objectFit: "cover" }}
              />
              <h3 style={{ margin: "10px 0 5px" }}>{movie.title}</h3>
              <p style={{ color: "#777", marginBottom: "10px" }}>{movie.language}</p>
              <p style={{ color: "#555", fontSize: "14px" }}>
                Release: {new Date(movie.release_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingMoviesPage;
