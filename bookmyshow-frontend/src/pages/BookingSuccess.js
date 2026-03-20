import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>No booking data found.</h2>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Booking Successful!</h2>
      <p><strong>Booking ID:</strong> {booking.id}</p>
      <p><strong>Movie:</strong> {booking.movieTitle}</p>
      <p><strong>Theatre:</strong> {booking.theatreName}</p>
      <p><strong>Seats:</strong> {booking.seats.join(", ")}</p>
      <button
        onClick={() => navigate("/")}
        style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}
      >
        Go Home
      </button>
    </div>
  );
};

export default BookingSuccess;
