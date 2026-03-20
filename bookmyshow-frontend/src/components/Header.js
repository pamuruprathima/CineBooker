import React from "react";

const Header = () => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#111",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <img
        src="/logo.png" // your logo file in public folder
        alt="BookMyShow"
        style={{ height: "40px", marginRight: "15px" }}
      />
      <h1 style={{ fontSize: "20px" }}>BookMyShow Clone</h1>
    </header>
  );
};

export default Header;
