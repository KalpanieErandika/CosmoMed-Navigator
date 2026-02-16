import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaMapMarkerAlt,FaPhone,FaEnvelope, FaHeart} from 'react-icons/fa';
import { GiHealthNormal } from 'react-icons/gi';
import logo from '../assets/images/logo2.png';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          

          <div>
            <p className="text-gray-300 mb-4">
              Your trusted platform for verified medicines and health products in Sri Lanka.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors no-underline">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors no-underline">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors no-underline">
                <FaInstagram className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-6 text-yellow-400">Quick Links</h4>
            <ul className="space-y-1">
              <li>
                   <Link to="/user-home" style={{ color: '#ADADAD', textDecoration: 'none'}}className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                 <Link to="/search-products" style={{ color: '#ADADAD', textDecoration: 'none'}}className="hover:text-white transition-colors">
                  Search Products
                </Link>
              </li>
              <li>
         
              </li>
              <li>
                <Link to="/search-rare-medicines" style={{ color: '#ADADAD', textDecoration: 'none'}}className="hover:text-white transition-colors">
                  Rare Medicines Search
                </Link>
              </li>
              <li>
                <Link to="/ocr-upload" style={{ color: '#ADADAD', textDecoration: 'none'}}className="hover:text-white transition-colors">
Prescription Reader
</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-6 text-yellow-400">Important Links</h4>
            <ul className="space-y-1">
              <li>
<Link to="/about-us" style={{ color: '#ADADAD', textDecoration: 'none'}}className="hover:text-white transition-colors">
  About Us
</Link>
              </li>
              <li>
<Link to="/about-us" style={{ color: '#ADADAD', textDecoration: 'none'}}className="hover:text-white transition-colors">
Contact Us
</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-yellow-400">Contact Us</h4>
            <ul className="space-y-1">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-green-400 mt-1" />
                <span className="text-gray-300">
                  123 Health Street, Colombo 05, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-green-400" />
                <span className="text-gray-300">+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-green-400" />
                <span className="text-gray-300">info@cosmomed.lk</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-700 pt-8 mt-1">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left mb-2 md:mb-0">
              © {new Date().getFullYear()} CosmoMed Navigator. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;