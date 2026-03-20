import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link to="/">
        <img
          src="/logo.png"
          alt="BookMyShow"
          style={{ height: "50px", cursor: "pointer" }}
        />
      </Link>
      <h1 style={{ marginLeft: "20px", fontSize: "24px" }}>BookMyShow Clone</h1>
    </header>
  );
};

export default Header;
