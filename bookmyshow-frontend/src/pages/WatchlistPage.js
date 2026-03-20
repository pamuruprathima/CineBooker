import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Watchlist = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);

  // Fetch movies from localStorage
  const fetchWatchlist = () => {
    const stored = JSON.parse(localStorage.getItem("watchlist")) || [];
    setWatchlist(stored);
  };

  useEffect(() => {
    fetchWatchlist();

    // Listen for updates from MovieDetail
    const handleUpdate = () => fetchWatchlist();
    window.addEventListener("watchlistUpdated", handleUpdate);
    return () => window.removeEventListener("watchlistUpdated", handleUpdate);
  }, []);

  if (watchlist.length === 0)
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>No movies in your watchlist.</h2>;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "30px" }}>Your Watchlist</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "25px",
        }}
      >
        {watchlist.map((movie) => {
          const titleSafe = movie?.title || "untitled";
          const citySafe = movie?.city || "unknown";
          const languageSafe = movie?.language || "";

          return (
            <div
              key={movie?.id || Math.random()}
              onClick={() => navigate(`/movies/${citySafe}/${movie?.id}`)}
              style={{
                cursor: "pointer",
                background: "#fff",
                color: "#000",
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
                src={`/posters/${titleSafe.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`}
                alt={titleSafe}
                style={{ width: "100%", height: "280px", objectFit: "cover" }}
              />
              <h3 style={{ margin: "10px 0 5px" }}>{titleSafe}</h3>
              <p style={{ color: "#777", marginBottom: "10px" }}>{languageSafe}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Watchlist;
