import React from "react";

function ShowList({ shows, setSelectedShow }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h3>Available Shows</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {shows.map(show => (
          <li key={show.id} style={{ margin: "10px 0" }}>
            <button onClick={() => setSelectedShow(show)}>
              {show.show_date} {show.show_time} - ₹{show.price}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowList;
