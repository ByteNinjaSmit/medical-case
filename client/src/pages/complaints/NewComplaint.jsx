import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Stepper, { Step } from '@/components/Stepper';
import axios from 'axios';
import { toast } from 'sonner';

export default function NewComplaint() {
  const { API, authorizationToken } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialPatient = searchParams.get('patient') || '';
  const [form, setForm] = useState({
    patient: initialPatient,
    complaintNo: 1,
    complaintText: '',
    location: '',
    sensation: '',
    concomitants: '',
    severity: '',
    duration: '',
    onset: '',
    aggravation: '',
    amelioration: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(initialPatient ? 2 : 1);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // If navigation provided patient details, prefill selection
  useEffect(() => {
    const statePatient = location?.state?.patient;
    if (statePatient) {
      if (!form.patient) {
        setForm((f) => ({ ...f, patient: statePatient._id }));
      }
      if (!selectedPatient) {
        setSelectedPatient(statePatient);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const apiCreateComplaint = async (payload) => {
    return axios.post(`${API}/api/user/new-complaint`, payload, {
      headers: { Authorization: authorizationToken },
      withCredentials: true,
    });
  };

  const apiGetNextNo = async (patientId) => {
    return axios.get(`${API}/api/user/complaints/next-no/${patientId}`, {
      headers: { Authorization: authorizationToken },
      withCredentials: true,
    });
  };

  const apiSearchPatients = async (query) => {
    return axios.get(`${API}/api/user/patients`, {
      headers: { Authorization: authorizationToken },
      params: { page: 1, limit: 5, search: query },
      withCredentials: true,
    });
  };

  const handleCreate = async () => {
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        patient: form.patient,
        complaintText: form.complaintText,
        location: form.location,
        sensation: form.sensation,
        concomitants: form.concomitants,
        onset: form.onset || undefined,
        aggravation: form.aggravation || undefined,
        amelioration: form.amelioration || undefined,
        severity: form.severity || undefined,
        duration: form.duration || undefined,
      };
      const { data } = await apiCreateComplaint(payload);
      const no = data?.data?.complaintNo;
      toast.success(`Complaint #${no || ''} created successfully`);
      setMessage('Complaint created successfully');
      setForm({ patient: initialPatient || '', complaintNo: data?.data?.complaintNo || 1, complaintText: '', location: '', sensation: '', concomitants: '', severity: '', duration: '', onset: '', aggravation: '', amelioration: '' });
      navigate('/complaints');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create complaint';
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentStepComplete = () => {
    if (currentStep === 1) {
      return form.patient.trim();
    }
    if (currentStep === 2) {
      return (
        form.complaintText.trim() &&
        form.location.trim() &&
        form.sensation.trim() &&
        form.concomitants.trim()
      );
    }
    return true;
  };

  useEffect(() => {
    const run = async () => {
      const pid = form.patient || initialPatient;
      if (!pid) return;
      try {
        const { data } = await apiGetNextNo(pid);
        if (data?.nextComplaintNo) {
          setForm((f) => ({ ...f, complaintNo: data.nextComplaintNo }));
        }
      } catch {}
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.patient]);

  useEffect(() => {
    const search = async () => {
      const q = searchTerm.trim();
      if (q.length < 2) { setPatientResults([]); return; }
      setSearching(true);
      try {
        const { data } = await apiSearchPatients(q);
        setPatientResults(data?.data || []);
      } catch {
        setPatientResults([]);
      } finally {
        setSearching(false);
      }
    };
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-100" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Complaint</h1>
              <p className="text-gray-600 text-sm">Record a new complaint for a patient</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Stepper
          initialStep={initialPatient ? 2 : 1}
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
              ? 'duration-350 flex items-center justify-center rounded-full bg-gray-300 py-1.5 px-3.5 font-medium tracking-tight text-gray-500 cursor-not-allowed'
              : 'duration-350 flex items-center justify-center rounded-full bg-red-800 py-1.5 px-3.5 font-medium tracking-tight text-white transition hover:bg-red-900 active:bg-red-950',
          }}
        >
          <Step>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Select Patient</label>
                <input
                  placeholder="Search by Patient ID, Name or Address"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              {selectedPatient && (
                <div className="text-sm text-slate-700 bg-slate-50 rounded-md p-3 border">
                  <div><strong>Selected:</strong> {selectedPatient?.patientId} - {selectedPatient?.name}</div>
                </div>
              )}
              {searchTerm.length >= 2 && (
                <div className="border rounded-md divide-y">
                  {searching && <div className="p-2 text-sm text-slate-500">Searching...</div>}
                  {!searching && patientResults.length === 0 && (
                    <div className="p-2 text-sm text-slate-500">No patients found</div>
                  )}
                  {patientResults.map((p) => (
                    <button
                      type="button"
                      key={p._id}
                      onClick={() => { setForm((f) => ({ ...f, patient: p._id })); setSelectedPatient(p); setSearchTerm(''); setPatientResults([]); }}
                      className="w-full text-left p-3 hover:bg-gray-50"
                    >
                      <div className="text-sm font-medium text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.patientId}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Step>

          <Step>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Complaint</label>
                <input name="complaintText" value={form.complaintText} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium">Location</label>
                <input name="location" value={form.location} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium">Sensation</label>
                <input name="sensation" value={form.sensation} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Concomitants</label>
                <input name="concomitants" value={form.concomitants} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-4">
              <div className="text-sm text-slate-700 bg-slate-50 rounded-md p-3 border">
                <div><strong>Patient:</strong> {selectedPatient ? `${selectedPatient.patientId} - ${selectedPatient.name}` : (form.patient ? 'Selected' : '-')}</div>
                <div><strong>Complaint:</strong> {form.complaintText || '-'}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Onset</label>
                  <input name="onset" value={form.onset} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Aggravation</label>
                  <input name="aggravation" value={form.aggravation} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Amelioration</label>
                  <input name="amelioration" value={form.amelioration} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Severity</label>
                  <select name="severity" value={form.severity} onChange={handleChange} className="border rounded px-3 py-2 w-full">
                    <option value="">Select</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Very Severe">Very Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Duration</label>
                  <input name="duration" value={form.duration} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
                </div>
              </div>
              {message && (
                <p className={`text-sm ${message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
              )}
              {loading && <p className="text-sm text-slate-500">Saving...</p>}
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}
