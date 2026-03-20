import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("adminToken");

  //  Movie form state
  const [movieData, setMovieData] = useState({
    // when editing  set an id field here
    title: "",
    language: "",
    duration: "",
    genre: "",
    description: "",
    release_date: "",
  });

  const [showData, setShowData] = useState({
    movie_id: "",
    theatre_id: "",
    show_date: "",
    show_time: "",
    regular_price: "",
    vip_price: "",
    language: "",
    format: "2D",
    rows: 6,
    seats_per_row: 10,
  });

  const [seatPreview, setSeatPreview] = useState([]);

  //  Fetch Movies & Theatres on mount
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/movies")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setMovies(data);
      })
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:3000/theatres")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setTheatres(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleMovieChange = (e) =>
    setMovieData({ ...movieData, [e.target.name]: e.target.value });

  const handleShowChange = (e) => {
    const updated = { ...showData, [e.target.name]: e.target.value };
    setShowData(updated);
    generateSeatPreview(updated);
  };

  // Save Movie (Add or Update depending on movieData.id)
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (movieData.id) {
        // Update existing movie
        const res = await axios.put(
          `http://localhost:3000/api/movies/${movieData.id}`,
          {
            title: movieData.title,
            language: movieData.language,
            duration: movieData.duration,
            genre: movieData.genre,
            description: movieData.description,
            release_date: movieData.release_date,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update state (use response if backend returns updated object)
        const updatedMovie = res.data?.movie || res.data?.data || movieData;
        setMovies((prev) => prev.map((m) => (m.id === movieData.id ? updatedMovie : m)));

        setMessage("✅ Movie updated successfully!");
        // reset form
        setMovieData({
          title: "",
          language: "",
          duration: "",
          genre: "",
          description: "",
          release_date: "",
        });
      } else {
        // Add new movie
        const res = await axios.post(
          "http://localhost:3000/api/movies",
          {
            title: movieData.title,
            language: movieData.language,
            duration: movieData.duration,
            genre: movieData.genre,
            description: movieData.description,
            release_date: movieData.release_date,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

      
        const created = res.data?.data || res.data?.movie || null;
        if (created) {
          setMovies((prev) => [created, ...prev]);
        } else {
          
          const all = await axios.get("http://localhost:3000/api/movies");
          const data = Array.isArray(all.data.data) ? all.data.data : [];
          setMovies(data);
        }

        setMessage(" Movie added successfully!");
        setMovieData({
          title: "",
          language: "",
          duration: "",
          genre: "",
          description: "",
          release_date: "",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage(movieData.id ? " Failed to update movie." : "❌ Failed to add movie.");
    }
  };

  // Delete Movie
  const handleDeleteMovie = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    setMessage("");
    try {
      await axios.delete(`http://localhost:3000/api/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setMessage(" Movie deleted successfully!");
      // if the currently edited movie was deleted, reset form
      if (movieData.id === id) {
        setMovieData({
          title: "",
          language: "",
          duration: "",
          genre: "",
          description: "",
          release_date: "",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage(" Failed to delete movie.");
    }
  };

  // Populate form for edit
  const handleEditClick = (movie) => {
    // ensure we copy fields and include id so save uses PUT
    setMovieData({
      id: movie.id,
      title: movie.title || "",
      language: movie.language || "",
      duration: movie.duration || "",
      genre: movie.genre || "",
      description: movie.description || "",
      release_date: movie.release_date || "",
    });

    // scroll up to form (small UX improvement)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setMovieData({
      title: "",
      language: "",
      duration: "",
      genre: "",
      description: "",
      release_date: "",
    });
    setMessage("");
  };

  //Add Theatre
  const handleAddTheatre = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const theatre = {
        name: e.target.name.value,
        location: e.target.location.value,
        address: e.target.address.value,
        screens: parseInt(e.target.screens.value),
        contact_number: e.target.contact_number.value,
        email: e.target.email.value,
        amenities: e.target.amenities.value,
      };
      await axios.post("http://localhost:3000/theatres", theatre, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(" Theatre added successfully!");
      e.target.reset();
      const res = await axios.get("http://localhost:3000/theatres");
      setTheatres(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage(" Failed to add theatre. Check console.");
    }
  };

  //  Seat Preview Generator
  const generateSeatPreview = (data) => {
    const totalRows = parseInt(data.rows) || 0;
    const seatsPerRow = parseInt(data.seats_per_row) || 0;
    const vipRows = Math.floor(totalRows / 2);
    const rows = [];

    for (let r = 0; r < totalRows; r++) {
      const rowLetter = String.fromCharCode(65 + r);
      const seatType = r < vipRows ? "Regular" : "VIP";
      const seatColor = seatType === "VIP" ? "#ffd54f" : "#90caf9";
      const rowSeats = [];
      for (let s = 1; s <= seatsPerRow; s++) {
        rowSeats.push(
          <div
            key={`${rowLetter}${s}`}
            style={{
              width: 26,
              height: 26,
              backgroundColor: seatColor,
              margin: 3,
              borderRadius: 5,
              boxShadow: "0 0 3px rgba(0,0,0,0.2)",
            }}
            title={`${rowLetter}${s} (${seatType})`}
          />
        );
      }
      rows.push(
        <div key={rowLetter} style={{ display: "flex", justifyContent: "center" }}>
          {rowSeats}
        </div>
      );
    }

    const regularRows = rows.slice(0, vipRows);
    const vipRowsList = rows.slice(vipRows);
    setSeatPreview([...regularRows, ...vipRowsList]);
  };

  //  Add Show
  const handleAddShow = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (!showData.movie_id || !showData.theatre_id) {
        setMessage(" Please select both Movie & Theatre");
        return;
      }

      const showRes = await axios.post(
        "http://localhost:3000/shows",
        {
          movie_id: showData.movie_id,
          theatre_id: showData.theatre_id,
          show_date: showData.show_date,
          show_time: showData.show_time,
          price: showData.regular_price,
          language: showData.language,
          format: showData.format,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const showId = showRes.data.id || showRes.data.show?.id;
      const seats = [];
      const vipRows = Math.floor(showData.rows / 2);

      for (let r = 0; r < showData.rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        const seatType = r < vipRows ? "Regular" : "VIP";
        const seatPrice = r < vipRows ? showData.regular_price : showData.vip_price;

        for (let s = 1; s <= showData.seats_per_row; s++) {
          seats.push({
            show_id: showId,
            seat_number: `${rowLetter}${s}`,
            seat_type: seatType,
            price: seatPrice,
          });
        }
      }

      for (const seat of seats) {
        await axios.post("http://localhost:3000/seats", seat, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setMessage(" Show added successfully with VIP & Regular seats!");
      setShowData({
        movie_id: "",
        theatre_id: "",
        show_date: "",
        show_time: "",
        regular_price: "",
        vip_price: "",
        language: "",
        format: "2D",
        rows: 6,
        seats_per_row: 10,
      });
      setSeatPreview([]);
    } catch (err) {
      console.error(err);
      setMessage(" Failed to add show. Check console.");
    }
  };

  const cardStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    marginBottom: 30,
  };

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 6,
    margin: "5px",
    width: "calc(33% - 10px)",
  };

  const buttonStyle = {
    background: "#f84464",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    marginTop: 10,
    cursor: "pointer",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
  };

  const thTd = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
  };

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "auto", background: "#fafafa" }}>
      <h2 style={{ textAlign: "center", color: "#f84464", marginBottom: 30 }}>
        🎬 Admin Dashboard
      </h2>

      {message && (
        <p style={{ textAlign: "center", color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}

      {/* 🎥 Add / Edit Movie */}
      <form onSubmit={handleSaveMovie} style={cardStyle}>
        <h3 style={{ color: "#333" }}>{movieData.id ? "✏️ Edit Movie" : "🎥 Add Movie"}</h3>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <input
            name="title"
            placeholder="Title"
            value={movieData.title}
            onChange={handleMovieChange}
            style={inputStyle}
            required
          />
          <input
            name="language"
            placeholder="Language"
            value={movieData.language}
            onChange={handleMovieChange}
            style={inputStyle}
            required
          />
          <input
            name="duration"
            type="number"
            placeholder="Duration (mins)"
            value={movieData.duration}
            onChange={handleMovieChange}
            style={inputStyle}
            required
          />
          <input
            name="genre"
            placeholder="Genre"
            value={movieData.genre}
            onChange={handleMovieChange}
            style={inputStyle}
            required
          />
          <input
            name="description"
            placeholder="Description"
            value={movieData.description}
            onChange={handleMovieChange}
            style={inputStyle}
          />
          <input
            name="release_date"
            type="date"
            value={movieData.release_date}
            onChange={handleMovieChange}
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button type="submit" style={buttonStyle}>
            {movieData.id ? "Update Movie" : "Add Movie"}
          </button>

          {movieData.id && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                marginLeft: 10,
                background: "#9e9e9e",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* 🎞️ Movie List (With Edit & Delete) */}
      {movies.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ color: "#333" }}>📋 Movie List</h4>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f84464", color: "white" }}>
                <th style={thTd}>Title</th>
                <th style={thTd}>Language</th>
                <th style={thTd}>Genre</th>
                <th style={thTd}>Duration</th>
                <th style={thTd}>Release Date</th>
                <th style={thTd}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m.id}>
                  <td style={thTd}>{m.title}</td>
                  <td style={thTd}>{m.language}</td>
                  <td style={thTd}>{m.genre}</td>
                  <td style={thTd}>{m.duration} mins</td>
                  <td style={thTd}>{m.release_date}</td>
                  <td style={thTd}>
                    <button
                      onClick={() => handleEditClick(m)}
                      style={{
                        background: "#2196F3",
                        border: "none",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: 6,
                        marginRight: 8,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteMovie(m.id)}
                      style={{
                        background: "#e53935",
                        border: "none",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🏛️ Add Theatre */}
      <form onSubmit={handleAddTheatre} style={cardStyle}>
        <h3 style={{ color: "#333" }}>🏛️ Add Theatre</h3>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <input name="name" placeholder="Theatre Name" style={inputStyle} required />
          <input name="location" placeholder="City" style={inputStyle} required />
          <input name="address" placeholder="Address" style={inputStyle} required />
          <input name="screens" type="number" placeholder="Screens" style={inputStyle} required />
          <input name="contact_number" placeholder="Contact Number" style={inputStyle} required />
          <input name="email" type="email" placeholder="Email" style={inputStyle} required />
          <input name="amenities" placeholder="Amenities" style={inputStyle} required />
        </div>
        <button type="submit" style={buttonStyle}>Add Theatre</button>
      </form>

      {/* 🏢 Theatre List */}
      {theatres.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ color: "#333" }}>🏢 Theatre List</h4>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f84464", color: "white" }}>
                <th style={thTd}>Name</th>
                <th style={thTd}>Location</th>
                <th style={thTd}>Screens</th>
                <th style={thTd}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {theatres.map((t) => (
                <tr key={t.id}>
                  <td style={thTd}>{t.name}</td>
                  <td style={thTd}>{t.location}</td>
                  <td style={thTd}>{t.screens}</td>
                  <td style={thTd}>{t.contact_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Show */}
      <form onSubmit={handleAddShow} style={cardStyle}>
        <h3 style={{ color: "#333" }}>🕒 Add Show</h3>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <select name="movie_id" value={showData.movie_id} onChange={handleShowChange} style={inputStyle} required>
            <option value="">Select Movie</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>

          <select name="theatre_id" value={showData.theatre_id} onChange={handleShowChange} style={inputStyle} required>
            <option value="">Select Theatre</option>
            {theatres.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.location})</option>
            ))}
          </select>

          <input type="date" name="show_date" value={showData.show_date} onChange={handleShowChange} style={inputStyle} required />
          <input type="time" name="show_time" value={showData.show_time} onChange={handleShowChange} style={inputStyle} required />
          <input type="number" name="regular_price" placeholder="Regular Price" value={showData.regular_price} onChange={handleShowChange} style={inputStyle} required />
          <input type="number" name="vip_price" placeholder="VIP Price" value={showData.vip_price} onChange={handleShowChange} style={inputStyle} required />
          <input name="language" placeholder="Language" value={showData.language} onChange={handleShowChange} style={inputStyle} />
          <input name="format" placeholder="Format (2D/3D)" value={showData.format} onChange={handleShowChange} style={inputStyle} />
          <input type="number" name="rows" placeholder="Rows" value={showData.rows} onChange={handleShowChange} style={inputStyle} />
          <input type="number" name="seats_per_row" placeholder="Seats per Row" value={showData.seats_per_row} onChange={handleShowChange} style={inputStyle} />
        </div>
        <button type="submit" style={buttonStyle}>Add Show & Generate Seats</button>
      </form>

      {/*  Seat Preview */}
      {seatPreview.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ color: "#444", textAlign: "center" }}>🪑 Seat Layout Preview</h4>
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <span style={{ background: "#90caf9", padding: "5px 10px", borderRadius: 5, marginRight: 10 }}>Regular</span>
            <span style={{ background: "#ffd54f", padding: "5px 10px", borderRadius: 5 }}>VIP</span>
          </div>
          <div>{seatPreview}</div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
