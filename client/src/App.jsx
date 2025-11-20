import { useState } from 'react'
import './App.css'
import { Route, Routes, useLocation } from "react-router-dom"
import BloodBankDoctorLoginPage from './pages/login/Login';
import MasterLayout from './components/layout/Master-Layout';
import { AuthenticatedRoute } from './components/layout/Authentic-Routes';
import Home from './pages/Home';
import PatientList from './pages/patients/PatientList';
import NewPatient from './pages/patients/NewPatient';
import ComplaintList from './pages/complaints/ComplaintList';
import NewComplaint from './pages/complaints/NewComplaint';


const App = () => {
  const pathname = useLocation().pathname;

  return (
    <div>

       <Routes>
        <Route path="/login" element={<BloodBankDoctorLoginPage />} />
        <Route
          path="/"
          element={
            <AuthenticatedRoute>
              <MasterLayout />
            </AuthenticatedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/new" element={<NewPatient />} />
          <Route path="complaints" element={<ComplaintList />} />
          <Route path="complaints/new" element={<NewComplaint />} />
        </Route>
       </Routes>



    </div>
  )
}

export default App
