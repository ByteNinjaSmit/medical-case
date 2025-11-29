import { useState } from 'react'
import './App.css'
import { Route, Routes, useLocation } from "react-router-dom"
import DoctorLoginPage from './pages/login/Login';
import MasterLayout from './components/layout/Master-Layout';
import { AuthenticatedRoute } from './components/layout/Authentic-Routes';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/patients/PatientList';
import NewPatient from './pages/patients/NewPatient';
import ComplaintList from './pages/complaints/ComplaintList';
import NewComplaint from './pages/complaints/NewComplaint';
import NotFound from './pages/Error-Page';
import PrescriptionList from './pages/prescriptions/PrescriptionList';
import NewPrescription from './pages/prescriptions/NewPrescription';
import PatientCase from './pages/patients/PatientCase';
import Reports from './pages/Reports';
import ScrollToTop from './components/layout/ScrollToTop';


const App = () => {
  const pathname = useLocation().pathname;

  return (
    <div>
<ScrollToTop />
      <Routes>
        <Route path="/login" element={<DoctorLoginPage />} />
        <Route
          path="/"
          element={
            <AuthenticatedRoute>
              <MasterLayout />
            </AuthenticatedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/new" element={<NewPatient />} />
          <Route path="patients/:patientId/case" element={<PatientCase />} />
          <Route path="complaints" element={<ComplaintList />} />
          <Route path="complaints/new" element={<NewComplaint />} />
          <Route path="prescriptions" element={<PrescriptionList />} />
          <Route path="prescriptions/new" element={<NewPrescription />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>



    </div>
  )
}

export default App
