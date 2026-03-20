import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MoviesPage from "./pages/MoviesPage";
import MovieDetail from "./pages/MovieDetail";
import BookingSeats from "./pages/BookingSeats";
import PaymentPage from "./pages/PaymentPage";
import TheatreList from "./pages/TheatreList";
import OfferDetails from "./pages/OfferDetails";
import UpcomingMoviesPage from "./pages/UpcomingMoviesPage";
import WatchlistPage from "./pages/WatchlistPage";
import BookingSuccess from "./pages/BookingSuccess"; // import this
import TicketsPage from "./pages/TicketsPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard"; // Movies admin dashboard

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Route for /movies without city */}
        <Route path="/movies" element={<MoviesPage />} />

        {/* Route for /movies with city */}
        <Route path="/movies/:cityName" element={<MoviesPage />} />

        <Route path="/movies/:cityName/:movieId" element={<MovieDetail />} />
        <Route path="/booking/:cityName/:showId" element={<BookingSeats />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/theatres/:cityName/:movieId" element={<TheatreList />} />
        <Route path="/offers/:offerId" element={<OfferDetails />} />
        <Route path="/upcoming-movies/:cityName" element={<UpcomingMoviesPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/tickets" element={<TicketsPage />} /> {/* Add this */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
