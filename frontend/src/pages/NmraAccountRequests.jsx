import React, { useState, useEffect, useContext } from "react";
import {  Table,  Button, Badge, Modal, Form, Spinner, Container, Card, Row, Col, Tabs, Tab 
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from './context/Auth1';

// Create axios instance with interceptors
const createApi = (token) => {
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true,
  });

  // Add request interceptor to include token
  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['Accept'] = 'application/json';
      config.headers['Content-Type'] = 'application/json';
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('401 Unauthorized - clearing auth data');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const NmraAccountRequests = () => {
  const { user, token: authToken } = useContext(AuthContext);
  const [pendingPharmacists, setPendingPharmacists] = useState([]);
  const [approvedPharmacists, setApprovedPharmacists] = useState([]);
  const [rejectedPharmacists, setRejectedPharmacists] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Create api instance with current token
  const api = createApi(authToken);

  useEffect(() => {

    if (!user || !authToken) {
      toast.error("Please log in to access this page");
      window.location.href = '/login';
      return;
    }

    if (user.user_type !== 'nmra_official') {
      toast.error("Access denied. NMRA officials only.");
      const redirectMap = {
        pharmacist: '/pharmacist-home',
        general_user: '/user-home',
      };
      window.location.href = redirectMap[user.user_type] || '/login';
      return;
    }

    fetchAllPharmacists();
  }, [user, authToken]);

  const ensureCsrfToken = async () => {
    try {
      await api.get('/sanctum/csrf-cookie');
      return true;
    } catch (error) {
      toast.error("Network error. Please check if the server is running.");
      return false;
    }
  };

  const fetchAllPharmacists = async () => {
    try {
      setLoading(true);
      
      // Ensure CSRF token is set
      const csrfSuccess = await ensureCsrfToken();
      if (!csrfSuccess) return;

      // Fetch pending pharmacists
      const pendingResponse = await api.get('/api/nmra/pending-pharmacists');
      if (pendingResponse.data.status) {
        setPendingPharmacists(pendingResponse.data.data);
      }

      // Fetch approved pharmacists
      const approvedResponse = await api.get('/api/nmra/approved-pharmacists');
      if (approvedResponse.data.status) {
        setApprovedPharmacists(approvedResponse.data.data);
      }

      // Fetch rejected pharmacists
      const rejectedResponse = await api.get('/api/nmra/rejected-pharmacists');
      if (rejectedResponse.data.status) {
        setRejectedPharmacists(rejectedResponse.data.data);
      }
      
    } catch (error) {
  if (error.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        toast.error("Access denied. NMRA officials only.");
      } else if (error.code === 'ERR_NETWORK') {
        toast.error("Network error. Please check if the server is running.");
      } else {
        toast.error(error.response?.data?.message || "Failed to load data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pharmacistId) => {
    try {
      await ensureCsrfToken();    
      await api.post(`/api/nmra/pharmacist/${pharmacistId}/approve`);

      toast.success("Pharmacist approved successfully");
      fetchAllPharmacists(); //refresh all lists
    } catch (error) {
      console.error("Error approving pharmacist:", error);
      toast.error(error.response?.data?.message || "Failed to approve pharmacist");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await ensureCsrfToken();    
      await api.post(`/api/nmra/pharmacist/${selectedPharmacist.id}/reject`, {
        reason: rejectionReason
      });

      toast.success("Pharmacist rejected successfully");
      setShowModal(false);
      setRejectionReason("");
      setSelectedPharmacist(null);
      fetchAllPharmacists(); // Refresh all lists
    } catch (error) {
      console.error("Error rejecting pharmacist:", error);
      toast.error(error.response?.data?.message || "Failed to reject pharmacist");
    }
  };

  const openRejectModal = (pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const PharmacistTable = ({ pharmacists, showActions = true, status = 'pending' }) => (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead className="bg-light">
          <tr>
            <th className="border-0 ps-4">No</th>
            <th className="border-0">Pharmacist Details</th>
            <th className="border-0">Contact Information</th>
            <th className="border-0">SLMC Registration</th>
            <th className="border-0 text-center">License Document</th>
            <th className="border-0">
              {status === 'pending' ? 'Application Date' : 
               status === 'approved' ? 'Approval Date' : 'Rejection Date'}
            </th>
            {status !== 'pending' && <th className="border-0">Status</th>}
            {showActions && <th className="border-0 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {pharmacists.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 8 : status !== 'pending' ? 7 : 6} className="text-center py-5">
                <div className="text-muted">
                  <i className={`bi bi-${getStatusIcon(status)} mb-3 opacity-25`} style={{ fontSize: '3rem' }}></i>
                  <h5>No {getStatusTitle(status)}</h5>
                  <p className="mb-0">
                    {getEmptyMessage(status)}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            pharmacists.map((pharmacist, index) => (
              <tr key={pharmacist.id} className="border-bottom">
                <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                <td>
                  <div>
                    <h6 className="mb-1 text-dark">{pharmacist.pharmacist_name}</h6>
                    <small className="text-muted">
                      {pharmacist.first_name} {pharmacist.last_name}
                    </small>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-1">
                      <i className="bi bi-envelope text-muted me-2"></i>
                      <small>{pharmacist.email}</small>
                    </div>
                    {pharmacist.contact_no && (
                      <div className="d-flex align-items-center">
                        <i className="bi bi-telephone text-muted me-2"></i>
                        <small>{pharmacist.contact_no}</small>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <Badge bg="outline-primary" className="text-primary border">
                    {pharmacist.slmc_reg_no}
                  </Badge>
                </td>
                <td className="text-center">
                  {pharmacist.license_image ? (
                    <div className="d-flex flex-column align-items-center">
                      <Button variant="outline-primary" size="sm" className="d-flex align-items-center mb-1" onClick={() =>
window.open(  `http://127.0.0.1:8000/storage/${pharmacist.license_image}`, "_blank")} >
                        View License
                      </Button>
                     
                    </div>
                  ) : (
                    <Badge bg="outline-secondary" className="text-secondary border">
                      No License
                    </Badge>
                  )}
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <small>
                      {new Date(
                        status === 'pending' ? pharmacist.created_at : 
                        pharmacist.approved_at || pharmacist.created_at
                      ).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short',day: 'numeric'})}
                    </small>
                  </div>
                  {(status === 'approved' || status === 'rejected') && pharmacist.approved_by && (
                    <small className="text-muted d-block mt-1">
                      {status === 'approved' ? 'Approved' : 'Rejected'} by: {pharmacist.approved_by}
                    </small>
                  )}
                  {status === 'rejected' && pharmacist.rejection_reason && (
                    <small className="text-danger d-block mt-1">
                      Reason: {pharmacist.rejection_reason}
                    </small>
                  )}
                </td>
                {status !== 'pending' && (
                  <td>
                    {getStatusBadge(status)}
                  </td>
                )}
                {showActions && (
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50 text-sm" onClick={() => handleApprove(pharmacist.id)}disabled={loading}>
  Approve
</button>

                      <button className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50 text-sm" onClick={() => openRejectModal(pharmacist)} disabled={loading}>
  Reject
</button>   
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'person-check';
      case 'rejected': return 'person-x';
      case 'pending': return 'clock-history';
      default: return 'person';
    }
  };

  const getStatusTitle = (status) => {
    switch (status) {
      case 'approved': return 'Approved Accounts';
      case 'rejected': return 'Rejected Applications';
      case 'pending': return 'Pending Requests';
      default: return 'Accounts';
    }
  };

  const getEmptyMessage = (status) => {
    switch (status) {
      case 'approved': return 'No pharmacists have been approved yet.';
      case 'rejected': return 'No pharmacist applications have been rejected.';
      case 'pending': return 'All pharmacist applications have been processed.';
      default: return 'No data available.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-4">
      <Container fluid>
             <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-700 to-yellow-500 bg-clip-text text-transparent">
           Pharmacist Account Management
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
             Review and manage pharmacist registration applications
          </p>
        </div>

        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white py-3 border-bottom">
            <Tabs activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)} className="mb-0" >
              <Tab  eventKey="pending"  title={
                  <span>
                    Pending
                    {pendingPharmacists.length > 0 && ( <Badge bg="warning" className="ms-2">{pendingPharmacists.length}</Badge> )}
                  </span> }/>

              <Tab eventKey="approved" title={
                  <span>
                    Approved
                    {approvedPharmacists.length > 0 && (
                      <Badge bg="success" className="ms-2">{approvedPharmacists.length}</Badge> )}
                  </span>} />

              <Tab  eventKey="rejected" title={
                  <span>
                    Rejected
                    {rejectedPharmacists.length > 0 && ( <Badge bg="danger" className="ms-2">{rejectedPharmacists.length}</Badge>
                    )} </span>
                }/>
            </Tabs>
          </Card.Header>
          <Card.Body className="p-0">
            {activeTab === 'pending' && (
              <PharmacistTable  pharmacists={pendingPharmacists} showActions={true} status="pending"/>
            )}
            {activeTab === 'approved' && (
              <PharmacistTable pharmacists={approvedPharmacists} showActions={false} status="approved"/>
            )}
            {activeTab === 'rejected' && (
              <PharmacistTable pharmacists={rejectedPharmacists} showActions={false} status="rejected"/>
            )}
          </Card.Body>
        </Card>

        {/* Rejection Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton className="border-bottom-0 pb-0">
            <Modal.Title className="d-flex align-items-center">
              <i className="bi bi-x-circle text-danger me-2"></i>
              Reject Application
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            <p className="text-muted mb-3">
              Are you sure you want to reject{" "}
              <strong className="text-dark">{selectedPharmacist?.pharmacist_name}</strong>'s application?
              This action cannot be undone.
            </p>
            <Form.Group>
              <Form.Label className="fw-semibold">Rejection Reason</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Please provide a detailed reason for rejection..."value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)} className="border-2" />
              <Form.Text className="text-muted">
                This reason will be recorded and may be shared with the applicant.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top-0">
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button  variant="danger" onClick={handleReject} className="d-flex align-items-center">
              <i className="bi bi-x-circle me-1"></i>
              Confirm Rejection
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default NmraAccountRequests;