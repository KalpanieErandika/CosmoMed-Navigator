import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import PharmacistDashboard from './pages/PharmacistDashboard';
import NmraDashboard from './pages/NmraDashboard';
import MakeComplaint from './pages/MakeComplaint';

import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './pages/context/Auth1';
import PharmacyLocator from './pages/PharmacyLocator';
import PrescriptionReader from './pages/PrescriptionReader';
import SearchEntities from './pages/SearchEntities';
import SearchProducts from './pages/SearchProducts';
import PurchaseMedicine from './pages/PurchaseMedicine';
import OrderRequests from './pages/OrderRequests';
import ViewComplaint from './pages/ViewComplaint';
import NmraAddDrug from './pages/NmraAddDrug';
import NmraAccountRequests from './pages/NmraAccountRequests';
import NmraEditDrugs from './pages/NmraEditDrugs';
import PharmacistAccount from './pages/PharmacistAccount';
import PharmacistAddDrugs from './pages/PharmacistAddDrugs';
import PharmacistEditDrugs from './pages/PharmacistEditDrugs';
import Chatbot from './pages/Chatbot';
import Dashboard_layout from './pages/context/Dashboard_layout';
import NMRAAddEntities from './pages/NMRAAddEntities';
import NmraEditEntities from './pages/NmraEditEntities';
import NmraLayout from './pages/context/NmraLayout';
import SearchProductsN from './pages/SearchProductsN';
import SeachEntitiesN from './pages/SeachEntitiesN';
import SearchProductsP from './pages/SearchProductsP';
import SearchRareMedicines from './pages/SearchRareMedicines';
import RevokeApprovedPharmacist from './pages/RevokeApprovedPharmacist';
import OCRUpload from './pages/OCRUpload';
import OCRUploadN from './pages/OCRUploadN';
import MyOrders from './pages/MyOrders';
import ReportGeneration from './pages/ReportGeneration';
import PharmacyLocatorN from './pages/PharmacyLocatorN';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* User Home */}
          <Route
            path="/user-home"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>}/>

          <Route path="/pharmacist-home" element={
              <RequireAuth allowedRoles={['pharmacist']}>
                <Dashboard_layout />
              </RequireAuth>}>

            <Route index element={<PharmacistDashboard />} />
            <Route path="pharmacist-add-drugs" element={<PharmacistAddDrugs />} />
            <Route path="pharmacist-edit-drugs" element={<PharmacistEditDrugs />} />
            <Route path="search-products-p" element={<SearchProductsP />} />
            <Route path="search-entities-n" element={<SeachEntitiesN />} />
            <Route path="order-requests" element={<OrderRequests />} />
            <Route path="pharmacy-locator-n" element={<PharmacyLocatorN />} />
             <Route path="pharmacist-account" element={<PharmacistAccount />} />
             <Route path="ocr-upload-n" element={<OCRUploadN/>} />
          </Route>


          <Route path="/pharmacy-locator" element={
              <RequireAuth allowedRoles={['pharmacist']}>
                <Dashboard_layout>
                  <PharmacyLocator />
                </Dashboard_layout>
              </RequireAuth> } />

          <Route path="/prescription-reader" element={
              <RequireAuth allowedRoles={['pharmacist']}>
                <Dashboard_layout>
                  <PrescriptionReader />
                </Dashboard_layout>
              </RequireAuth>
            }/>


          <Route path="/nmra-home" element={
              <RequireAuth allowedRoles={['nmra_official']}>
                <NmraLayout />
              </RequireAuth>
            }>

            <Route index element={<NmraDashboard />} />
            <Route path="nmra-add-drugs" element={<NmraAddDrug />} />
            <Route path="nmra-edit-drugs" element={<NmraEditDrugs />} />
            <Route path="nmra-add-entities" element={<NMRAAddEntities />} />
            <Route path="nmra-edit-entities" element={<NmraEditEntities />} />
            <Route path="nmra-account-requests" element={<NmraAccountRequests />} />
            <Route path="search-products-n" element={<SearchProductsN />} />
            <Route path="search-entities-n" element={<SeachEntitiesN />} />
            <Route path="revoke-pharmacist" element={<RevokeApprovedPharmacist />} />
            <Route path="report-generation" element={<ReportGeneration />} />
              <Route path="pharmacy-locator-n" element={<PharmacyLocatorN />} />
                <Route path="prescription-reader" element={<PrescriptionReader />} />
                  <Route path="view-complaint" element={<ViewComplaint />} />
                    <Route path="ocr-upload-n" element={<OCRUploadN/>} />
          </Route>


          <Route path="/make-complaint" element={
              <RequireAuth>
                <MakeComplaint />
              </RequireAuth>}/>

              <Route path="/pharmacist-account" element={
              <RequireAuth>
                <PharmacistAccount />
              </RequireAuth>}/>

          <Route path="/search-products" element={
              <RequireAuth>
                <SearchProducts />
              </RequireAuth>}/>

          <Route path="/search-entities" element={
              <RequireAuth>
                <SearchEntities />
              </RequireAuth>}/>

          <Route path="/purchase-medicine" element={
              <RequireAuth>
                <PurchaseMedicine />
              </RequireAuth>}/>

                  <Route path="/report-generation" element={
              <RequireAuth>
                <ReportGeneration/>
              </RequireAuth>}/>

               <Route path="/ocr-upload-n" element={
              <RequireAuth>
                <OCRUploadN/>
              </RequireAuth>}/>          

          <Route path="/search-rare-medicines" element={
              <RequireAuth>
                <SearchRareMedicines />
              </RequireAuth>}/>

          <Route path="/view-complaint" element={
              <RequireAuth>
                <ViewComplaint />
              </RequireAuth>} />

                    <Route path="/pharmacy-locator-n" element={
              <RequireAuth>
                <PharmacyLocatorN />
              </RequireAuth>
            } />

                         <Route path="/pharmacy-locator-n" element={
              <RequireAuth>
                <PharmacyLocatorN />
              </RequireAuth>} />

          <Route path="/chatbot" element={
              <RequireAuth>
                <Chatbot />
              </RequireAuth>} />

          <Route path="/ocr-upload" element={
              <RequireAuth>
                <OCRUpload />
              </RequireAuth>}/>

                    <Route path="/nmra-edit-drugs" element={
              <RequireAuth>
                <NmraEditDrugs />
              </RequireAuth>}/>

              <Route path="/my-orders" element={
              <RequireAuth>
                <MyOrders />
              </RequireAuth> }/>

                     <Route path="/about-us" element={
              <RequireAuth>
                <AboutUs />
              </RequireAuth>}/>

                          <Route path="/footer" element={
              <RequireAuth>
                <Footer />
              </RequireAuth>} />

                        <Route path="/find-pharmacies" element={
              <RequireAuth>
                <PharmacyLocator />
              </RequireAuth> } />

        </Routes>

        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;