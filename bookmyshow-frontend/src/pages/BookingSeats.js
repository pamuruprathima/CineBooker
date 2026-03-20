import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SeatCountPopup from "../components/SeatCountPopup"; // ✅ Add import

const BookingSeats = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Added: for seat popup
  const [showPopup, setShowPopup] = useState(true);
  const [seatLimit, setSeatLimit] = useState(0);

  // ✅ When user selects seat count
  const handleSeatCountSelect = (count) => {
    setSeatLimit(count);
    localStorage.setItem("selectedSeatCount", count);
    setShowPopup(false);
  };

  useEffect(() => {
    const fetchShowAndSeats = async () => {
      try {
        const resShow = await axios.get(`http://localhost:3000/shows/${showId}`);
        setShow(resShow.data);

        const resSeats = await axios.get(`http://localhost:3000/seats/show/${showId}`);
        setSeats(resSeats.data.data || []);
      } catch (err) {
        console.error("Error fetching show or seats:", err);
        alert("Failed to load show or seats.");
      } finally {
        setLoading(false);
      }
    };
    fetchShowAndSeats();
  }, [showId]);

  // ✅ Toggle seat selection with seat limit check
  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || seat.status === "booked") return;

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= seatLimit && seatLimit > 0) {
      alert(`You selected ${seatLimit} seats. You cannot select more than that.`);
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const calculateTotalAmount = () => {
    return selectedSeats
      .reduce((sum, seatId) => {
        const seat = seats.find((s) => s.id === seatId);
        return seat ? sum + parseFloat(seat.price) : sum;
      }, 0)
      .toFixed(2);
  };

  const handleBooking = () => {
    if (!show) {
      alert("Show details not loaded yet!");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat!");
      return;
    }

    const selectedSeatObjects = seats.filter((s) => selectedSeats.includes(s.id));
    const totalAmount = calculateTotalAmount();

    navigate("/payment", {
      state: {
        booking: {
          showId: show.id,
          movieTitle: show.movie?.title,
          theatreName: show.theatre?.name,
          theatreAddress: show.theatre?.address,
          showDate: show.show_date,
          showTime: show.show_time,
          seatIds: selectedSeatObjects.map((s) => s.id),
          seats: selectedSeatObjects.map((s) => s.seat_number),
          totalAmount,
        },
      },
    });
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading show and seats...</h2>;
  if (!show) return <p style={{ textAlign: "center" }}>Show not found.</p>;

  const rows = Array.from(new Set(seats.map((s) => s.seat_number.charAt(0))));
  const seatColors = { Regular: "#f5f5f5", VIP: "#ffeb3b", selected: "#4caf50", booked: "#888" };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {/* ✅ Show popup initially */}
      {showPopup && <SeatCountPopup onSelectSeats={handleSeatCountSelect} />}

      <h2>{show.movie?.title} - {show.theatre?.name}</h2>
      <p>
        {new Date(show.show_date).toLocaleDateString()} | {show.show_time}
      </p>

      {/* Screen bar */}
      <div
        style={{
          width: "60%",
          margin: "20px auto",
          height: "20px",
          background: "#ddd",
          borderRadius: "10px",
          fontWeight: "bold",
        }}
      >
        SCREEN
      </div>

      {/* Seats grid */}
      <div style={{ display: "inline-block", textAlign: "center" }}>
        {rows.map((row) => {
          const rowSeats = seats.filter((s) => s.seat_number.startsWith(row));
          const middleIndex = Math.ceil(rowSeats.length / 2);
          return (
            <div key={row} style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <div style={{ width: "20px", textAlign: "right", marginRight: "5px", fontWeight: "bold" }}>
                {row}
              </div>
              {rowSeats.map((seat, index) => {
                const isSelected = selectedSeats.includes(seat.id);
                return (
                  <div
                    key={seat.id}
                    onClick={() => toggleSeat(seat.id)}
                    title={`Seat: ${seat.seat_number} | ₹${seat.price} | ${seat.seat_type}`}
                    style={{
                      width: "38px",
                      height: "35px",
                      margin: index === middleIndex ? "3px 15px" : "3px",
                      borderRadius: "8px",
                      backgroundColor:
                        seat.status === "booked"
                          ? seatColors.booked
                          : isSelected
                          ? seatColors.selected
                          : seatColors[seat.seat_type],
                      border: "1px solid #555",
                      cursor: seat.status === "booked" ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      boxShadow: "0 2px 2px rgba(0,0,0,0.2)",
                      userSelect: "none",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {seat.seat_number.slice(1)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Booking summary */}
      <div style={{ marginTop: "20px" }}>
        <p>
          Selected Seats ({selectedSeats.length}):{" "}
          {seats
            .filter((s) => selectedSeats.includes(s.id))
            .map((s) => s.seat_number)
            .join(", ") || "None"}
        </p>
        <p>Total Amount: ₹{calculateTotalAmount()}</p>
        <button
          onClick={handleBooking}
          style={{
            padding: "10px 25px",
            cursor: "pointer",
            backgroundColor: "#ff3d00",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default BookingSeats;
