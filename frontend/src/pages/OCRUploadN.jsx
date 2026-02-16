import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { FaUpload, FaImage, FaSpinner, FaPills, FaFileAlt, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const OCRUploadN = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('medicines');
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResults(null);
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        'http://127.0.0.1:8000/api/analyze-prescription',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
        }
      );
      
      if (response.data.medicines) {
        setResults(response.data);
        toast.success('Prescription analyzed successfully');
      } else {
        toast.error('Analysis failed');
      }
      
    } catch (error) {
      toast.error('Failed to process prescription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Prescription Scanner</h1>
          <p className="text-gray-600">Upload a prescription image to extract medicine information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
   <div className="lg:col-span-2 space-y-6">
 
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Prescription</h2>
              
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                file ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
              }`}>
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
                    <p className="text-sm text-gray-600 truncate">{file.name}</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <FaImage className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-600 mb-3">Select your prescription image</p>
                    <label htmlFor="imageInput" className="cursor-pointer inline-block px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                      Choose File
                    </label>

                <input type="file" id="imageInput" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
     <button onClick={handleProcess} disabled={!file || isProcessing} className={`flex-1 py-2.5 rounded font-medium transition-colors ${ !file && !isProcessing
      ? 'bg-green-500 text-white opacity-60 cursor-not-allowed': isProcessing
      ? 'bg-green-500 text-green-600 cursor-not-allowed': 'bg-green-500 text-white hover:bg-green-600'
  }`}>
  {isProcessing ? (
    <>
      Processing...
    </>
  ) : (
    'Process Image'
  )}
</button>
                <button onClick={handleReset} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded bg-yellow-500 hover:bg-yellow-600">
                  Reset
                </button>
              </div>
            </div>

    {results && (
  <div className="bg-white rounded-lg border">
    <div className="p-4 border-b">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Analysis Results</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Medicines Found</div>
          <div className="text-lg font-bold text-green-600">{results.medicines.length}</div>
        </div>
      </div>
      </div>

    <div className="p-4">
      <div className="space-y-4">
        {results.medicines.map((medicine, index) => (
          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-800">
                  {medicine.brand || 'Unknown Medicine'}
                </h3>
                {medicine.generic && (
                  <p className="text-sm text-gray-600">{medicine.generic}</p>
                )}
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  medicine.similarity >= 0.8 ? 'text-green-600' :
                  medicine.similarity >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(medicine.similarity * 100)}% match
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
              {medicine.manufacturer && (
                <div>Manufacturer: {medicine.manufacturer}</div>
              )}
              {medicine.db_dosage && (
                <div>Available: {medicine.db_dosage}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
          </div>

          {/* Right Column - Guide */}
         <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                     <div className="bg-gradient-to-r from-green-600 to-yellow-500 p-4 text-white">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <FaClock className="mr-2 text-white" />
                Frequency Guide
              </h3>
              </div>

            <div className="p-4">    
              <div className="space-y-3">
                {[
                  { abbr: 'OD', meaning: 'Once daily' },
                  { abbr: 'BD', meaning: 'Twice daily' },
                  { abbr: 'TDS', meaning: 'Three times daily' },
                  { abbr: 'QID', meaning: 'Four times daily' },
                  { abbr: 'PRN / SOS', meaning: 'As needed' },
                  { abbr: 'STAT', meaning: 'Immediately' },
                  { abbr: 'NOCTE / n', meaning: 'At night' },
                  { abbr: 'MANE / m', meaning: 'At morning' },
                  { abbr: '8h', meaning: '8 hourly' },
                  { abbr: '6h', meaning: '6 hourly' },
                  { abbr: 'EOD', meaning: 'Every Other Day' }

                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1 border-b">
                    <span className="font-medium text-gray-700">{item.abbr}</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-bold text-gray-800 mb-3">Tips</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  Use clear images
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  Avoid shadows
                </li>
              </ul>
            </div>
                      </div>

        </div>
      </div>
    </div>
  
  );
};

export default OCRUploadN;