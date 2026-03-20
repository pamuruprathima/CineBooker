import React from "react";

function BookingConfirmation({ show, selectedSeats, onConfirm }) {
  const totalAmount = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Confirm Your Booking</h2>
      <p>
        Movie: <strong>{show.movie.title}</strong>
      </p>
      <p>
        Date & Time: <strong>{show.show_date} {show.show_time}</strong>
      </p>
      <p>
        Selected Seats: <strong>{selectedSeats.map(s => s.seat_number).join(", ")}</strong>
      </p>
      <p>
        Total Amount: <strong>₹{totalAmount}</strong>
      </p>
      <button
        onClick={onConfirm}
        style={{ padding: "10px 20px", marginTop: "15px" }}
      >
        Confirm Booking
      </button>
    </div>
  );
}

export default BookingConfirmation;
