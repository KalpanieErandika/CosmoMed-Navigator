import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaSave, FaTimes, FaPills,FaSpinner,FaSearch,FaTrash,FaEye,FaCapsules,FaFlask,FaShieldAlt} from "react-icons/fa";
import {  GiMedicinePills, GiLipstick, GiChemicalDrop} from "react-icons/gi";

export default function NmraEditDrug() {
  const [activeTab, setActiveTab] = useState("medicines_1");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const productFields = {
    medicines_1: [
      { display: "Generic Name", column: "generic_name" },
      { display: "Brand Name", column: "brand_name" },
      { display: "Dosage", column: "Dosage" },
      { display: "Pack Type", column: "pack_type" },
      { display: "Pack Size", column: "pack_size" },
      { display: "Manufacturer", column: "Manufacturer"},
      { display: "Country code", column: "country_code"},
      { display: "Local Agent", column: "local_agent" },
      { display: "Dossier No", column: "dossier_no" },
      { display: "Schedule", column: "Schedule" },
      { display: "Registration No", column: "registration_no" },
      { display: "Date of Registration", column: "date_of_registration"},
      { display: "Validity Period", column: "validity_period" },
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

  // Define ID columns for each table
  const idColumns = {
    medicines_1: "medicine_id",
    cosmetics: "cosmetic_id",
    boarderline_products: "boarderline_id",
    narcotic_drugs: "narcotic_id",
    precursor_chemicals: "precusor_id",
    psychotropic_substances: "substance_id",
  };

  // Fetch products when tab changes
  /*useEffect(() => {
    fetchProducts();
  }, [activeTab]);*/

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/products/${activeTab}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        setProducts(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch products");
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error("Error fetching products. Please try again.");
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product[idColumns[activeTab]]);
    setEditFormData({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const idColumn = idColumns[activeTab];
      
      // Prepare update data 
      const updateData = { ...editFormData };
      delete updateData[idColumn];
      delete updateData.created_at;
      delete updateData.updated_at;

      const response = await axios.put(
        `http://127.0.0.1:8000/api/products/${activeTab}/${editingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        toast.success("Product updated successfully!");
        setEditingId(null);
        setEditFormData({});
        fetchProducts(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (err) {
      console.error('Error updating product:', err);
      if (err.response?.data?.message) {
        toast.error(`${err.response.data.message}`);
      } else {
        toast.error("Error updating product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/products/${activeTab}/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        toast.success("Product deleted successfully!");
        fetchProducts(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error("Error deleting product. Please try again.");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleInputChange = (columnName, value) => {
    setEditFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const handleView = (product) => {
    setViewingProduct(product);
  };

  const closeViewModal = () => {
    setViewingProduct(null);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return productFields[activeTab].some(field => {
      const value = product[field.column];
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-700 to-yellow-500 bg-clip-text text-transparent">
            Edit Products
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Update, or delete registered pharmaceutical products and regulated substances
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-100">
          <div className="bg-gradient-to-r from-green-800 to-green-600 p-4">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaEdit className="text-xl text-yellow-300" />
              Select Product Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.keys(productTypeIcons).map((type) => (
                <button key={type} onClick={() => setActiveTab(type)} className={`p-2 rounded-lg border transition-all duration-200 hover:scale-102 ${ activeTab === type
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

<div className="p-4 border-b border-green-100">
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="flex-1 flex gap-2">
      <div className="relative flex-1">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder={`Search ${productTypeNames[activeTab].toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => {
            if (e.key === 'Enter') {
            }
          }} className="w-full pl-10 pr-4 py-2 border border-green-100 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200" />
      </div>
      <button onClick={() => { (searchTerm.trim() === '') 
            fetchProducts(); 
        }} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm whitespace-nowrap">

        Search
      </button>
    </div>
  </div>
</div>
         
          <div className="p-4">

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <FaPills className="text-2xl text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  No Products Found
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {searchTerm ? "No products match your search" : "No products in this category"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50 border-b border-green-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      {productFields[activeTab].slice(0, 3).map(field => (
                        <th key={field.column} className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {field.display}
                        </th>
                      ))}
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => {
                      const idColumn = idColumns[activeTab]; // Gets the correct ID column name
                      const isEditing = editingId === product[idColumn]; // Checks if this product is being edited
                      
                      return isEditing ? (
                        <tr key={product[idColumn]} className="bg-yellow-50 border-b border-yellow-100">
                          <td colSpan={5} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-gray-800">Editing Product ID: {product[idColumn]}</h4>
                                <div className="flex gap-2">

                        <button onClick={handleSaveEdit} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50 min-w-[80px]">{loading ? (
    <>
      Saving...
    </>
  ) : (
    "Save" )}
</button>
              <button onClick={handleCancelEdit} className="px-3 py-1 bg-yellow-400 text-white rounded-lg text-sm hover:bg-yellow-500 transition-all duration-200 flex items-center gap-1" >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {productFields[activeTab].map(field => (
                                  <div key={field.column} className="group">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                      {field.display}
                                    </label>
                                    <input type="text" className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200" value={editFormData[field.column] || ""}
                                      onChange={(e) => handleInputChange(field.column, e.target.value)} placeholder={field.display} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        //shows the regular table row
                        <tr key={product[idColumn]} className="border-b border-green-50 hover:bg-green-50 transition-colors duration-150">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {product[idColumn]}
                          </td>
                          {productFields[activeTab].slice(0, 3).map(field => (
                            <td key={field.column} className="py-3 px-4 text-sm text-gray-700">
                              {product[field.column] || "-"}
                            </td>
                          ))}
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center gap-2">

                              <button onClick={() => handleEdit(product)}className="p-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all duration-200" title="Edit" >
                                <FaEdit className="text-xs" />
                              </button>

                              <button onClick={() => handleDelete(product[idColumn])} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200" title="Delete" >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-800 to-green-600 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {productTypeIcons[activeTab]}
                Product Details
              </h3>
              <button onClick={closeViewModal} className="text-white hover:text-yellow-300 transition-colors duration-200" >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productFields[activeTab].map(field => (
                  <div key={field.column} className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {field.display}
                    </label>
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                      {viewingProduct[field.column] || "Not specified"}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button onClick={() => { handleEdit(viewingProduct); closeViewModal(); }} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-800 font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center gap-2">
                    <FaEdit />
                    Edit Product
                  </button>

                  <button onClick={closeViewModal} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200" >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}