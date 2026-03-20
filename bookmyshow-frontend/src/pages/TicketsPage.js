import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TicketsPage = () => {
  const { state } = useLocation();
  const { booking, payment, seats } = state || {};
  const ticketRef = useRef();
  //return if data not there

  if (!booking || !payment || !seats) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>No ticket information available.</p>;
  }
  
  const show = booking.show || {};
  const theatre = show.theatre || {};
  const movie = show.movie || {};
  const seatNumbers = seats.map((s) => s.seat_number).join(", ");
  const bookingTime = booking.created_at
    ? new Date(booking.created_at).toLocaleString()
    : booking.bookingTime || "N/A";

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`Ticket-${booking.id}.pdf`);
  };

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "50px auto",
        padding: "25px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        ref={ticketRef}
        style={{
          border: "2px solid #eee",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          padding: "25px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#ff3d00" }}>🎟️ Your Ticket</h2>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <p><strong>Booking ID:</strong> {booking.id}</p>
            <p><strong>Movie:</strong> {movie.title || "N/A"}</p>
            <p>
              <strong>Theatre:</strong> {theatre.name || "N/A"}, {theatre.location || "N/A"}, {theatre.address || "N/A"}
            </p>
            <p>
              <strong>Show Date/Time:</strong>{" "}
              {show.show_date ? new Date(show.show_date).toLocaleDateString() : "N/A"} | {show.show_time || "N/A"}
            </p>
            <p><strong>Seats:</strong> {seatNumbers}</p>
            <p><strong>Total Paid:</strong> ₹{Number(payment.amount || 0).toFixed(2)}</p>
            <p><strong>Payment Method:</strong> {payment.payment_method || "N/A"}</p>
            <p><strong>Payment Status:</strong> {payment.payment_status || "N/A"}</p>
            <p><strong>Booking Time:</strong> {bookingTime}</p>
          </div>

          <div style={{ textAlign: "center", marginTop: "20px", minWidth: "140px" }}>
            <QRCodeSVG
              value={`Booking ID: ${booking.id}\nMovie: ${movie.title}\nTheatre: ${theatre.name}\nSeats: ${seatNumbers}\nAmount: ₹${payment.amount}`}
              size={150}
            />
            <p style={{ marginTop: "10px", fontSize: "12px", color: "#555" }}>Scan at Theatre</p>
          </div>
        </div>
      </div>

      <button
        onClick={handlePrint}
        style={{
          padding: "12px 30px",
          backgroundColor: "#ff3d00",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          width: "48%",
          marginTop: "25px",
          marginRight: "4%",
        }}
      >
        Print Ticket
      </button>

      <button
        onClick={handleDownloadPDF}
        style={{
          padding: "12px 30px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          width: "48%",
          marginTop: "25px",
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default TicketsPage;
