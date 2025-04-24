import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast, ToastContainer } from "react-toastify";
import {
  faSignOutAlt,
  faUserPlus,
  faHome,
  faTicket,
  faQuestionCircle,
  faUserCog,
  faShoppingBag,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Logo from '../assets/logo-dark-navbar.png';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Load user data including avatar when component mounts
  useEffect(() => {
    const avatar = localStorage.getItem('userAvatar');
    const email = localStorage.getItem('rememberedEmail');
    const name = user?.firstName || (email ? email.split('@')[0] : "User");
    
    setUserAvatar(avatar || '');
    setUserName(name);
    setUserEmail(email || '');
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
        const avatar = localStorage.getItem('userAvatar');
        setUserAvatar(avatar || '');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
}, []);
  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("rememberedEmail");

      if (setUser) setUser(null);

      toast.success("Logged out successfully");
      navigate("/login");
      setIsSideNavOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { name: "Home", icon: faHome, action: () => navigate("/") },
    { name: "Movies", icon: faTicket, action: () => navigate("/movies") },
    { name: "Your Bookings", icon: faShoppingBag, action: () => navigate("/bookings") },
  ];

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return userEmail ? userEmail.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900 to-blue-900 shadow-lg">
        <ToastContainer autoClose={3000} position="top-right" />
        
        <div className="container mx-auto px-6 md:px-16 lg:px-24 py-4 flex justify-between items-center">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-8">
            <img
              src={Logo}
              alt="CinemaTickets Logo"
              className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            />

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="text-white hover:text-red-400 transition-colors flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span className="text-sm">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                Sign In
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-white hidden md:block">
                  Welcome, {userName}
                </span>
                {userAvatar ? (
                  <div 
                    className="h-10 w-10 rounded-full overflow-hidden cursor-pointer hover:opacity-80"
                    onClick={() => setIsSideNavOpen(!isSideNavOpen)}
                  >
                    <img 
                      src={userAvatar} 
                      alt="User Avatar" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSideNavOpen(!isSideNavOpen)}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <FontAwesomeIcon icon={faBars} className="text-xl" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Side Navigation with Transparent Backdrop */}
      <div 
        className={`
          fixed inset-y-0 right-0 w-72 z-50 
          transform transition-transform duration-300 ease-in-out
          ${isSideNavOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Translucent Backdrop */}
        <div 
          className="absolute inset-0 backdrop-blur-sm bg-white/10"
          onClick={() => setIsSideNavOpen(false)}
        />

        {/* Actual Side Nav Content */}
        <div 
          className="
            relative z-60 h-full 
            bg-gradient-to-br from-gray-900/90 to-blue-900/90 
            backdrop-blur-xl 
            shadow-2xl
          "
        >
          {/* Side Nav Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Menu</h2>
            <button
              onClick={() => setIsSideNavOpen(false)}
              className="text-white hover:text-red-400 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-center space-x-4">
                {userAvatar ? (
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <img 
                      src={userAvatar} 
                      alt="User Avatar" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-red-600 text-white rounded-full h-12 w-12 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold">
                    {userName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {userEmail || "No Email"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="p-6 space-y-2">
            {[
              ...navItems,
              { name: "Help & Support", icon: faQuestionCircle, action: () => navigate("/support") },
              { name: "Account Settings", icon: faUserCog, action: () => navigate("/settings") }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  item.action();
                  setIsSideNavOpen(false);
                }}
                className="
                  w-full text-left px-4 py-3 rounded-lg 
                  text-white hover:bg-blue-800 
                  flex items-center space-x-4 
                  transition-colors
                "
              >
                <FontAwesomeIcon icon={item.icon} className="text-red-400" />
                <span>{item.name}</span>
              </button>
            ))}

            {/* Logout */}
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="
                    w-full text-left px-4 py-3 rounded-lg 
                    text-red-400 hover:bg-red-900/20 
                    flex items-center space-x-4 
                    transition-colors
                  "
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;