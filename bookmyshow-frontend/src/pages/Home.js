import React from "react";
import { useNavigate } from "react-router-dom";
import CityList from "../components/CityList";

const Home = () => {
  const navigate = useNavigate();

  const handleCitySelect = (cityName) => {
    navigate(`/movies/${cityName}`); // send cityName as string
  };

  return (
    <div>
      <img
        src="/logo.png"
        alt="BookMyShow"
        style={{ width: "200px", display: "block", margin: "20px auto" }}
      />
      <CityList onCitySelect={handleCitySelect} />
    </div>
  );
};

export default Home;
