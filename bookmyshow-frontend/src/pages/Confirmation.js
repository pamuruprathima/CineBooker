const Confirmation = ({ show, selectedSeats, appliedOffer, paymentDetails, bookingId }) => {
  return (
    <div>
      <h2>Booking Confirmed!</h2>
      <p>Booking ID: {bookingId}</p>
      <p>Movie: {show.movie.title}</p>
      <p>Theatre: {show.theatre.name}</p>
      <p>Seats: {selectedSeats.map(s => s.seat_number).join(", ")}</p>
      <p>Payment Method: {paymentDetails?.method}</p>
      {appliedOffer && <p>Offer Applied: {appliedOffer.code}</p>}
      <p>Total Paid: ₹{paymentDetails?.paidAmount}</p>
      <button onClick={() => window.location.href = `/movies/${show.city}`}>Back to Movies</button>
    </div>
  );
};

export default Confirmation;
