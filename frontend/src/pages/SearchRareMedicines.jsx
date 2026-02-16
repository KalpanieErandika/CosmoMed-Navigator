import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { FaSearch, FaExclamationTriangle, FaPhone, FaEnvelope, FaUserMd, FaHospital, FaSpinner, FaBuilding, FaShoppingCart, FaClipboardList } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { MdInfo, MdLocationOn, MdShoppingCart } from "react-icons/md";

const SearchRareMedicines = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }
      
      const response = await axios.get(
        "http://127.0.0.1:8000/api/rare-medicines/search-all",
        {
          params: { search: searchTerm },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        setResults(response.data.data);
        if (response.data.data.length === 0) {
          toast.info("No rare medicines found matching your search");
        }
      } else {
        setError(response.data.message || "Failed to search rare medicines");
      }
    } catch (err) {
      console.error("Error:", err);
      
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        
        if (err.response.data && err.response.data.message) {
          setError(`Server error: ${err.response.data.message}`);
        } else {
          setError(`Server error ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Error setting up request: " + err.message);
      }
      
      toast.error("Error searching rare medicines.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOrderNow = (medicine) => {

    const pharmacyIdValue = medicine.pharmacy_id; 

    const orderData = {
      rare_id: medicine.rare_id,  pharmacy_id: pharmacyIdValue, medicine_name: medicine.medicine_name, dosage_form: medicine.dosage_form, strength: medicine.strength,
unit_price: medicine.unit_price, quantity: medicine.quantity, pharmacist_name: medicine.pharmacist_name,pharmacy_name: medicine.pharmacy_name, address: medicine.address,contact_no: medicine.contact_no,email: medicine.email};
 
    localStorage.setItem('selectedMedicineOrder', JSON.stringify(orderData));
    navigate("/purchase-medicine", { state: { medicine: orderData } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 ">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 ">
        <header className="text-center mb-12 md:mb-1 mt-3">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="relative">
              <span className="text-emerald-800">Search</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-800/30"></span>
            </span>
            <span className="relative ml-2">
              <span className="text-yellow-500">Rare</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500/30"></span>
            </span>
            <span className="relative ml-2">
              <span className="text-emerald-800">Medicines</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-800/30"></span>
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Find hard-to-find medicines available with registered pharmacists
          </p>
        </header>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 mb-8 mr-50 ml-50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-10">

       <div className="relative">
              <input type="text"  placeholder="Search by medicine name" value={searchTerm}  onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all placeholder-gray-400 hover:border-yellow-500"/>
              <FaSearch className="absolute right-3 top-3 text-yellow-500" />
            </div>
          </div>

          <div className="lg:col-span-2">
            <button onClick={handleSearch} disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}
      </div>

      {results.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden mr-10 ml-10 mb-5">
          <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-4 ">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Search Results</h2>
         </div>
              
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                <FaClipboardList />
                <span>Select a medicine to order</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Medicine Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Pharmacy & Location
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Pharmacist & Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {results.map((medicine, index) => (
                  <tr key={medicine.rare_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {medicine.medicine_name}
                        </div>

                <div className="text-xs text-gray-600 mt-1">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                            {medicine.dosage_form}
                          </span>
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {medicine.strength} mg
                          </span>
                        </div>

                        <div className="mt-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold px-2 py-1 rounded text-xs ${
                              medicine.quantity > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800' }`}>
                              {medicine.quantity > 0 ? 'Available' : 'Out of Stock'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-semibold">{medicine.quantity} units</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-600">Unit Price:</span>
                            <span className="font-semibold text-green-600">
                              Rs. {parseFloat(medicine.unit_price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {medicine.pharmacy_name && (
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {medicine.pharmacy_name}
                            </span>
                          </div>
                        )}                     
                {(medicine.address || medicine.district || medicine.moh) && (
                     <div className="flex items-start gap-2">

                            <div className="text-xs text-gray-600">
                              {medicine.address && (
                                <div>{medicine.address}</div>
                              )}
                              {(medicine.district || medicine.moh) && (
                                <div className="mt-1">
                                  {medicine.district && <span>{medicine.district}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!medicine.pharmacy_name && !medicine.address && !medicine.district && !medicine.moh && (
                          <div className="text-xs text-gray-500 italic">
                            Location information not available
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {medicine.pharmacist_name && (
                          <div className="flex items-center gap-2">
   
                            <span className="text-sm text-gray-800">{medicine.pharmacist_name}</span>
                          </div>
                        )}
                        
                        {medicine.slmc_reg_no && (
                          <div className="text-xs text-gray-600 ml-1">
                            SLMC: {medicine.slmc_reg_no}
                          </div>
                        )}
                        
                        {(medicine.contact_no || medicine.email) && (
                          <div className="mt-2 space-y-1">
                            {medicine.contact_no && (
                              <div className="flex items-center gap-2">
    
                                <span className="text-xs text-gray-600">{medicine.contact_no}</span>
                              </div>
                            )}
                            {medicine.email && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 truncate max-w-[150px]">{medicine.email}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!medicine.pharmacist_name && !medicine.contact_no && !medicine.email && (
                          <div className="text-xs text-gray-500 italic">
                            Contact information not available
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleOrderNow(medicine)} className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all shadow hover:shadow-md" >
                          <FaShoppingCart /> Order Now
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

       </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-8 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-yellow-300">
              <MdInfo className="text-3xl text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {searchTerm ? "No Rare Medicines Found" : "Search Rare Medicines"}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchRareMedicines;