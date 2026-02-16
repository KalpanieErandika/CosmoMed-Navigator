import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './context/Auth1';
import { FaFilePdf, FaCalendarAlt, FaUsers,FaShoppingCart, FaCapsules } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';

const ReportGeneration = () => {
  const { token } = useAuth();
  const [generating, setGenerating] = useState(false);

  const [reportType, setReportType] = useState('pharmacist_registrations');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportTypes = [
    {
      id: 'pharmacist_registrations',
      name: 'Pharmacist Registrations',
      description: 'Report on pharmacist registration activities',
      icon: <FaUsers className="text-black-500" />,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'rare_medicines',
      name: 'Rare Medicines Inventory',
      description: 'Inventory report of rare medicines',
      icon: <FaCapsules className="text-black-500" />,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'orders_summary',
      name: 'Orders Summary',
      description: 'Summary of all medicine orders',
      icon: <FaShoppingCart className="text-black-500" />,
      color: 'from-yellow-500 to-yellow-600'
    },
  ];

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    try {
      setGenerating(true);
      //handle PDF download
      const response = await axios.post(
        `http://127.0.0.1:8000/api/nmra/reports/generate`,
        { report_type: reportType, start_date: startDate, end_date: endDate, format: 'pdf'}, //j

        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { //convert response to downloadable pdf
        type: response.headers['content-type']
      });

const filename = `${reportType}_${startDate}_to_${endDate}.pdf`;
      
      //create download link and trigger download
      const url = window.URL.createObjectURL(blob); //create a temporary URL for the file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      //clean up URL object
      window.URL.revokeObjectURL(url);  
      toast.success("PDF report downloaded successfully!");   
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorJson = JSON.parse(reader.result);
            toast.error(`Error: ${errorJson.message || "Failed to generate report"}`);
          } catch (e) {
            toast.error("Error generating report");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        const errorMsg = error.response?.data?.message || error.message || "Error generating report";
        toast.error(`Error: ${errorMsg}`);
        
        if (error.response?.data?.error_details) {
          console.error("Server error details:", error.response.data.error_details);
        }
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-1">
        <div className="mb-8 text-center w-full max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Report Generation
          </h1>
          <p className="text-gray-600 text-lg">
            Generate comprehensive PDF reports for NMRA activities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Generate New Report
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Report Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {reportTypes.map((type) => (
                    <div key={type.id} onClick={() => setReportType(type.id)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        reportType === type.id 
                          ? `border-yellow-500 bg-gradient-to-r ${type.color} bg-opacity-10` : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        {type.icon}
                        <span className="font-semibold text-gray-800">{type.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaCalendarAlt className="text-yellow-500" />
                  Select Date Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" />
                  </div>
                </div>
              </div>

              <button onClick={generateReport} disabled={generating || !startDate || !endDate} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                {generating}
                {generating ? "Generating PDF..." : "Generate PDF Report"}
          </button>
           </div>
       </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneration;