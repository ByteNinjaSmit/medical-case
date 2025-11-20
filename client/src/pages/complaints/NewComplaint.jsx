import React, { useState } from 'react';
import { useAuth } from '@/store/auth';

export default function NewComplaint() {
  const { API, authorizationToken } = useAuth();
  const [form, setForm] = useState({
    patient: '',
    complaintNo: 1,
    complaintText: '',
    severity: '',
    duration: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/api/user/new-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authorizationToken },
        body: JSON.stringify({
          patient: form.patient,
          complaintNo: Number(form.complaintNo),
          complaintText: form.complaintText,
          severity: form.severity,
          duration: form.duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create complaint');
      setMessage('Complaint created successfully');
      setForm({ patient: '', complaintNo: 1, complaintText: '', severity: '', duration: '' });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">New Complaint</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Patient ID (ObjectId)</label>
          <input name="patient" value={form.patient} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Complaint No</label>
          <input name="complaintNo" type="number" value={form.complaintNo} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Complaint</label>
          <input name="complaintText" value={form.complaintText} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Severity</label>
          <input name="severity" value={form.severity} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Duration</label>
          <input name="duration" value={form.duration} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Saving...' : 'Create Complaint'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
