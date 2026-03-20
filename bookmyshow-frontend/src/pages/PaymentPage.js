import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CouponsDropdown from "../components/CouponsDropdown";

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const booking = state?.booking;
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  // Card/UPI details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  // conformation popup it will show 
  const [showConfirm, setShowConfirm] = useState(false);

  if (!booking) {
    return <p style={{ textAlign: "center" }}>No booking information found.</p>;
  }

  const totalAmount = parseFloat(booking.totalAmount || 0);
  const finalAmount = (totalAmount - discount).toFixed(2);

  const isCardSelected = paymentMethod === "Credit Card" || paymentMethod === "Debit Card";

  const validateInputs = () => {
    if (!paymentMethod) {
      alert("Select a payment method");
      return false;
    }
    if (isCardSelected) {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        alert("Enter all card details");
        return false;
      }
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length < 12) {
        alert("Enter a valid card number");
        return false;
      }
    }
    if (paymentMethod === "UPI" && !upiId) {
      alert("Enter UPI ID");
      return false;
    }
    return true;
  };

  const handleConfirmClick = () => {
    if (!validateInputs()) return;
    setShowConfirm(true);
  };

  const getMaskedCard = (num) => {
    const digits = (num || "").replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    const last4 = digits.slice(-4);
    return "**** **** **** " + last4;
  };

  const performPayment = async () => {
    try {
      setLoading(true);
      setShowConfirm(false);

      const res = await axios.post("http://localhost:3000/bookings", {
        showId: booking.showId,
        seatIds: booking.seatIds,
        totalAmount: finalAmount,
        paymentMethod,
        cardDetails: isCardSelected ? { cardNumber, cardName, expiry, cvv } : null,
        upiId: paymentMethod === "UPI" ? upiId : null,
      });

      const { booking: bookingRes, payment, seats } = res.data;

      const finalBooking = {
        ...bookingRes,
        bookingTime: new Date().toLocaleString(),
        show: bookingRes.show,
      };

      navigate("/tickets", {
        state: {
          booking: finalBooking,
          payment,
          seats: seats?.length ? seats : booking.seats.map((num) => ({ seat_number: num })),
        },
      });
    } catch (err) {
      console.error("Booking failed:", err);
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "540px",
        margin: "40px auto",
        padding: "22px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 6 }}>Payment for {booking.movieTitle}</h2>
      <p style={{ margin: "4px 0" }}>
        <strong>Theatre:</strong> {booking.theatreName}
        {booking.theatreLocation ? `, ${booking.theatreLocation}` : ""}
        {booking.theatreAddress ? `, ${booking.theatreAddress}` : ""}
      </p>
      <p style={{ margin: "4px 0" }}>
        <strong>Seats:</strong> {booking.seats.join(", ")}
      </p>
      <p style={{ margin: "4px 0 12px" }}>
        <strong>Original Amount:</strong> ₹{totalAmount}
      </p>

      <CouponsDropdown totalAmount={totalAmount} onApplyDiscount={setDiscount} />

      <div style={{ margin: "18px 0" }}>
        <h4 style={{ marginBottom: 8 }}>Select Payment Method</h4>
        {["Credit Card", "Debit Card", "UPI"].map((method) => (
          <div key={method} style={{ margin: "8px 0", display: "flex", alignItems: "center" }}>
            <input
              type="radio"
              id={method}
              name="paymentMethod"
              value={method}
              checked={paymentMethod === method}
              onChange={() => setPaymentMethod(method)}
            />
            <label htmlFor={method} style={{ marginLeft: "10px", fontWeight: 500 }}>
              {method}
            </label>
          </div>
        ))}
      </div>

      {isCardSelected && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Card Number (xxxx xxxx xxxx xxxx)"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: 6, border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Card Holder Name"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: 6, border: "1px solid #ccc" }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              maxLength={5}
              style={{ flex: 1, padding: "10px", borderRadius: 6, border: "1px solid #ccc" }}
            />
            <input
              type="password"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
              style={{ width: "120px", padding: "10px", borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>
        </div>
      )}

      {paymentMethod === "UPI" && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Enter UPI ID (example@upi)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #ccc", marginBottom: 8 }}
          />
          <button
            onClick={() => {
              if (!upiId) return alert("Enter UPI ID");
              const transactionNote = `BookingID-${booking.id}`;
              const upiLink = `upi://pay?pa=${upiId}&pn=MovieTickets&tid=TXN${Date.now()}&tr=${booking.id}&tn=${encodeURIComponent(
                transactionNote
              )}&am=${finalAmount}&cu=INR`;
              window.location.href = upiLink;
            }}
            style={{
              width: "100%",
              padding: "12px 0",
              backgroundColor: "#4caf50",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            Pay via UPI App
          </button>
        </div>
      )}

      <h3 style={{ marginTop: 10 }}>Total Payable: ₹{finalAmount}</h3>

      <button
        onClick={handleConfirmClick}
        disabled={loading}
        style={{
          padding: "12px 20px",
          backgroundColor: "#ff3d00",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "700",
          marginTop: "18px",
          width: "100%",
        }}
      >
        {loading ? "Processing..." : "Confirm Payment"}
      </button>

      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              borderRadius: 10,
              padding: 18,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Confirm Payment</h3>
            <p style={{ margin: "6px 0 12px", color: "#333" }}>
              Are you sure you want to pay <strong>₹{finalAmount}</strong> using <strong>{paymentMethod}</strong>?
            </p>

            <div style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, marginBottom: 12 }}>
              {isCardSelected ? (
                <>
                  <div style={{ fontSize: 14, marginBottom: 6, color: "#555" }}>Card</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{getMaskedCard(cardNumber)}</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{cardName}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 14, marginBottom: 6, color: "#555" }}>UPI</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{upiId}</div>
                </>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={performPayment}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ff3d00",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {loading ? "Processing..." : `Pay ₹${finalAmount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
