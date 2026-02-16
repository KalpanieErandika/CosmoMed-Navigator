import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaSync, FaPills, FaSpinner, FaUserMd, FaCapsules, FaWeight,FaMoneyBillWave,FaDatabase,FaUser} from "react-icons/fa";

export default function PharmacistAddDrugs() {
  const [formData, setFormData] = useState({
    medicine_name: "",
    quantity: "",
    dosage_form: "",
    strength: "",
    unit_price: ""
  });
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dosageForms] = useState([
    "Tablet", "Capsule", "Syrup", "Injection", "Ointment", 
    "Cream", "Drop", "Inhaler", "Powder", "Suspension"
  ]);
  const [strengthUnits] = useState([
    "mg", "g", "ml", "mg/ml", "IU", "%"
  ]);
  const [selectedStrengthUnit, setSelectedStrengthUnit] = useState("mg");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login first");
          window.location.href = "/login";
          return;
        }

        const response = await axios.get(
          "http://127.0.0.1:8000/api/user",
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          }
        );

        if (response.data) {
          setUserData(response.data);
          console.log("User data fetched:", response.data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate 
    const requiredFields = ["medicine_name", "quantity", "dosage_form", "strength", "unit_price"];
    const missingFields = requiredFields.filter(field => !formData[field]?.toString().trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      setLoading(false);
      return;
    }

    // Validate numeric fields
    if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      toast.error("Quantity must be a positive number");
      setLoading(false);
      return;
    }

    if (isNaN(formData.strength) || parseInt(formData.strength) <= 0) {
      toast.error("Strength must be a positive number");
      setLoading(false);
      return;
    }

    if (isNaN(formData.unit_price) || parseFloat(formData.unit_price) <= 0) {
      toast.error("Unit price must be a positive number");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        window.location.href = "/login";
        return;
      }

      const submitData = {
        medicine_name: formData.medicine_name.trim(),
        quantity: parseInt(formData.quantity),
        dosage_form: formData.dosage_form,
        strength: parseInt(formData.strength),
        unit_price: parseFloat(formData.unit_price)
      };

      console.log("Submitting rare medicine data:", submitData);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/pharmacist/rare-medicines/add",
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      console.log("Response:", response.data);

      if (response.data.status) {
        toast.success("Rare medicine added successfully!");
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to add rare medicine");
      }
    } catch (err) {
      console.error('Error adding rare medicine:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else if (err.response?.status === 422) {
        // Laravel validation errors
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error(errorMessages.join(', '));
      } else if (err.response?.data?.message) {
        toast.error(`${err.response.data.message}`);
      } else if (err.message === "Network Error") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Error adding rare medicine. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      medicine_name: "",
      quantity: "",
      dosage_form: "",
      strength: "",
      unit_price: ""
    });
    setSelectedStrengthUnit("mg");
  };

  const totalPrice = formData.quantity && formData.unit_price 
    ? (parseFloat(formData.quantity) * parseFloat(formData.unit_price)).toFixed(2)
    : "0.00";

  // Get pharmacist display name
  const getPharmacistName = () => {
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return "Pharmacist";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-1 bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            Add Rare Medicine
          </h1>
          <p className="text-gray-600">
            Register rare or hard-to-find medicines in the database for patient access
          </p>
          {userData && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100">
              <FaUser className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Pharmacist: {getPharmacistName()}
              </span>
              {userData.slmc_reg_no && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  SLMC: {userData.slmc_reg_no}
                </span>
              )}
            </div>
     )}
</div>

        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
      <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Medicine Name *
                </label>
                <input type="text" value={formData.medicine_name} onChange={(e) => handleInputChange("medicine_name", e.target.value)} className="w-full px-4 py-3 text-base border border-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 placeholder-gray-400 bg-white hover:border-yellow-300" placeholder="Enter the full medicine name (e.g. Spironolactone tablets 25)" maxLength={255} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    Dosage Form *
                  </label>
                  <select value={formData.dosage_form} onChange={(e) => handleInputChange("dosage_form", e.target.value)} className="w-full px-4 py-3 text-base border border-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white hover:border-yellow-300 appearance-none" required>
                    <option value="">Select dosage form</option>
                    {dosageForms.map((form) => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    Strength *
                  </label>
                  <div className="flex gap-2">
                    <input type="number" min="0" value={formData.strength} onChange={(e) => handleInputChange("strength", e.target.value)}
  className="flex-1 px-4 py-3 text-base border border-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 placeholder-gray-400 bg-white hover:border-yellow-300" placeholder="e.g., 25" required />
                    <select value={selectedStrengthUnit} onChange={(e) => setSelectedStrengthUnit(e.target.value)} className="w-24 px-3 py-3 text-base border border-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white">
                      {strengthUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity Available *
                  </label>
                  <div className="relative">
                    <input type="number" min="1" value={formData.quantity} onChange={(e) => handleInputChange("quantity", e.target.value)}
className="w-full px-4 py-3 text-base border border-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 placeholder-gray-400 bg-white hover:border-yellow-300 pr-12" placeholder="e.g., 100" required />
                    <span className="absolute right-4 top-3 text-gray-500">units</span>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    Unit Price (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">Rs.</span>
                    <input type="number" value={formData.unit_price} onChange={(e) => handleInputChange("unit_price", e.target.value)} className="w-full px-12 py-3 text-base border border-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 placeholder-gray-400 bg-white hover:border-yellow-300" placeholder="0.00" required/>
                  </div>
                </div>
              </div>


              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-blue-100">
                <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm" >
                  {loading ? (
                    <>
                      Adding...
                    </>
                  ) : (
                    <>
                      Add Rare Medicine
                    </>
                  )}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 text-sm" >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            About Rare Medicines
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span>Rare medicines are drugs that are not commonly available in regular pharmacies</span>
            </li>
            <li className="flex items-start gap-2">
              <span>These may include specialized treatments, orphan drugs, or imported medications</span>
            </li>
            <li className="flex items-start gap-2">
              <span>Adding rare medicines helps patients locate orphan diseases and immediate treatments</span>
            </li>
            <li className="flex items-start gap-2">
              <span>Ensure all information is accurate for patient safety</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}