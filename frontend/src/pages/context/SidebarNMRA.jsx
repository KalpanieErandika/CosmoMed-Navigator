import React, { useState } from 'react';
import { RxDashboard } from 'react-icons/rx';
import { GiMedicines } from 'react-icons/gi';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { IoMdAdd } from "react-icons/io";
import { FiEdit2 } from "react-icons/fi";
import { TbMedicineSyrup } from "react-icons/tb";
import { FaRegHospital } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { IoReader } from "react-icons/io5";
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/logo2.png';
import { PiHospitalBold } from "react-icons/pi";
import { BiUser, BiClipboard, BiUserMinus } from 'react-icons/bi';
import { FaSearch } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import { CiViewList } from "react-icons/ci";

export default function SidebarNMRA() {
  const [openDrugMenu, setOpenDrugMenu] = useState(false);
  const [openEntityMenu, setOpenEntityMenu] = useState(false); 
  const [openPharmaMenu, setOpenPharmaMenu] = useState(false);
  const [openSearchMenu, setOpenSearchMenu] = useState(false);
  
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-60 p-2 flex flex-col min-h-screen shadow-lg" style={{ background: 'linear-gradient(to bottom, #f4be0bff, #023020)' }}>

      <div className="flex flex-col items-center mb-1">
        <img src={logo} alt="CosmoMed Logo" className="w-36 h-30 object-contain mb-1 rounded-full"/>
      </div>

      <Link to="/nmra-home" className={`flex items-center gap-2 px-2 py-2 rounded mb-1 transition-all ${isActive('/nmra-home') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }}>
        <RxDashboard size={22} />
        <span className="text-base font-medium">Dashboard</span>
      </Link>

      <div onClick={() => setOpenDrugMenu(!openDrugMenu)} className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-yellow-300 transition-all text-white mb-0.5">
        <div className="flex items-center gap-2">
          <GiMedicines size={22} />
          <span className="text-base font-medium">Drug Management</span>
        </div>
        {openDrugMenu ? <IoIosArrowDown size={18} /> : <IoIosArrowForward size={18} />}
      </div>

      {openDrugMenu && (
        <div className="ml-6 mb-0.5 flex flex-col gap-0.5">
          <Link to="/nmra-home/nmra-add-drugs" className={`flex items-center gap-1 px-1 py-1 rounded text-sm transition-all ${isActive('/nmra-home/nmra-add-drugs') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`}style={{ textDecoration: 'none' }}>
            <IoMdAdd size={18} />
            <span>Add Drugs</span>
          </Link>

          <Link to="/nmra-home/nmra-edit-drugs" className={`flex items-center gap-2 px-1 py-1 rounded text-sm transition-all ${isActive('/nmra-home/nmra-edit-drugs') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }}>
            <FiEdit2 size={18} />
            <span>Edit Drugs</span>
          </Link>
        </div>
      )}

      <div onClick={() => setOpenEntityMenu(!openEntityMenu)} className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-yellow-300 transition-all text-white mb-0.5">
        <div className="flex items-center gap-2">
          <PiHospitalBold size={22} />
          <span className="text-sm font-medium">Entity Management</span>
        </div>
        {openEntityMenu ? <IoIosArrowDown size={16} /> : <IoIosArrowForward size={16} />}
      </div>

      {openEntityMenu && (
        <div className="ml-6 mb-2 flex flex-col gap-2">
          <Link to="/nmra-home/nmra-add-entities" className={`flex items-center gap-1 px-1 py-1 mb-1 rounded text-base transition-all ${isActive('/nmra-home/nmra-add-entities') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }} >
            <IoMdAdd size={18} />
            <span>Add Entities</span>
          </Link>

          <Link to="/nmra-home/nmra-edit-entities" className={`flex items-center gap-1 px-1 py-1 rounded text-sm transition-all ${isActive('/nmra-home/nmra-edit-entities') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }}>
            <FiEdit2 size={18} />
            <span>Edit Entities</span>
          </Link>
        </div>
      )}


      <div onClick={() => setOpenPharmaMenu(!openPharmaMenu)} className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-yellow-300 transition-all text-white mb-0.5">
        <div className="flex items-center gap-2">
          <BiUser size={22} />
          <span className="text-basic font-medium">Pharmacist Accounts</span>
        </div>
        {openPharmaMenu ? <IoIosArrowDown size={16} /> : <IoIosArrowForward size={16} />}
      </div>

      {openPharmaMenu && (
        <div className="ml-6 mb-0.5 flex flex-col gap-1">
          <Link to="/nmra-home/nmra-account-requests" className={`flex items-center gap-1 px-1 py-1 rounded text-sm transition-all ${isActive('/nmra-home/nmra-account-requests') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }}>
            <BiClipboard size={18} />
            <span>Account Requests</span>
          </Link>
          
          <Link  to="/nmra-home/revoke-pharmacist" className={`flex items-center gap-1 px-1 py-1 rounded text-sm transition-all ${isActive('/nmra-home/revoke-pharmacist') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }} >
            <BiUserMinus size={18} />
            <span>Revoke Accounts</span>
          </Link>
        </div>
      )}

      <div onClick={() => setOpenSearchMenu(!openSearchMenu)} className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-yellow-300 transition-all text-white mb-0.5">
        <div className="flex items-center gap-2">
          <FaSearch size={22} />
          <span className="text-basic font-medium">Search Products & Entities</span>
        </div>
        {openSearchMenu ? <IoIosArrowDown size={16} /> : <IoIosArrowForward size={16} />}
      </div>

      {openSearchMenu && (
        <div className="ml-6 mb-1 flex flex-col gap-1">
          <Link to="/nmra-home/search-products-n" className={`flex items-center gap-1 px-1 py-1 rounded text-sm transition-all ${isActive('/nmra-home/search-products-n') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }}>
            <TbMedicineSyrup size={18} />
            <span>Search Products</span>
          </Link>
          
          <Link to="/nmra-home/search-entities-n" className={`flex items-center gap-1 px-1 py-1 rounded text-sm transition-all ${isActive('/nmra-home/search-entities-n') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }} >
            <FaRegHospital size={18} />
            <span>Search Entities</span>
          </Link>
        </div>
      )}


      <Link to="/nmra-home/pharmacy-locator-n" className={`flex items-center gap-2 px-2 py-2 rounded mb-1 transition-all ${isActive('/pharmacy-locator-n') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }}>
        <MdLocationOn size={22} />
        <span className="text-basic font-medium">Pharmacy Locator</span>
      </Link>

      <Link to="/nmra-home/ocr-upload-n" className={`flex items-center gap-2 px-2 py-2 rounded mb-1 transition-all ${isActive('/prescription-reader') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`}style={{ textDecoration: 'none' }}>
        <IoReader size={22} />
        <span className="text-basic font-medium">Prescription Reader</span>
      </Link>

      <Link to="/nmra-home/report-generation" className={`flex items-center gap-2 px-2 py-2 rounded mb-1 transition-all ${isActive('/report-generation') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }}>
        <IoDocumentTextOutline  size={22} />
        <span className="text-basic font-medium">Report Generation</span>
      </Link>
      
      <Link to="/nmra-home/view-complaint" className={`flex items-center gap-2 px-2 py-2 rounded mb-1 transition-all ${isActive('/report-generation') ? 'bg-yellow-400 text-green-900' : 'hover:bg-yellow-300 text-white'}`} style={{ textDecoration: 'none' }} >
        <CiViewList   size={22} />
        <span className="text-basic font-medium">View Complaints</span>
      </Link>

      <div className="mt-auto pt-2 border-t border-yellow-200 text-xs text-gray-200 text-center">
        © 2025 CosmoMed
      </div>
    </div>
  );
}