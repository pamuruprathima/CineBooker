import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MovieDetail = () => {
  const { movieId, cityName } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [votes, setVotes] = useState(0);
  const [watchlisted, setWatchlisted] = useState(false);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [allReviews, setAllReviews] = useState([]);
  const [showShareOptions, setShowShareOptions] = useState(false); // share button state

  useEffect(() => {
    axios.get(`http://localhost:3000/api/movies/${movieId}`)
      .then(res => setMovie(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    const fetchReviews = async () => {
      try {
        const res = await axios.get("http://localhost:3000/reviews");
        const reviewsArray = Array.isArray(res.data) ? res.data : res.data.data || [];
        const movieReviews = reviewsArray.filter(r => r.movie_id === parseInt(movieId, 10));

        setAllReviews(movieReviews);
//calculate average rating
        if (movieReviews.length > 0) {
          const avg = movieReviews.reduce((sum, r) => sum + r.rating, 0) / movieReviews.length;
          setRating(parseFloat(avg.toFixed(1)));
          setVotes(movieReviews.length);
        } else {
          setRating(null);
          setVotes(0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();

    const storedWatchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    if (storedWatchlist.some(m => m.id === parseInt(movieId))) setWatchlisted(true);
  }, [movieId]);

  const handleToggleWatchlist = () => {
    if (!movie) return;

    const storedWatchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    if (storedWatchlist.some(m => m.id === movie.id)) {
      const updated = storedWatchlist.filter(m => m.id !== movie.id);
      localStorage.setItem("watchlist", JSON.stringify(updated));
      setWatchlisted(false);
      alert("Removed from Watchlist");
    } else {
      storedWatchlist.push({
        id: movie.id,
        title: movie.title,
        language: movie.language,
        city: cityName,
      });
      localStorage.setItem("watchlist", JSON.stringify(storedWatchlist));
      setWatchlisted(true);
      alert("Added to Watchlist");
    }
    window.dispatchEvent(new Event("watchlistUpdated"));
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) return alert("Please select a rating");

    try {
      const res = await axios.post("http://localhost:3000/reviews", {
        user_id: 1,
        movie_id: movie.id,
        rating: newRating,
        comment: newComment
      });

      if ((res.status >= 200 && res.status < 300) &&
          (res.data?.message === "Review created successfully" || res.data?.data)) {
        alert("Review submitted!");
        setNewRating(0);
        setNewComment("");

        const allReviewsRes = await axios.get("http://localhost:3000/reviews");
        const reviewsArray = Array.isArray(allReviewsRes.data) ? allReviewsRes.data : allReviewsRes.data.data || [];
        const movieReviews = reviewsArray.filter(r => r.movie_id === movie.id);

        setAllReviews(movieReviews);

        if (movieReviews.length > 0) {
          const avg = movieReviews.reduce((sum, r) => sum + r.rating, 0) / movieReviews.length;
          setRating(parseFloat(avg.toFixed(1)));
          setVotes(movieReviews.length);
        } else {
          setRating(null);
          setVotes(0);
        }
      } else {
        alert("Failed to submit review. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit review. Check console for details.");
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading movie details...</h2>;
  if (!movie) return <p style={{ textAlign: "center" }}>Movie not found.</p>;

  const posterUrl = `/posters/${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;

  const buttonStyle = {
    padding: "14px 24px",
    backgroundColor: "#e50914",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  };

  const watchlistButtonStyle = {
    ...buttonStyle,
    backgroundColor: watchlisted ? "#555" : "#333"
  };

  const backButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#777",
    width: "100%",
    marginBottom: "20px"
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this movie: ${movie.title}`;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#fff", minHeight: "100vh", backgroundColor: "#0b1e27", padding: "40px" }}>
      <div style={{ display: "flex", gap: "50px", flexWrap: "wrap" }}>
        {/* Left Column */}
        <div style={{ flex: "0 0 400px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button style={backButtonStyle} onClick={() => navigate(`/movies/${cityName}`)}>← Back to Movies</button>
          <img src={posterUrl} alt={movie.title} style={{ width: "100%", borderRadius: "10px" }} />
          {movie.trailer_url && (
            <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer"
               style={{ display: "inline-block", marginTop: "10px", backgroundColor: "#e50914", color: "#fff", padding: "8px 12px", borderRadius: "5px", textDecoration: "none", fontWeight: "bold" }}>
              ▶ Watch Trailer
            </a>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: "1 1 0" }}>
          <h1 style={{ fontSize: "2.2rem", marginBottom: "10px" }}>{movie.title}</h1>

          {rating && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
              <div style={{ display: "flex", gap: "2px", fontSize: "20px", color: "#FFD700" }}>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const starPos = idx + 1;
                  if (rating >= starPos) return <span key={idx}>★</span>;
                  else if (rating + 0.5 >= starPos) return <span key={idx}>⯪</span>;
                  else return <span key={idx}>☆</span>;
                })}
              </div>
              <span style={{ color: "#bbb", fontSize: "14px" }}>{votes} votes</span>
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <p><strong>Language:</strong> {movie.language}</p>
            {movie.format && <p><strong>Format:</strong> {movie.format}</p>}
            <p><strong>Duration:</strong> {movie.duration} min</p>
            <p><strong>Genre:</strong> {movie.genre}</p>
            <p><strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}</p>
          </div>

          <p style={{ marginBottom: "20px" }}>{movie.description}</p>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px" }}>
            <button style={buttonStyle} onClick={() => navigate(`/theatres/${cityName}/${movieId}`)}>🎟️ Book Show</button>
            <button style={watchlistButtonStyle} onClick={handleToggleWatchlist}>
              {watchlisted ? "✔ Added - Click to Remove" : "⭐ Add to Watchlist"}
            </button>
            <div style={{ position: "relative" }}>
              <button
                style={{ ...buttonStyle, backgroundColor: "#555" }}
                onClick={() => setShowShareOptions(!showShareOptions)}
              >
                🔗 Share
              </button>
              {showShareOptions && (
                <div style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  backgroundColor: "#fff",
                  color: "#000",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  zIndex: 100
                }}>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: "bold" }}>WhatsApp</a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1877F2", fontWeight: "bold" }}>Facebook</a>
                  <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ color: "#C13584", fontWeight: "bold" }}>Instagram</a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1DA1F2", fontWeight: "bold" }}>Twitter</a>
                </div>
              )}
            </div>
          </div>

          {/* Actors */}
          {movie.actors?.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h3>Actors</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {movie.actors.map(actor => (
                  <div key={actor.id} style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "10px",
                    width: "120px",
                    textAlign: "center",
                    backgroundColor: "#081c22"
                  }}>
                    <p><strong>{actor.name}</strong></p>
                    <p>{actor.gender}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3>Submit Your Review</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
              {Array.from({ length: 5 }).map((_, idx) => {
                const starValue = idx + 1;
                return (
                  <span key={idx} style={{ fontSize: "25px", color: newRating >= starValue ? "#FFD700" : "#555", cursor: "pointer" }}
                        onClick={() => setNewRating(starValue)}>★</span>
                );
              })}
            </div>
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write your review..."
                      style={{ width: "100%", padding: "8px", borderRadius: "5px", marginBottom: "10px" }} />
            <button onClick={handleSubmitReview} style={{ padding: "10px 20px", backgroundColor: "#e50914", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginBottom: "30px" }}>
              Submit Review
            </button>

            {allReviews.length > 0 && (
              <div>
                <h3>User Reviews ({allReviews.length})</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
                  {allReviews.map((review) => (
                    <div key={review.id} style={{ backgroundColor: "#0b1e27", padding: "12px", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                        <strong>User {review.user_id}</strong>
                        <div style={{ display: "flex", gap: "2px", color: "#FFD700" }}>
                          {Array.from({ length: 5 }).map((_, idx) => (<span key={idx}>{review.rating >= idx + 1 ? "★" : "☆"}</span>))}
                        </div>
                      </div>
                      <p style={{ margin: 0 }}>{review.comment}</p>
                      {review.created_at && <small style={{ color: "#aaa" }}>{new Date(review.created_at).toLocaleDateString()}</small>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
