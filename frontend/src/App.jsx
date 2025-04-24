import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./component/Navbar";
import Home from "./component/pages/Home";
import Login from "./component/pages/Login";
import Register from "./component/pages/Register";
import BookingList from "./component/pages/BookingList";
// import Orders from "./component/pages/Orders";
import SupportPage from "./component/pages/Support";
import SettingsPage from "./component/pages/Settings";
import BookingPage from "./component/pages/BookingForm";
import "./App.css";
import Footer from "./component/Footer";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage on component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <ThemeProvider>
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/bookings" element={<BookingList user={user} />} />
        <Route path="/booking/:showId" element={<BookingPage />} />
        {/* <Route path="/orders" element={<Orders user={user} />} /> */}
        <Route path="/support" element={<SupportPage user={user} />} />
        <Route path="/settings" element={<SettingsPage user={user} setUser={setUser} />} /> 
      </Routes>
      <Footer />
    </Router>
    </ThemeProvider>
  );
}

export default App;