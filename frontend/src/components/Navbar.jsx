import React, { useState, useContext } from 'react';
import logo from '../assets/images/logo.png';
import { AuthContext } from '../pages/context/Auth1';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IoMdArrowDropdown } from "react-icons/io";


const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleMouseEnter = (e) => (e.target.style.color = '#C9A000');
  const handleMouseLeave = (e) => (e.target.style.color = 'black');

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  
  return (
    
    <div className="bg-white py-2.5 shadow-2xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <a href="/user-home" style={{ textDecoration: 'none' }}>
            <img src={logo} alt="Logo" style={{ maxWidth: '120px', height: 'auto' }} /></a>
        </div>

 <div className="flex-grow flex justify-center">
          <nav>
            <ul className="flex gap-7 items-center text-lg font-semibold relative">
              <li className="relative">
              <button onClick={toggleDropdown} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
  className="flex items-center gap-1 focus:outline-none text-black">
  Search <IoMdArrowDropdown /> </button>

                {dropdownOpen && (
                  <ul className="absolute bg-white shadow-md mt-2 p-2 w-48 border rounded-md z-10">
                    <li>
                      <a href="/search-products" className="block px-4 py-2 hover:bg-yellow-500"style={{ color: 'black', textDecoration: 'none' }}>
                        Products </a> </li>
                    <li>
                      <a href="/search-entities" className="block px-4 py-2 hover:bg-yellow-500" style={{ color: 'black', textDecoration: 'none' }} >
                        Entities </a>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <a href="/make-complaint" style={{ color: 'black', textDecoration: 'none' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Submit Complaint </a>
              </li>

              <li>
                <a href="/my-orders" style={{ color: 'black', textDecoration: 'none' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Order History </a>
              </li>

              <li>
                <a href="/ocr-upload" style={{ color: 'black', textDecoration: 'none' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} >
                  Prescription Scanner </a> </li>

              <li>
                <a href="/search-rare-medicines" style={{ color: 'black', textDecoration: 'none' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Purchase Medicines</a></li>

           
            </ul>
          </nav>
        </div>

        <div>
          <button onClick={handleLogout} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-4 rounded transition duration-300" >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
