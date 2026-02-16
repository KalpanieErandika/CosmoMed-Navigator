# CosmoMed Navigator

**CosmoMed Navigator** is a full-stack healthcare support platform designed to improve access to NMRA-approved medical and cosmetic products in Sri Lanka. It integrates pharmacy geolocation, rare medicine purchasing, AI-powered prescription OCR processing, and role-based regulatory monitoring within a secure web application.

---

## Features

- Search NMRA-approved products (medicines, cosmetics, borderline products, narcotic drugs, precursor chemicals, psychotropic substances) and entities (pharmacies, drug manufacturers, importers and exporters)
- Locate pharmacies using Google Maps and Geocoding APIs  
- Upload prescriptions for AI-powered OCR processing (Google Vision API)
- AI powered chatbot (Gemini Flash 2.5)
- Search for hard-to-find medicines and display the pharmacies across the country that have the searched medicine in stock
- Request and purchase rare medicines
- Pharmacist registration approval and rejection by NMRA officials
- Approve or reject medicine orders based on uploaded prescriptions
- Role-based access:
  - General User
  - Pharmacist
  - NMRA Official  
- Submit complaints
- Generate reports for NMRA  
- Responsive web interface built with React + Tailwind
---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Tailwind CSS |
| Backend | Laravel |
| OCR Service | Python Flask |
| Database | MySQL 8.0 |
| APIs | Google Vision API, Google Maps API, Google Geocoding API, Gemini AI API, SMTP Email Service |
| Authentication | Laravel Sanctum (role-based access) |
| Version Control | Git & GitHub |

---

## Installation (Local Development)
### Prerequisites

- Node.js (v18+) & npm  
- PHP (v8.2+) & Composer  
- MySQL (v8.0+)  
- Python 3.10+ (for Flask OCR)  
- Git  
- Web browser (Chrome recommended)  
---

### Frontend Setup

- cd frontend
- npm install
- npm start
- Runs at http://localhost:3000

### Backend Setup

- cd backend
- composer install
- cp .env.example .env
- php artisan key:generate
- php artisan migrate --seed
- php artisan serve
- Runs at http://localhost:8000

### OCR Setup
- cd ocr-service
- python -m venv venv
- venv\Scripts\activate       # Windows
- pip install -r requirements.txt
- python prescription_analyzer.py

### Environment Variables
Backend(.env)
- DB_HOST=
- DB_DATABASE=
- DB_USERNAME=
- DB_PASSWORD=
- GOOGLE_VISION_API_KEY=
- GEMINI_API_KEY=
- MAIL_USERNAME=
- MAIL_PASSWORD=

Frontend(.env)
- REACT_APP_GOOGLE_MAPS_API_KEY=

