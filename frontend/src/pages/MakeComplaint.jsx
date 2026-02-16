import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MakeComplaint() {
  const [form, setForm] = useState({
    category: "", // initial values
    description: "",
    file: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    const token = localStorage.getItem("token");
   
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log("Parsed user:", user);
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'file' && files && files[0]) {
      const file = files[0];
      console.log("File selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
        isImage: file.type.startsWith('image/')
      });
      
      setForm({ ...form, [name]: file });
      
      // Always create preview for images
      if (file.type.startsWith('image/')) { //string method
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null); // Clear preview for non-image files
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevents page refresh
    setLoading(true);
    setDebugInfo("Starting submission...");

    const data = new FormData();
    data.append('category', form.category);
    data.append('description', form.description);
    
    if (form.file) {
      data.append('file', form.file); // adds file only if selected
    }

    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value instanceof File ? 
        `${value.name} (${value.type}, ${value.size} bytes)` : 
        value
      );
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/api/complaints", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json(); // converts response to json object
      setDebugInfo(JSON.stringify(result, null, 2));

      if (response.ok) {
        toast.success("Complaint submitted successfully!");
        
        setForm({ category: "", description: "", file: null }); // clear form and preview
        setPreview(null);
      } else {
        toast.error(result.message || "Failed to submit complaint. Please try again.");
        console.error("Error details:", result);
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.");
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileInfo = () => {
    if (!form.file) return null;
    
    return {
      name: form.file.name,
      size: (form.file.size / 1024).toFixed(1), // convert bytes to KB
      type: form.file.type.startsWith('image/')
        ? 'Image' : form.file.type === 'application/pdf' ? 'PDF' : 'File',
    };
  };

  const fileInfo = getFileInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-2 mt-3">
        {/* Header */}
        <header className="text-center mb-12 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="relative">
              <span className="text-emerald-800">Submit</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-800/30"></span>
            </span>
            <span className="relative ml-2">
              <span className="text-yellow-500">Complaint</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500/30"></span>
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Report issues with pharmacies or healthcare services
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ml-3">
          {/* Complaint Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                Complaint Details
              </h3>           
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>

                  <select  name="category" value={form.category} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition appearance-none cursor-pointer">
                    <option value="">Select Category</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Healthcare Service">Healthcare Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>

                  <textarea name="description" value={form.description} placeholder="Describe your complaint in detail..." 
                    onChange={handleChange} required rows="6" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition placeholder-gray-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach File (Optional)
                  </label>
                  <input type="file" name="file" onChange={handleChange} 
accept="image/*,.pdf" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  
                  {fileInfo && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{fileInfo.name}</p>
                          <p className="text-xs text-gray-600">
                            Type: {fileInfo.type} • Size: {fileInfo.size} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show preview */}
                  {preview && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain bg-gray-50" 
                          onError={(e) => {console.error("Image failed to load:", preview);
                            e.target.style.display = 'none'; }}/>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPEG, PNG, PDF. Max size: 2MB
                  </p>
                </div>

           <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { setForm({ category: "", description: "", file: null }); setPreview(null); setDebugInfo(""); }} className="flex-1 bg-yellow-500 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 active:scale-95 transition">
                    Clear
                  </button>

                  <button type="submit" disabled={loading} 
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition active:scale-95 ${
                      loading
                        ? "bg-green-400 text-green-200 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Submit Complaint
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Guidelines Card */}
          <div className="lg:col-span-1">
            <div className="bg-yellow-50 rounded-xl p-6 shadow-md border border-yellow-200 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                Submission Guidelines
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>Provide clear and detailed descriptions of the issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>Select the appropriate category for faster resolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>Attach relevant files (images, PDFs) as evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>All complaints are treated confidentially</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>Response time: 24-48 business hours</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MakeComplaint;