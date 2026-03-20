import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TheatreList = () => {
  const { movieId, cityName } = useParams();
  const navigate = useNavigate();

  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [allDates, setAllDates] = useState([]);
  const calendarRef = useRef(null);

  const nowTime = new Date();

  // Generate calendar dates for the current month
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return d.toISOString().split("T")[0];
    });

    setAllDates(dates);
  }, []);

  // Fetch theatres and shows for selected date
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3000/api/movies/${movieId}/theatres/${cityName}`)
      .then((res) => {
        const theatreData = res.data.theatres.map((theatre) => {
          const filteredShows = theatre.shows.filter(
            (show) => show.show_date === selectedDate
          );
          return { ...theatre, shows: filteredShows };
        });
        setTheatres(theatreData);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("No theatres found for this movie in this city.");
      })
      .finally(() => setLoading(false));
  }, [movieId, cityName, selectedDate]);

  // Scroll calendar left/right
  const scrollCalendar = (direction) => {
    if (calendarRef.current) {
      const scrollAmount = 60;
      calendarRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading theatres...</h2>;
  if (error) return <h3 style={{ textAlign: "center", color: "red" }}>{error}</h3>;

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <img src="/logo.png" alt="BookMyShow" style={{ width: "180px" }} />
        <button
          onClick={() => navigate(`/movies/${cityName}`)}
          style={{ marginLeft: "auto", padding: "8px 12px", cursor: "pointer" }}
        >
          ← Back to Movies
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "20px" }}>
        Theatres showing this movie in {cityName}
      </h2>

      {/* Calendar Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px",
          gap: "10px",
        }}
      >
        {/* Month/Year Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button onClick={() => scrollCalendar(-1)} style={{ cursor: "pointer" }}>
            ◀
          </button>
          <h3>
            {new Date(selectedDate).toLocaleString("default", { month: "long" })}{" "}
            {new Date(selectedDate).getFullYear()}
          </h3>
          <button onClick={() => scrollCalendar(1)} style={{ cursor: "pointer" }}>
            ▶
          </button>
        </div>

        {/* Horizontal Scrollable Dates */}
        <div
          ref={calendarRef}
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "10px",
            padding: "5px 0",
            maxWidth: "90%",
            scrollbarWidth: "none",
          }}
        >
          {allDates.map((date) => {
            const dayObj = new Date(date);
            const todayStr = new Date().toISOString().split("T")[0];
            const isToday = date === todayStr;
            const isPast = date < todayStr;

            return (
              <div
                key={date}
                onClick={() => !isPast && setSelectedDate(date)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  minWidth: "50px",
                  cursor: isPast ? "not-allowed" : "pointer",
                  background: selectedDate === date ? "#e50914" : "#fff",
                  color: selectedDate === date ? "#fff" : isPast ? "#999" : "#000",
                  border: "1px solid #ccc",
                  opacity: isPast ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  {dayObj.toLocaleString("default", { weekday: "short" })}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: isToday ? "bold" : "normal",
                  }}
                >
                  {dayObj.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theatre Section */}
      {theatres.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No theatres available for this date.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          {theatres.map((theatre) => (
            <div
              key={theatre.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                width: "70%",
                marginBottom: "20px",
                backgroundColor: "#fafafa",
              }}
            >
              <h3>{theatre.name}</h3>
              <p>
                <strong>Location:</strong> {theatre.location}
              </p>

              {theatre.shows.length > 0 ? (
                <>
                  {theatre.shows
                    .filter((show) => {
                      const showDateTime = new Date(
                        `${show.show_date}T${show.show_time}`
                      );
                      const todayStr = new Date().toISOString().split("T")[0];

                      if (selectedDate < todayStr) return false; // hide past dates
                      if (
                        selectedDate === todayStr &&
                        showDateTime < nowTime
                      )
                        return false; // hide already started shows
                      return true; // show only upcoming
                    })
                    .map((show) => (
                      <div
                        key={show.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          background: "#fff",
                          padding: "8px",
                          borderRadius: "6px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        <span>
                          {new Date(show.show_date).toLocaleDateString()} |{" "}
                          {show.show_time} ({show.format}, {show.language})
                        </span>
                        <button
                          onClick={() =>
                            navigate(`/booking/${cityName}/${show.id}`)
                          }
                          style={{
                            padding: "6px 12px",
                            background: "#e50914",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Book Tickets
                        </button>
                      </div>
                    ))}
                </>
              ) : (
                <p>No shows available for this date.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheatreList;
