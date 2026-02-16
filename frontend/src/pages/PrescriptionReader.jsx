import React, { useState } from 'react';
import axios from 'axios';

const PrescriptionReader = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const res = await axios.post('http://localhost:8000/api/upload-prescription', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setExtractedText(res.data.text); // Assuming backend returns extracted text
    } catch (err) {
      console.error(err);
      alert('Failed to extract text');
    }
  };

  return (
    <div>
      <h2>Upload Prescription</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Extract Text</button>

      {extractedText && (
        <div>
          <h3>Extracted Text:</h3>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
};

export default PrescriptionReader;
