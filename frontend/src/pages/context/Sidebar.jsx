import React, { useState } from 'react';
import { RxDashboard } from 'react-icons/rx';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { GiMedicines } from 'react-icons/gi';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { IoMdAdd } from "react-icons/io";
import { FiEdit2 } from "react-icons/fi";
import { TbMedicineSyrup } from "react-icons/tb";
import { FaRegHospital } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { IoReader } from "react-icons/io5";
import logo from '../../assets/images/logo2.png';
import { RiAccountCircle2Fill } from "react-icons/ri";
import { toast } from 'react-toastify';

export default function Sidebar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const pharmacistStatus = user?.pharmacist_status;

    const [openDrugMenu, setOpenDrugMenu] = useState(false);

    //Handles restricted feature access
    const handleAccess = (feature, targetPath) => {
        if (!pharmacistStatus) {
            toast.info('You need to create an account first.');
            navigate('/pharmacist-account');
            return false;
        } else if (pharmacistStatus === 'pending') {
            toast.info('Your account is pending NMRA approval.');
            return false;
        } else if (pharmacistStatus === 'rejected') {
            toast.error('Your account was rejected. Please contact NMRA.');
            navigate('/pharmacist-account');
            return false;
        }
        navigate(targetPath);
    };

    return (
        <div className="w-60 p-3 flex flex-col min-h-screen shadow-lg" style={{ background: 'linear-gradient(to bottom, #f4be0bff, #023020)', color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            
            <div className="flex flex-col items-center mb-4">
                <img src={logo} alt="CosmoMed Logo" className="w-40 h-20 object-contain mb-2 rounded-full" />
            </div>

            <Link to="/pharmacist-home" className="flex items-center gap-2 px-2 py-3 rounded hover:bg-yellow-300 transition-all" style={{ textDecoration: 'none', color: 'inherit' }}>
                <RxDashboard size={24} />
                <span className="text-base font-medium">Dashboard</span>
            </Link>

            <div onClick={() => handleAccess('Orders', '/pharmacist-home/order-requests')} className="flex items-center gap-2 px-2 py-3 rounded hover:bg-yellow-300 transition-all cursor-pointer">
                <AiOutlineShoppingCart size={24} />
                <span className="text-base font-medium">Order Requests</span>
            </div>

            <div onClick={() => pharmacistStatus === 'approved' ? setOpenDrugMenu(!openDrugMenu) : handleAccess('Drug Inventory')} className="flex items-center justify-between px-2 py-3 rounded cursor-pointer hover:bg-yellow-300 transition-all">
                <div className="flex items-center gap-2">
                    <GiMedicines size={24} />
                    <span className="text-base font-medium">Drug Inventory</span>
                </div>
                {openDrugMenu ? <IoIosArrowDown size={18} /> : <IoIosArrowForward size={18} />}
            </div>

            {openDrugMenu && pharmacistStatus === 'approved' && (
                <div className="ml-8 mt-1 flex flex-col gap-1">
                    <div onClick={() => navigate('/pharmacist-home/pharmacist-add-drugs')} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-yellow-300 transition-all cursor-pointer">
                        <IoMdAdd size={20} />
                        <span className="text-base">Add Drugs</span>
                    </div>
                    <div onClick={() => navigate('/pharmacist-home/pharmacist-edit-drugs')} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-yellow-300 transition-all cursor-pointer">
                        <FiEdit2 size={20} />
                        <span className="text-base">Edit Drugs</span>
                    </div>
                </div>
            )}

            <Link to="/pharmacist-home/search-products-p" className="flex items-center gap-2 px-2 py-3 rounded hover:bg-yellow-300 transition-all" style={{ textDecoration: 'none', color: 'white' }}>
                <TbMedicineSyrup size={24} />
                <span className="text-base font-medium">Search Products</span>
            </Link>

            <Link to="/pharmacist-home/search-entities-n" className="flex items-center gap-2 px-2 py-3 rounded hover:bg-yellow-300 transition-all" style={{ textDecoration: 'none', color: 'white' }}>
                <FaRegHospital size={24} />
                <span className="text-base font-medium">Search Entities</span>
            </Link>

            <Link to="/pharmacist-home/pharmacy-locator-n/pharmacist-home/pharmacy-locator-n" className="flex items-center gap-2 px-2 py-3 rounded hover:bg-yellow-300 transition-all" style={{ textDecoration: 'none', color: 'inherit' }}>
                <MdLocationOn size={24} />
                <span className="text-base font-medium">Pharmacy Locator</span>
            </Link>

            <Link to="/pharmacist-home/ocr-upload-n" className="flex items-center gap-2 px-2 py-3 rounded hover:bg-yellow-300 transition-all" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IoReader size={24} />
                <span className="text-base font-medium">Prescription Reader</span>
            </Link>

            <Link to="/pharmacist-home/pharmacist-account" className="flex items-center gap-2 px-2 py-3 rounded hover:bg-yellow-300 transition-all" style={{ textDecoration: 'none', color: 'inherit' }}>
                <RiAccountCircle2Fill size={24} />
                <span className="text-base font-medium">{pharmacistStatus ? 'Manage Account' : 'Create an Account'}</span>
            </Link>

            <div className="mt-auto p-3 border-t border-yellow-200 text-sm text-gray-800 text-center">
                © 2025 CosmoMed
            </div>
        </div>
    );
}