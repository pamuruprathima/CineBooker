import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🎬 BookMyShow</div>
      <ul className="nav-links">
        <li>Home</li>
        <li>Movies</li>
        <li>Bookings</li>
      </ul>
    </nav>
  );
}

export default Navbar;
