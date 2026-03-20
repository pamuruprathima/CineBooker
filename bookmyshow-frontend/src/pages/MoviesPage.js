import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SignIn from "../components/SignIn";

const MoviesPage = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sliderRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "Movies";

  // States
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [offers, setOffers] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  // toggle state for filters
  const [showLanguages, setShowLanguages] = useState(true);
  const [showGenres, setShowGenres] = useState(true);

  // Watchlist count
  const [watchlistCount, setWatchlistCount] = useState(
    JSON.parse(localStorage.getItem("watchlist"))?.length || 0
  );

  const updateWatchlistCount = () => {
    const stored = JSON.parse(localStorage.getItem("watchlist")) || [];
    setWatchlistCount(stored.length);
  };

  useEffect(() => {
    window.addEventListener("watchlistUpdated", updateWatchlistCount);
    return () => window.removeEventListener("watchlistUpdated", updateWatchlistCount);
  }, []);

  // Listen for new movies added by admin
  useEffect(() => {
  const handleNewMovie = (e) => {
    const newMovie = e.detail;
    if (newMovie.city === cityName) {
      setMovies((prev) => [newMovie, ...prev]);
    }
  };
  window.addEventListener("moviesUpdated", handleNewMovie);
  return () => window.removeEventListener("moviesUpdated", handleNewMovie);
}, [cityName]);

  // Fetch movies
  const fetchMovies = () => {
    setLoading(true);
    axios
      .get(`http://localhost:3000/api/movies/by-city?city=${cityName}`)
      .then((res) => setMovies(res.data.movies || []))
      .catch((err) => console.error("Error fetching movies:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeTab === "Movies") fetchMovies();
  }, [cityName, activeTab]);

  // Fetch offers
  useEffect(() => {
    if (activeTab === "Offers") {
      axios
        .get("http://localhost:3000/promotions")
        .then((res) => setOffers(res.data.data || []))
        .catch((err) => console.error("Error fetching offers:", err));
    }
  }, [activeTab]);
//side filters
  const filteredMovies = movies.filter((m) => {
    let matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    let matchLang = selectedLanguages.length ? selectedLanguages.includes(m.language) : true;
    let matchGenre = selectedGenres.length ? selectedGenres.includes(m.genre) : true;
    return matchSearch && matchLang && matchGenre;
  });

  const languages = [...new Set(movies.map((m) => m.language))];
  const genres = [...new Set(movies.map((m) => m.genre))];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setShowProfileDropdown(false);
      window.location.reload();
    }
  };

  // Slider functions
  const scrollLeft = () => sliderRef.current.scrollBy({ left: -250, behavior: "smooth" });
  const scrollRight = () => sliderRef.current.scrollBy({ left: 250, behavior: "smooth" });

  if (loading && activeTab === "Movies")
    return <h2 style={{ textAlign: "center" }}>Loading movies...</h2>;

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 40px",
          backgroundColor: "white",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img
            src="/logo.png"
            alt="BookMyShow"
            style={{ height: "45px", cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
          <input
            type="text"
            placeholder="Search for Movies"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 15px",
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "20px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ fontWeight: 600 }}>📍 {cityName}</div>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
              <div
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  background: "#f84464",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                {user.name[0].toUpperCase()}
              </div>

              {/* Watchlist icon */}
              <div
                onClick={() => navigate("/watchlist")}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  background: "#555",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  position: "relative",
                }}
                title="Your Watchlist"
              >
                ⭐
                {watchlistCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "#f84464",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  >
                    {watchlistCount}
                  </span>
                )}
              </div>

              {showProfileDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "45px",
                    right: 0,
                    background: "white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                    width: "150px",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: "10px", cursor: "pointer" }}>{user.name}</div>
                  <div
                    onClick={handleLogout}
                    style={{ padding: "10px", cursor: "pointer", color: "#f84464" }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                style={{
                  background: "#f84464",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setShowSignInModal(true)}
              >
                Sign In
              </button>
              <button
                style={{
                  background: "#444",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginLeft: "10px",
                }}
                onClick={() => navigate("/admin/login")}
              >
                Admin Login
              </button>
            </>
          )}
        </div>
      </header>

      {/* NAVIGATION */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          background: "#fff",
          padding: "10px 0",
          fontWeight: "500",
          borderBottom: "1px solid #eee",
        }}
      >
        {["Movies", "Streams", "Events", "Offers", "Sports", "Activities"].map((tab) => (
          <span
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              cursor: "pointer",
              color: activeTab === tab ? "#f84464" : "#555",
              borderBottom: activeTab === tab ? "2px solid #f84464" : "none",
              paddingBottom: "5px",
            }}
          >
            {tab}
          </span>
        ))}
      </nav>

      {/* MOVIES SECTION */}
      {activeTab === "Movies" && (
        <div style={{ display: "flex", padding: "30px 50px", gap: "30px" }}>
          {/* FILTER BOX */}
          <div
            style={{
              minWidth: "220px",
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            {/* Languages */}
            <div>
              <div
                onClick={() => setShowLanguages(!showLanguages)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                <span>Languages</span>
                <span>{showLanguages ? "▲" : "▼"}</span>
              </div>
              {showLanguages &&
                languages.map((lang) => (
                  <div key={lang}>
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(lang)}
                      onChange={() => {
                        if (selectedLanguages.includes(lang)) {
                          setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
                        } else {
                          setSelectedLanguages([...selectedLanguages, lang]);
                        }
                      }}
                    />{" "}
                    {lang}
                  </div>
                ))}
            </div>

            <hr style={{ margin: "15px 0" }} />

            {/* Genres */}
            <div>
              <div
                onClick={() => setShowGenres(!showGenres)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                <span>Genres</span>
                <span>{showGenres ? "▲" : "▼"}</span>
              </div>
              {showGenres &&
                genres.map((g) => (
                  <div key={g}>
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(g)}
                      onChange={() => {
                        if (selectedGenres.includes(g)) {
                          setSelectedGenres(selectedGenres.filter((gen) => gen !== g));
                        } else {
                          setSelectedGenres([...selectedGenres, g]);
                        }
                      }}
                    />{" "}
                    {g}
                  </div>
                ))}
            </div>

            <button
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "10px 0",
                background: "#f84464",
                color: "white",
                border: "none",
                borderRadius: "20px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={fetchMovies}
            >
              Search
            </button>
          </div>

          {/* MOVIES GRID */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                marginBottom: "30px",
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
                  Upcoming Movies
                </h2>
              </div>

              {/* Slider with arrows */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={scrollLeft} style={{ fontSize: "24px", cursor: "pointer" }}>
                  ◀
                </button>
                <div
                  ref={sliderRef}
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "18px",
                    paddingBottom: "10px",
                    scrollBehavior: "smooth",
                  }}
                >
                  {movies
                    .filter((m) => new Date(m.release_date) > new Date())
                    .map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => navigate(`/movies/${cityName}/${movie.id}`)}
                        style={{
                          minWidth: "160px",
                          cursor: "pointer",
                          background: "#f8f9fa",
                          borderRadius: "12px",
                          overflow: "hidden",
                          textAlign: "center",
                          flexShrink: 0,
                          transition: "transform 0.2s ease-in",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <img
                          src={`http://localhost:3000/images/movies/${movie.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")}.jpg`}
                          alt={movie.title}
                          style={{ width: "100%", height: "220px", objectFit: "cover" }}
                        />
                        <h4
                          style={{
                            margin: "10px 0 4px",
                            fontSize: "14px",
                            color: "#333",
                          }}
                        >
                          {movie.title}
                        </h4>
                        <p style={{ fontSize: "12px", color: "#777" }}>
                          {new Date(movie.release_date).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                </div>
                <button onClick={scrollRight} style={{ fontSize: "24px", cursor: "pointer" }}>
                  ▶
                </button>
              </div>
            </div>

            {/* MOVIE GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "25px",
              }}
            >
              {filteredMovies.length === 0 ? (
                <p style={{ textAlign: "center", gridColumn: "1/-1" }}>No movies found.</p>
              ) : (
                filteredMovies.map((movie) => (
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
                      src={`http://localhost:3000/images/movies/${movie.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}.jpg`}
                      alt={movie.title}
                      style={{ width: "100%", height: "280px", objectFit: "cover" }}
                    />
                    <h3 style={{ margin: "10px 0 5px" }}>{movie.title}</h3>
                    <p style={{ color: "#777", marginBottom: "10px" }}>{movie.language}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* OFFERS TAB */}
      {activeTab === "Offers" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
            padding: "40px 60px",
          }}
        >
          {offers.length === 0 ? (
            <p style={{ textAlign: "center", gridColumn: "1/-1" }}>No offers found.</p>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  padding: "25px",
                  textAlign: "center",
                  transition: "transform 0.2s ease-in",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onClick={() => navigate(`/offers/${offer.id}`)}
              >
                <h3 style={{ color: "#f84464", marginBottom: "10px" }}>
                  {offer.description || "Special Offer"}
                </h3>
                <p style={{ fontWeight: "bold", fontSize: "18px" }}>{offer.code}</p>
                <p style={{ color: "#555" }}>Discount: {offer.discount_percent}%</p>
                <p style={{ color: "#888", fontSize: "14px" }}>
                  Valid: {offer.valid_from?.slice(0, 10)} - {offer.valid_to?.slice(0, 10)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* SIGN-IN MODAL */}
      {showSignInModal && (
        <SignIn
          onLogin={(userData, token) => {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", token);
            setShowSignInModal(false);
          }}
          onClose={() => setShowSignInModal(false)}
        />
      )}
    </div>
  );
};

export default MoviesPage;
