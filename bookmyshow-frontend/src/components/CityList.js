import React, { useEffect, useState } from "react";
import axios from "axios";

const CityList = ({ onCitySelect }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAllCities, setShowAllCities] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3000/cities")
      .then((res) => {
        setCities(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cities:", err);
        setLoading(false);
      });
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Coordinates:", latitude, longitude); // ✅ log coords

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const cityName =
            res.data.address.city ||
            res.data.address.town ||
            res.data.address.village ||
            res.data.address.state;

          console.log("Detected city from API:", cityName); // ✅ log API city

          const city = cities.find(
            (c) =>
              c.name.toLowerCase() === cityName.toLowerCase() ||
              cityName.toLowerCase().includes(c.name.toLowerCase()) ||
              (c.name === "Bangalore" && cityName === "Bengaluru")
          );

          if (city) {
            console.log("Mapped city in app list:", city.name); // ✅ log mapped city
            onCitySelect(city.name);
          } else {
            alert(`Your city (${cityName}) is not in the list.`);
          }
        } catch (err) {
          console.error("Error detecting location:", err);
          alert("Failed to detect location.");
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("Please allow location access to detect your city.");
        } else {
          alert("Error getting your location.");
        }
      }
    );
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading cities...</h2>;

  const otherCities = [
    "Agra",
    "Ahmedabad",
    "Ajmer",
    "Amritsar",
    "Bhopal",
    "Bhubaneshwar",
    "Bilaspur",
    "Chandigarh",
    "Coimbatore",
    "Cuttack",
    "Dehradun",
    "Durgapur",
    "Daman",
    "Kanpur",
    "Kochi",
    "Kolkata",
    "Kozhikode",
    "Lucknow",
    "Ludhiana",
    "Mysuru",
    "Madurai",
    "Nashik",
    "Patna",
    "Raipur",
    "Surat",
    "Trivandrum",
    "Vadodara",
    "Vijayawada",
  ];

  const allCities = [
    ...cities.map((c) => ({ name: c.name, icon: c.icon || "🏙️" })),
    ...otherCities.map((name) => ({ name, icon: "🏙️" })),
  ];

  const filteredCities = allCities.filter((c) =>
    c.name.toLowerCase().startsWith(search.toLowerCase())
  );

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "220px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          onClick={detectLocation}
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          📍 Detect My Location
        </button>
      </div>

      {search ? (
        <>
          <h2 style={{ textAlign: "left", marginLeft: "50px" }}>Search Results</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "15px",
            }}
          >
            {filteredCities.length > 0 ? (
              filteredCities.map((city, i) => (
                <div
                  key={i}
                  onClick={() => onCitySelect(city.name)}
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    padding: "20px",
                    borderRadius: "10px",
                    width: "120px",
                    transition: "0.3s",
                  }}
                >
                  <div style={{ fontSize: "40px" }}>{city.icon}</div>
                  <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                    {city.name}
                  </div>
                </div>
              ))
            ) : (
              <p>No cities found</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 style={{ textAlign: "left", marginLeft: "50px" }}>Popular Cities</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "15px",
              marginBottom: "40px",
            }}
          >
            {cities
              .sort((a, b) => a.id - b.id)
              .map((city) => (
                <div
                  key={city.id}
                  onClick={() => onCitySelect(city.name)}
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    padding: "20px",
                    borderRadius: "10px",
                    width: "120px",
                    transition: "0.3s",
                  }}
                >
                  <div style={{ fontSize: "40px" }}>{city.icon || "🏙️"}</div>
                  <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                    {city.name}
                  </div>
                </div>
              ))}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setShowAllCities(!showAllCities)}
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {showAllCities ? "Hide Cities ▲" : "View All Cities ▼"}
            </button>
          </div>

          {showAllCities && (
            <>
              <h2 style={{ textAlign: "left", marginLeft: "50px" }}>Other Cities</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "8px",
                  paddingLeft: "70px",
                  marginTop: "10px",
                }}
              >
                {otherCities.map((name) => (
                  <span
                    key={name}
                    onClick={() => onCitySelect(name)}
                    style={{
                      cursor: "pointer",
                      fontSize: "17px",
                      color: "#333",
                      padding: "4px 0",
                      borderBottom: "1px solid #eee",
                      width: "200px",
                      textAlign: "left",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#007bff")}
                    onMouseLeave={(e) => (e.target.style.color = "#333")}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CityList;
