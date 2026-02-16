import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaSync, FaPills, FaSpinner,FaCapsules,FaFlask,FaShieldAlt} from "react-icons/fa";
import { GiMedicinePills, GiLipstick,GiChemicalDrop} from "react-icons/gi";

export default function NmraAddDrug() {
  const [productType, setProductType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  // Map display names to actual database column names
  const productFields = {
    medicines_1: [
      { display: "Generic Name", column: "Genaric Name" },
      { display: "Brand Name", column: "Brand Name" },
      { display: "Dosage", column: "Dosage" },
      { display: "Pack Type", column: "Pack Type" },
      { display: "Pack Size", column: "Pack Size" },
      { display: "Manufacturer", column: "Manufacturer"},
      { display: "Country code", column: "Country code"},
      { display: "Local Agent", column: "Local Agent" },
      { display: "Dossier No", column: "Dossier No" },
      { display: "Schedule", column: "Schedule" },
      { display: "Registration No", column: "Registration No" },
      { display: "Date of Registration", column: "Date of Registration"},
      { display: "Validity Period", column: "Validity Period" },
    ],
    cosmetics: [
      { display: "Generic Name", column: "Generic Name"},
      { display: "Brand Name", column: "Brand Name"},
      { display: "Manufacturer", column: "Manufacturer"},
      { display: "Country", column: "COUNTRY"},
      { display: "Importer", column: "Importer"},
      { display: "Expiry Date", column: "EXPIRY DATE"},
    ],
    boarderline_products: [
      { display: "Product Name", column: "Product Name"},
      { display: "Brand Name", column: "Brand Name"},
      { display: "Dosage Form", column: "Dosage Form"},
      { display: "Importer Name", column: "Importer Name"},
      { display: "Manufacturer", column: "Manufacturer"},
      { display: "Manufactured Country", column: "Manufactured  Country"},
      { display: "Schedule", column: "Schedule"},
    ],
    narcotic_drugs: [
      { display: "Name", column: "Name"},
      { display: "Approved Dosage", column: "ApprovedDosage"},
    ],
    precursor_chemicals: [
      { display: "Name", column: "Name"},
      { display: "HS Code", column: "HS Code"},
      { display: "CAS No", column: "CAS No"},
    ],
    psychotropic_substances: [
      { display: "Name", column: "Name"},
      { display: "Approved Dosage", column: "ApprovedDosage"},
    ],
  };

  const productTypeIcons = {
    medicines_1: <GiMedicinePills className="text-yellow-400" />,
    cosmetics: <GiLipstick className="text-yellow-400" />,
    boarderline_products: <FaCapsules className="text-yellow-400" />,
    narcotic_drugs: <FaShieldAlt className="text-yellow-400" />,
    precursor_chemicals: <GiChemicalDrop className="text-yellow-400" />,
    psychotropic_substances: <FaFlask className="text-yellow-400" />,
  };

  const productTypeNames = {
    medicines_1: "Medicines",
    cosmetics: "Cosmetics",
    boarderline_products: "Borderline Products",
    narcotic_drugs: "Narcotic Drugs",
    precursor_chemicals: "Precursor Chemicals",
    psychotropic_substances: "Psychotropic Substances",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!productType) {
      toast.error("Please select a product type");
      setLoading(false);
      return;
    }

    // Validate required fields
    const requiredFields = productFields[productType];
    const missingFields = requiredFields.filter(field => !formData[field.column]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      //make data with exact column names
      const submitData = {};
      productFields[productType].forEach(field => {
        submitData[field.column] = formData[field.column] || "";
      });

      console.log("Submitting data:", {
        product_type: productType,
        data: submitData
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/api/products/add",
        {
          product_type: productType,
          data: submitData,
        },
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
        toast.success("Product added successfully!");
        setFormData({});
        setProductType("");
        setActiveTab("");
      } else {
        toast.error(response.data.message || "Failed to add product");
      }
    } catch (err) {
      console.error('Error adding product:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else if (err.response?.data?.message) {
        toast.error(`${err.response.data.message}`);
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        toast.error(`${errors.join(', ')}`);
      } else {
        toast.error("Error adding product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (columnName, value) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const resetForm = () => {
    setProductType("");
    setFormData({});
    setActiveTab("");
  };

  const handleProductTypeSelect = (type) => {
    setProductType(type);
    setActiveTab(type);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Compact */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-700 to-yellow-500 bg-clip-text text-transparent">
            Add New Product
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Register new pharmaceutical products and regulated substances
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-100">
          {/* Product Type Selection */}
          <div className="bg-gradient-to-r from-green-800 to-green-600 p-4">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaPills className="text-xl text-yellow-300" />
              Select Product Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.keys(productTypeIcons).map((type) => (
                <button key={type} onClick={() => handleProductTypeSelect(type)} className={`p-2 rounded-lg border transition-all duration-200 hover:scale-102 ${
                    activeTab === type
                      ? "border-yellow-400 bg-yellow-400 bg-opacity-20 text-white shadow-md"
                      : "border-green-400 border-opacity-30 text-white hover:bg-green-700 hover:bg-opacity-50"
                  }`}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-lg">
                      {productTypeIcons[type]}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {productTypeNames[type]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Form - Compact */}
          {productType && (
            <div className="p-4">
              {/* Form Header*/}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-green-100">
    
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800">
                    Add {productTypeNames[productType]}
                  </h2>
                  <p className="text-xs text-gray-600">
                    Fill in all required details
                  </p>
                </div>
                <div>

                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productFields[productType].map((field) => (
                    <div key={field.column} className="group">
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <span className="text-sm">{field.icon}</span>
                        {field.display}
                        <span className="text-red-500 text-xs">*</span>
                      </label>
                      <input type="text" className="w-full px-3 py-2 text-sm border border-green-100 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 group-hover:border-yellow-300 placeholder-gray-400 bg-white"
value={formData[field.column] || ""} onChange={(e) => handleInputChange(field.column, e.target.value)} placeholder={`Enter ${field.display.toLowerCase()}`} />
                    </div>
                  ))}
                </div>

                {/* Form Actions - Compact */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-green-100">
                  <button type="submit" disabled={loading}className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                    {loading ? (
                      <>
                        Adding...
                      </>
                    ) : (
                      <>
                        Add Product
                      </>
                    )}
                  </button>
                  <button type="button" onClick={resetForm} className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 text-sm">
                    Reset
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Empty State - Compact */}
          {!productType && (
            <div className="p-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-yello-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <FaPills className="text-2xl text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  Select Product Type
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Choose a category above to start adding products
                </p>
       
              </div>
            </div>
          )}
        </div>

        {/* Footer Info - Compact */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            NMRA Product Registration • <span className="text-red-500">*</span> Required fields
          </p>
        </div>
      </div>
    </div>
  );
}