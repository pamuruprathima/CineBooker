import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SignIn from "../components/SignIn";

const OfferDetails = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [redeemed, setRedeemed] = useState(false);

  // Fetch offer details
  useEffect(() => {
    axios
      .get(`http://localhost:3000/promotions/${offerId}`)
      .then((res) => {
        setOffer(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching offer:", err);
        setError("Offer not found");
        setLoading(false);
      });
  }, [offerId]);

  const handleRedeem = () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    setRedeemed(true);
    alert(`Offer "${offer.code}" redeemed successfully!`);
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading offer...</h2>;
  if (error) return <h2 style={{ textAlign: "center", color: "red" }}>{error}</h2>;

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", background: "#f8f9fa", minHeight: "100vh", padding: "40px" }}>
      {/* BACK TO OFFERS */}
      <button style={{ background: "transparent", border: "none", color: "#007bff", cursor: "pointer", fontSize: "16px", marginBottom: "20px" }}
        onClick={() => navigate(`/movies/${offer.cityName || "Mumbai"}?tab=Offers`)}>
        ← Back to Offers
      </button>

      <div style={{ maxWidth: "600px", margin: "0 auto", background: "white", borderRadius: "12px", padding: "30px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <h1 style={{ color: "#f84464", marginBottom: "15px" }}>{offer.description || "Special Offer"}</h1>
        <p style={{ fontWeight: "bold", fontSize: "20px", marginBottom: "10px" }}>Code: {offer.code}</p>
        <p style={{ color: "#555", marginBottom: "10px" }}>Discount: {offer.discount_percent}%</p>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px" }}>Valid: {offer.valid_from?.slice(0, 10)} - {offer.valid_to?.slice(0, 10)}</p>

        <button onClick={handleRedeem} disabled={redeemed}
          style={{ padding: "10px 20px", background: redeemed ? "#aaa" : "#f84464", color: "white", border: "none", borderRadius: "20px", cursor: redeemed ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px" }}>
          {redeemed ? "Redeemed ✅" : "Redeem Offer"}
        </button>
      </div>

      {showSignIn && <SignIn onLogin={(userData, token) => { setUser(userData); localStorage.setItem("user", JSON.stringify(userData)); localStorage.setItem("token", token); setShowSignIn(false); }} onClose={() => setShowSignIn(false)} />}
    </div>
  );
};

export default OfferDetails;
