import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';

export default function PatientList() {
  const { API, authorizationToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/user/patients`, {
          headers: { Authorization: authorizationToken },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to fetch patients');
        setPatients(data.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API, authorizationToken]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Patient List</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2 border">Patient ID</th>
                <th className="text-left px-3 py-2 border">Name</th>
                <th className="text-left px-3 py-2 border">Age</th>
                <th className="text-left px-3 py-2 border">Sex</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border">{p.patientId}</td>
                  <td className="px-3 py-2 border">{p.name}</td>
                  <td className="px-3 py-2 border">{p.age}</td>
                  <td className="px-3 py-2 border">{p.sex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
