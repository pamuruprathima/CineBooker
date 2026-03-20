import React, { useState, useEffect } from "react";
import axios from "axios";

const CouponsDropdown = ({ totalAmount, onApplyDiscount }) => {
  const [promotions, setPromotions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null); // currently applied coupon

  useEffect(() => {
    axios
      .get("http://localhost:3000/promotions") 
      .then((res) => setPromotions(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const handleRedeem = async (promo) => {
    if (selectedCoupon?.id === promo.id) {
      // if same coupon clicked again, remove it
      setSelectedCoupon(null);
      onApplyDiscount(0);
      setError("");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/promotions/apply", {
        code: promo.code,
        amount: totalAmount,
      });

      const discount = parseFloat(res.data.discount);
      setSelectedCoupon(promo);
      onApplyDiscount(discount);
      setError("");
      setShowDropdown(false); // close dropdown after redeem
    } catch (err) {
      setSelectedCoupon(null);
      onApplyDiscount(0);
      setError(err.response?.data?.message || "Invalid coupon");
    }
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
        }}
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <span>
          Apply Coupon {selectedCoupon && `- ${selectedCoupon.code}`}
        </span>
        <span>{showDropdown ? "▲" : "▼"}</span>
      </div>

      {error && <p style={{ color: "red", marginTop: "5px" }}>{error}</p>}

      {showDropdown && promotions.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          {promotions.map((promo) => (
            <div
              key={promo.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "5px",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor:
                  selectedCoupon?.id === promo.id ? "#f0f0f0" : "white",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f8f8")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selectedCoupon?.id === promo.id ? "#f0f0f0" : "white")
              }
            >
              <span>{promo.code} - {promo.description}</span>
              <button
                style={{
                  backgroundColor:
                    selectedCoupon?.id === promo.id ? "#777" : "#e50914",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => handleRedeem(promo)}
              >
                {selectedCoupon?.id === promo.id ? "Remove" : "Redeem"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponsDropdown;
