import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6 md:px-16 lg:px-24 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold mb-4">CinemaTickets</h3>
          <p className="text-gray-400 text-sm">
            Your ultimate destination for movie ticket bookings. 
            Enjoy seamless booking experiences and catch the latest films.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-red-500 transition">Home</Link></li>
            <li><Link to="/bookings" className="hover:text-red-500 transition">My Bookings</Link></li>
            <li><Link to="/movies" className="hover:text-red-500 transition">Movies</Link></li>
            <li><Link to="/contact" className="hover:text-red-500 transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2">
            <li><Link to="/faq" className="hover:text-red-500 transition">FAQ</Link></li>
            <li><Link to="/terms" className="hover:text-red-500 transition">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-red-500 transition">Privacy Policy</Link></li>
            <li><Link to="/help" className="hover:text-red-500 transition">Help Center</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-semibold mb-4">Connect With Us</h4>
          <div className="flex space-x-4">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl hover:text-red-500 transition"
            >
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl hover:text-red-500 transition"
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl hover:text-red-500 transition"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-500 mt-8 pt-4 border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} CinemaTickets. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;