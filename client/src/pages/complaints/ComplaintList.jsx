import React, { useState } from 'react';
import { useAuth } from '@/store/auth';

export default function ComplaintList() {
  const { API, authorizationToken } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaints = async (e) => {
    e?.preventDefault();
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/user/complaint/${patientId}`, {
        headers: { Authorization: authorizationToken },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch complaints');
      setComplaints(data.data || []);
    } catch (e) {
      setError(e.message);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Complaint List</h2>
      <form onSubmit={fetchComplaints} className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Enter Patient ObjectId"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && complaints.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2 border">No</th>
                <th className="text-left px-3 py-2 border">Complaint</th>
                <th className="text-left px-3 py-2 border">Severity</th>
                <th className="text-left px-3 py-2 border">Duration</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border">{c.complaintNo}</td>
                  <td className="px-3 py-2 border">{c.complaintText}</td>
                  <td className="px-3 py-2 border">{c.severity}</td>
                  <td className="px-3 py-2 border">{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
