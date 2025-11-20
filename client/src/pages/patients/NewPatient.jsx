import React, { useState } from 'react';
import { useAuth } from '@/store/auth';

export default function NewPatient() {
  const { API, authorizationToken } = useAuth();
  const [form, setForm] = useState({ patientId: '', name: '', age: '', sex: 'Male' });
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
      const res = await fetch(`${API}/api/user/new-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authorizationToken },
        body: JSON.stringify({
          patientId: form.patientId,
          name: form.name,
          age: Number(form.age),
          sex: form.sex,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create patient');
      setMessage('Patient created successfully');
      setForm({ patientId: '', name: '', age: '', sex: 'Male' });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">New Patient</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Patient ID</label>
          <input name="patientId" value={form.patientId} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Sex</label>
          <select name="sex" value={form.sex} onChange={handleChange} className="border rounded px-3 py-2 w-full">
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer Not To Say</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Saving...' : 'Create Patient'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
