import axios from "axios";

export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );

    // Extract city name
    const cityName =
      res.data.address.city ||
      res.data.address.town ||
      res.data.address.village ||
      res.data.address.state;

    return cityName || null;
  } catch (err) {
    console.error("Error in reverse geocoding:", err);
    return null;
  }
};
