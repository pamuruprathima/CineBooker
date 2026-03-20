import React from "react";

function Ticket({ booking }) {
  if (!booking) return <p>No booking found.</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "20px", border: "2px solid #111", padding: "20px", width: "400px", margin: "20px auto" }}>
      <h2>🎟️ Booking Ticket</h2>
      <p><strong>Movie:</strong> {booking.show.movie.title}</p>
      <p><strong>Date & Time:</strong> {booking.show.show_date} {booking.show.show_time}</p>
      <p><strong>Seats:</strong> {booking.seats.map(s => s.seat_number).join(", ")}</p>
      <p><strong>Total Amount:</strong> ₹{booking.total_amount}</p>
      <p><strong>Status:</strong> {booking.status}</p>
      <p>Thank you for booking! Enjoy your movie 🍿</p>
    </div>
  );
}

export default Ticket;
