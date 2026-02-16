import React from 'react';
import home from '../assets/images/home.jpg';
import { FaSearch } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdDocumentScanner } from 'react-icons/md';
import { Link } from 'react-router-dom';
import Chatbot from '../pages/Chatbot';
import { GiMedicines } from "react-icons/gi";
import AboutUs from './AboutUs';
import Footer from './Footer';

const bgStyle = { backgroundImage: `url(${home})`, backgroundSize: 'cover',  backgroundPosition: 'top', backgroundRepeat: 'no-repeat', width: '100%',};

const Hero = () => {
  return (
    <div>
      <div style={bgStyle}>
        <div className="min-h-[650px] md:min-h-[650px] bg-gradient-to-r from-black/90 to-green-500/60 pt-5 pb-20 md:pt-48">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-12 text-white">
              <div>
                <h1 className="!text-yellow-400 text-5xl lg:text-7xl font-bold text-center px-10 mt-16">
                  Find It Easy, Buy It Safe
                </h1>

                <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-200 mb-8 max-w-3xl mx-auto text-center px-4">
                  CosmoMed Navigator helps you easily find and buy approved medicines, cosmetics, and health products in
                  Sri Lanka.
                  <br />
                  You can search for rare and life-saving drugs, check product approval, locate nearby pharmacies, and get
                  trusted information — all in one place.
                  <br />
                  <i>Stay safe. Buy smart. Navigate with confidence.</i>
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
                  <Link to="/search-products" style={{ textDecoration: 'none' }} className="flex items-center justify-center gap-2 text-base bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded shadow transition w-full">
                    <FaSearch /> <span>Search Products</span>
                  </Link>

                  <Link to="/search-rare-medicines" style={{ textDecoration: 'none' }} className="flex items-center justify-center gap-2 text-base bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded shadow transition w-full">
                    <GiMedicines />
                    <span>Search Rare Drugs</span>
                  </Link>

                  <Link to="/find-pharmacies" style={{ textDecoration: 'none' }} className="flex items-center justify-center gap-2 text-base bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded shadow transition w-full">
                    <FaLocationDot />
                    <span>Find Pharmacies</span>
                  </Link>

                  <Link to="/ocr-upload" style={{ textDecoration: 'none' }} className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-base py-2 px-4 rounded shadow transition w-full">
                    <MdDocumentScanner />
                    <span>Prescription Reader</span>
                  </Link>
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed right-8 bottom-8 z-50">
        <Chatbot />
      </div>
      
      <AboutUs />
      <Footer />
    </div>
  );
};

export default Hero;