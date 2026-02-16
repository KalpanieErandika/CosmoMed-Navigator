import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "./context/Auth1";
import Navbar from "../components/Navbar";
import { FaShoppingCart, FaFilePrescription, FaUpload, FaCheckCircle, FaInfoCircle, FaUser, FaPhone, FaMapMarkerAlt, FaHospital, 
  FaUserMd, FaExclamationTriangle, FaClipboardCheck, FaFileMedical, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdLocalPharmacy, MdWarning, MdDescription } from "react-icons/md";
import { BsFileEarmarkMedical } from "react-icons/bs";

const PurchaseMedicine = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [medicineData, setMedicineData] = useState(null);
  const [rareId, setRareId] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoadingMedicine, setIsLoadingMedicine] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [prescriptionPreview, setPrescriptionPreview] = useState(null);
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState(null);
  
  const [form, setForm] = useState({ //stores all the input values
    name: "",
    address: "",
    contact_no: "",
    quantity: 1,
    prescription_file: null,
    special_instructions: "",
    agree_to_terms: false
  });

  useEffect(() => {
    setIsLoadingMedicine(true);
    
    if (location.state?.medicine) {
      const med = location.state.medicine;
      setMedicineData(med);
      
      if (!med.rare_id) {
        toast.error("Medicine ID is missing! Please select a medicine again.");
        navigate("/search-rare-medicines");
        return;
      }
      
      setRareId(med.rare_id);
      setIsLoadingMedicine(false);
    } else {
      const storedMedicine = localStorage.getItem('selectedMedicineOrder');
      if (storedMedicine) {
        try {
          const med = JSON.parse(storedMedicine);
          setMedicineData(med);
          setRareId(med.rare_id);
          setIsLoadingMedicine(false);
        } catch (error) {
          toast.error("Failed to restore medicine data");
          navigate("/search-rare-medicines");
        }
      } else {
        toast.error("No medicine selected. Please select a medicine first.");
        navigate("/search-rare-medicines");
      }
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "contact_no") {
      const numericValue = value.replace(/\D/g, "");
      setForm({ ...form, [name]: numericValue });
    } else if (name === "quantity") {
      const qty = parseInt(value) || 1;
      if (medicineData && qty > medicineData.quantity) {
        toast.error(`Maximum available quantity: ${medicineData.quantity}`);
        setForm({ ...form, quantity: medicineData.quantity });
      } else {
        setForm({ ...form, [name]: qty });
      }
    } else {
      setForm({ 
        ...form, 
        [name]: type === 'checkbox' ? checked : value 
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload JPG, PNG, or PDF files only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setForm({ ...form, prescription_file: file });
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPrescriptionPreview(null);
    }

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleUploadPrescription = async () => {
    if (!form.prescription_file) {
      toast.error("Please select a prescription file to upload");
      return;
    }

    setLoading(true);
    try {
      const prescriptionData = new FormData();
      prescriptionData.append("prescription_image", form.prescription_file);

      const presRes = await axios.post(
        "http://127.0.0.1:8000/api/prescriptions/upload",
        prescriptionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (presRes.data.status) {
        setPrescriptionId(presRes.data.data.prescription_id);
        setPrescriptionUploaded(true);
        toast.success("Prescription uploaded successfully!");
        proceedToStep2();
      } else {
        toast.error(presRes.data.message || "Failed to upload prescription");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removePrescription = () => {
    setForm({ ...form, prescription_file: null });
    setPrescriptionPreview(null);
    setPrescriptionUploaded(false);
    setPrescriptionId(null);
    setUploadProgress(0);
  };

  const validateStep1 = () => {
    const errors = [];
    
    if (!form.prescription_file) {
      errors.push("Please upload a prescription file");
    }
    
    return errors;
  };

  const proceedToStep2 = () => {
    const errors = validateStep1();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error)); 
      return;
    }
    setStep(2);
  };

  const proceedToStep3 = () => {
    if (!form.name || !form.address || !form.contact_no || !form.quantity) {
      toast.error("Please fill all required fields!");
      return;
    }

    if (form.contact_no.length < 9 || form.contact_no.length > 10) {
      toast.error("Contact number should be 9-10 digits!");
      return;
    }

    if (!form.agree_to_terms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!rareId || rareId === 0) {
      toast.error("Medicine ID is missing!");
      return;
    }   
    setLoading(true);

    try {
      const orderData = {
        name: form.name,
        address: form.address,
        contact_no: parseInt(form.contact_no),
        quantity: parseInt(form.quantity),
        prescription_id: prescriptionId || 0,
        rare_id: rareId,
        pharmacy_id: medicineData?.pharmacy_id || null,
        special_instructions: form.special_instructions || ""
      };

      const orderResponse = await axios.post(
        "http://127.0.0.1:8000/api/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (orderResponse.data.status) {
        toast.success("Order request sent to the pharmacist!");
        localStorage.removeItem('selectedMedicineOrder');
        setStep(4);
      } else {
        toast.error(orderResponse.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order error:", error);
      
      if (error.response) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          Object.values(validationErrors).forEach(errArray => { //display backend validation errors
            errArray.forEach(err => toast.error(err));
          });
        } else {
          toast.error(error.response.data.message || "Server error"); //handle custom error messages
        }
      } else if (error.request) {
        toast.error("No response from server. Check your connection.");
      } else {
        toast.error("Error placing order: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "LKR 0.00";
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const totalPrice = medicineData ? form.quantity * parseFloat(medicineData.unit_price || 0) : 0;

  if (isLoadingMedicine || !medicineData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading medicine details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-2">
        <header className="text-center mb-12 md:mb-1 mt-3">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="relative">
              <span className="text-emerald-800">Purchase</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-800/30"></span>
            </span>
            <span className="relative ml-2">
              <span className="text-yellow-500">Medicines</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500/30"></span>
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Purchase hard-to-find medicines available with registered pharmacists
          </p>
        </header>
      </div>
      
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
               ${step >= stepNumber 
               ? 'bg-yellow-500' : 'bg-gray-300' }`}>
                  {step > stepNumber ? <FaCheckCircle /> : stepNumber}
                </div>
                <div className={`ml-2 ${stepNumber < 4 ? 'w-24 h-1' : ''} 
                  ${step > stepNumber ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm font-semibold">
            <span className={`${step >= 1 ? 'text-yellow-600' : 'text-gray-500'}`}>Prescription</span>
            <span className={`${step >= 2 ? 'text-yellow-600' : 'text-gray-500'}`}>Order Details</span>
            <span className={`${step >= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>Review</span>
            <span className={`${step >= 4 ? 'text-yellow-600' : 'text-gray-500'}`}>Confirmed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FaFilePrescription className="text-yellow-500" />
                    Upload Prescription First
                  </h2>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800">{medicineData.medicine_name}</h3>
                      <p className="text-sm text-gray-600">{medicineData.dosage_form} • {medicineData.strength}mg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Unit Price</p>
                      <p className="font-bold text-green-600">{formatCurrency(medicineData.unit_price)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-yellow-300 rounded-xl p-8 text-center hover:border-yellow-400 transition-colors bg-yellow-50/50 mb-6">
                  {form.prescription_file ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <BsFileEarmarkMedical className="text-4xl text-green-500" />
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-800">{form.prescription_file.name}</h4>
                          <p className="text-sm text-gray-600">
                            {(form.prescription_file.size / 1024 / 1024).toFixed(2)} MB • {form.prescription_file.type}
                          </p>
                        </div>
                      </div>
                      
                      {prescriptionPreview && (
                        <div className="max-w-md mx-auto">
                          <img src={prescriptionPreview} alt="Prescription preview" className="rounded-lg border border-gray-300 max-h-64 mx-auto" />
                        </div>
                      )}
                      
                      {uploadProgress < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      )}
                      
                      <div className="flex justify-center gap-4">
                        <input type="file" id="prescription" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden"/>
                        <label htmlFor="prescription" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all cursor-pointer font-semibold">
                          Change File
                        </label>
                        <button onClick={removePrescription} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all font-semibold">
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUpload className="text-3xl text-yellow-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Upload Your Prescription
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Please upload a clear photo or scanned copy of your prescription before proceeding
                      </p>
                      <input type="file" id="prescription" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden"/>

                      <label htmlFor="prescription" className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 mx-auto cursor-pointer inline-block shadow-lg hover:shadow-xl">
                        <FaUpload /> Choose File
                      </label>
                      <p className="text-sm text-gray-500 mt-4">
                        Supported formats: JPG, PNG (Max 5MB)
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Prescription Requirements</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Prescription must be clear</li>
                        <li>• Include doctor's name, seal, and date</li>
                        <li>• Show patient name, age and details clearly</li>
                        <li>• For urgent requests, pharmacist will contact you for verification</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button onClick={() => navigate("/search-rare-medicines")}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all">
                    Cancel
                  </button>
                  <button onClick={handleUploadPrescription} disabled={!form.prescription_file || loading} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        Upload & Continue
                        <FaArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FaUser className="text-yellow-500" />
                    Order Details
                  </h2>
                  <button onClick={() => setStep(1)} className="text-yellow-600 hover:text-yellow-800 font-medium flex items-center gap-2">
                    <FaArrowLeft /> Back to Prescription
                  </button>
                </div>

                {prescriptionUploaded && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaCheckCircle className="text-2xl text-green-500" />
                        <div>
                          <h4 className="font-bold text-green-700">Prescription Uploaded Successfully!</h4>
                          <p className="text-sm text-green-600">ID: {prescriptionId}</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Full Name *
                      </label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all" placeholder="Enter your full name" required/>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Number *
                      </label>
                      <input type="tel" name="contact_no" value={form.contact_no} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all" placeholder="10 digit number" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity Required *
                      </label>
                      <div className="flex items-center gap-4">
                        <input type="number" name="quantity" min="1" max={medicineData.quantity} value={form.quantity} onChange={handleChange} className="w-32 px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"/>
                        <span className="text-sm text-gray-600">
                          Max: {medicineData.quantity} units
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estimated Total
                      </label>
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-green-100 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800">Total:</span>
                          <span className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" id="terms" name="agree_to_terms" checked={form.agree_to_terms} onChange={handleChange} className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 mt-1"/>
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        I confirm that I have read and agree to the terms and conditions. 
                        I understand that this order is subject to verification from the pharmacy.
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
                    <button onClick={() => setStep(1)} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all">
                      Back to Prescription
                    </button>
                    <button onClick={proceedToStep3} disabled={!form.agree_to_terms} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                      Review Order
                      <FaClipboardCheck />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaClipboardCheck className="text-green-500" />
                  Review Your Order
                </h2>

                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-3">Medicine Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Medicine</p>
                        <p className="font-semibold">{medicineData.medicine_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Strength & Form</p>
                        <p className="font-semibold">{medicineData.strength} mg • {medicineData.dosage_form}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-semibold">{form.quantity} units</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Unit Price</p>
                        <p className="font-semibold">{formatCurrency(medicineData.unit_price)} per unit</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaFileMedical className="text-green-500 text-2xl" />
                        <div>
                          <p className="font-semibold text-green-700">Prescription Uploaded</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-3">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{form.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{form.contact_no}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-semibold">{form.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estimated Total</p>
                        <p className="font-semibold text-green-600">{formatCurrency(totalPrice)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
                    <button onClick={() => setStep(2)} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all">
                      Back to Details
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-green-500 hover:bg-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                      {loading ? (
                        <>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle /> Confirm and Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="bg-white rounded-xl shadow-lg border border-green-200 p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-4xl text-green-500" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Order Request Sent Successfully!
                </h2>
                
                <p className="text-gray-600 text-lg mb-6">
                  Your order request has been sent to the pharmacist. They will notify you about the order status via email.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                  <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medicine:</span>
                      <span className="font-semibold">{medicineData.medicine_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold">{form.quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Status:</span>
                      <span className="font-semibold text-yellow-600">Pending</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-6">
                  <button onClick={() => navigate("/home")} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl">
                    Go to Home
                  </button>
                  <button onClick={() => navigate("/search-rare-medicines")} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl">
                    Browse More Medicines
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {step < 4 && medicineData && (
              <div className="sticky top-8 space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl shadow-lg border border-yellow-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdLocalPharmacy className="text-yellow-500" />
                    Medicine Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-yellow-200">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-800">{medicineData.medicine_name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-yellow-200">
                      <span className="text-gray-600">Form:</span>
                      <span className="font-semibold">{medicineData.dosage_form}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-yellow-200">
                      <span className="text-gray-600">Strength:</span>
                      <span className="font-semibold">{medicineData.strength}mg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available:</span>
                      <span className={`font-semibold ${medicineData.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {medicineData.quantity} units
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaHospital className="text-green-500" />
                    Pharmacy Details
                  </h3>
                  
              <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Pharmacy Name</p>
                      <p className="font-semibold text-gray-800">{medicineData.pharmacy_name || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Pharmacist</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <FaUserMd className="text-green-500" />
                        {medicineData.pharmacist_name || "Not specified"}
                      </p>
                    </div>
                    
                    {medicineData.address && (
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-yellow-500" />
                          {medicineData.address}
                        </p>
                      </div>
                    )}
                    
                    {medicineData.contact_no && (
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          <FaPhone className="text-green-500" />
                          {medicineData.contact_no}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl shadow-lg border border-yellow-300 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Price Summary</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price</span>
                      <span className="font-semibold">{formatCurrency(medicineData.unit_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity</span>
                      <span className="font-semibold">{form.quantity} units</span>
                    </div>
                    <div className="border-t border-yellow-300 pt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-800">Estimated Total</span>
                        <span className="text-green-600 text-xl">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseMedicine;