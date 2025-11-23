import React, { useState } from 'react';
import { useAuth } from '@/store/auth';

import Stepper, { Step } from '@/components/Stepper';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomModal from '@/components/CustomModal';

export default function NewPatient() {
  const { API } = useAuth();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedPatient, setSavedPatient] = useState(null);

  const [form, setForm] = useState({
    patientId: '',
    name: '',
    age: '',
    sex: 'Male',
    mobileNo: '',
    address: '',
    referredBy: '',
    maritalStatus: 'Not Disclosed',
    diet: 'OTHER',
    education: 'Other',
    occupation: 'Other',
    summary: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const isCurrentStepComplete = () => {
    if (currentStep === 1) {
      return (
        form.patientId.trim() &&
        form.name.trim() &&
        String(form.age).trim() &&
        form.sex.trim()
      );
    }
    // Other steps contain optional fields, allow proceeding
    return true;
  };

  const apiCreatePatient = async (payload) =>
    axios.post(`${API}/api/user/new-patient`, payload, {
      withCredentials: true,
    });

  const handleCreate = async () => {
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        patientId: form.patientId,
        name: form.name,
        age: Number(form.age),
        sex: form.sex,
        mobileNo: form.mobileNo || undefined,
        address: form.address || undefined,
        referredBy: form.referredBy || undefined,
        maritalStatus: form.maritalStatus || undefined,
        diet: form.diet || undefined,
        education: form.education || undefined,
        occupation: form.occupation || undefined,
        summary: form.summary || undefined,
      };
      const { data } = await apiCreatePatient(payload);
      setMessage('Patient created successfully');
      setSavedPatient(data?.data || null);
      setShowSuccess(true);
      setForm({
        patientId: '', name: '', age: '', sex: 'Male', mobileNo: '', address: '', referredBy: '', maritalStatus: 'Not Disclosed', diet: 'OTHER', education: 'Other', occupation: 'Other', summary: '',
      });
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-100" />
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">New Patient</h1>
              <p className="text-gray-600 text-sm">Register a new patient</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Stepper
          initialStep={1}
          onFinalStepCompleted={handleCreate}
          onStepChange={(s) => setCurrentStep(s)}
          stepContainerClassName="overflow-x-auto"
          disableStepIndicators
          stepCircleContainerClassName="bg-white"
          contentClassName="bg-white rounded-xl shadow border border-gray-100"
          footerClassName="bg-white rounded-b-xl"
          nextButtonProps={{
            disabled: !isCurrentStepComplete(),
            className: !isCurrentStepComplete()
              ? "duration-350 flex items-center justify-center rounded-full bg-gray-300 py-2 px-6 font-semibold text-gray-500 cursor-not-allowed"
              : "duration-350 flex items-center justify-center rounded-full bg-red-600 py-2 px-6 font-semibold text-white transition hover:bg-red-700 active:bg-red-800",
          }}
        >
          <Step>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient ID <span className="text-red-600">*</span></label>
                <input name="patientId" value={form.patientId} onChange={handleChange} required className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-600">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} required className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age <span className="text-red-600">*</span></label>
                <input name="age" type="number" value={form.age} onChange={handleChange} required className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sex <span className="text-red-600">*</span></label>
                <select name="sex" value={form.sex} onChange={handleChange} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer Not To Say</option>
                </select>
              </div>
            </div>
          </Step>

          <Step>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile No</label>
                <input name="mobileNo" value={form.mobileNo} onChange={handleChange} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Referred By</label>
                <input name="referredBy" value={form.referredBy} onChange={handleChange} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
          </Step>

          <Step>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500">
                  <option>Single</option>
                  <option>Married</option>
                  <option>Widowed</option>
                  <option>Divorced</option>
                  <option>Separated</option>
                  <option>Not Disclosed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diet</label>
                <select name="diet" value={form.diet} onChange={handleChange} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500">
                  <option value="VEG">VEG</option>
                  <option value="NON_VEG">NON_VEG</option>
                  <option value="EGG">EGG</option>
                  <option value="VEGAN">VEGAN</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Education</label>
                <select name="education" value={form.education} onChange={handleChange} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500">
                  <option>None</option>
                  <option>Primary</option>
                  <option>Secondary</option>
                  <option>High School</option>
                  <option>Graduate</option>
                  <option>Post Graduate</option>
                  <option>Doctorate</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Occupation</label>
                <select name="occupation" value={form.occupation} onChange={handleChange} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500">
                  <option>Unemployed</option>
                  <option>Student</option>
                  <option>Self Employed</option>
                  <option>Private Job</option>
                  <option>Government Job</option>
                  <option>Retired</option>
                  <option>Homemaker</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <textarea name="summary" value={form.summary} onChange={handleChange} rows={4} className="border rounded-lg px-4 py-3 w-full shadow-sm focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="text-sm text-slate-600 bg-slate-50 rounded-md p-3 border">
                <div><strong>Patient ID:</strong> {form.patientId || '-'} </div>
                <div><strong>Name:</strong> {form.name || '-'} </div>
                <div><strong>Age/Sex:</strong> {form.age || '-'} / {form.sex || '-'} </div>
                <div><strong>Mobile:</strong> {form.mobileNo || '-'} </div>
                <div><strong>Address:</strong> {form.address || '-'} </div>
              </div>
              {message && <p className={`text-sm ${message?.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
              {loading && <p className="text-sm text-slate-500">Saving...</p>}
            </div>
          </Step>
        </Stepper>
      </div>

      {showSuccess && (
        <CustomModal
          open={showSuccess}
          title="Patient registered successfully"
          description={savedPatient ? `${savedPatient.patientId} - ${savedPatient.name}` : "Registration completed"}
          onCancel={() => setShowSuccess(false)}
          hideFooter
          size="md"
        >
          <div className="space-y-3">
            <button
              onClick={() => { setShowSuccess(false); navigate('/patients'); }}
              className="w-full px-4 py-2 rounded-lg bg-red-800 text-white hover:bg-red-900"
            >
              Go to Patient List
            </button>
            {savedPatient?._id && (
              <button
                onClick={() => { setShowSuccess(false); navigate(`/complaints/new?patient=${savedPatient._id}`); }}
                className="w-full px-4 py-2 rounded-lg border border-red-200 text-red-800 hover:bg-red-50"
              >
                Add Complaint for this Patient
              </button>
            )}
            <button
              onClick={() => { setShowSuccess(false); navigate('/patients/new'); }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Register Another Patient
            </button>
          </div>
        </CustomModal>
      )}
    </div>
  );
}