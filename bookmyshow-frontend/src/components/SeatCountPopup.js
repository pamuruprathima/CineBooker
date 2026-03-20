import React, { useState } from "react";

const SeatCountPopup = ({ onSelectSeats }) => {
  const [count, setCount] = useState(2);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "30px 40px",
          textAlign: "center",
          boxShadow: "0 5px 20px rgba(0,0,0,0.25)",
          width: "380px",
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "600",
            marginBottom: "15px",
          }}
        >
          How many seats?
        </h2>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3202/3202926.png"
          alt="scooter"
          width="80"
          style={{ margin: "10px auto" }}
        />

        {/* Seat number buttons */}
        <div style={{ margin: "20px 0" }}>
          {[...Array(10)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCount(i + 1)}
              style={{
                margin: "6px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: count === i + 1 ? "2px solid #e61c5d" : "1px solid gray",
                background: count === i + 1 ? "#ffe6ea" : "#fff",
                color: count === i + 1 ? "#e61c5d" : "#000",
                fontWeight: "bold",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSelectSeats(count)}
          style={{
            background: "#e61c5d",
            color: "#fff",
            border: "none",
            padding: "12px 35px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Select Seats
        </button>
      </div>
    </div>
  );
};

export default SeatCountPopup;
