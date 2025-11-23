import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/store/auth";
import axios from "axios";
import RowsPerPageBar from "./RowsPerPageBar";

export default function ComplaintList() {
  const { API } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [order, setOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("createdAt");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/user/complaints`, {
        params: {
          page,
          limit,
          search: search || undefined,
          severity: severity || undefined,
          sortBy,
          order,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
        withCredentials: true,
      });
      const data = res.data;
      setComplaints(data?.data || []);
      setPagination(data?.pagination || null);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, severity, sortBy, order, dateFrom, dateTo]);

  const Table = useMemo(() => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-red-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Complaint No</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Patient</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Complaint</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Severity</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Visit Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-100">
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <tr key={`sk_${idx}`} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-40" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-64" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-24" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-24" /></td>
              </tr>
            ))
          ) : complaints?.length ? (
            complaints.map((c) => (
              <tr key={c._id} className="hover:bg-red-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{c.complaintNo}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                  {c?.patient?.patientId ? `${c.patient.patientId} - ${c.patient.name}` : (c?.patient || '-')}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-md">{c.complaintText}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{c.severity}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(c.visitDate || c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-6 py-8 text-center text-slate-500" colSpan={5}>No complaints found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ), [loading, complaints]);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-red-800 via-red-700 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-xl backdrop-blur-md">
              <div className="w-8 h-8 rounded bg-white/20" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Complaints</h1>
              <p className="text-red-100 mt-1">Review and manage complaints</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
          <div className="p-6 border-b border-red-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Search</label>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search complaint, location, sensation, concomitants"
                  className="w-full h-10 px-3 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
                  className="h-10 px-3 border rounded-md text-sm"
                >
                  <option value="">All</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Very Severe">Very Severe</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="h-10 px-3 border rounded-md text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="h-10 px-3 border rounded-md text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Sort</label>
                <select
                  value={order}
                  onChange={(e) => { setOrder(e.target.value); setPage(1); }}
                  className="h-10 px-3 border rounded-md text-sm"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              <div className="md:col-span-5">
                <button
                  onClick={() => { setSearch(""); setSeverity(""); setOrder("desc"); setSortBy("createdAt"); setDateFrom(""); setDateTo(""); setPage(1); }}
                  className="h-10 bg-gray-100 border border-gray-300 text-slate-700 rounded-md px-4 hover:bg-gray-200"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">Total: {pagination?.total || 0} | Filtered: {pagination?.totalFiltered || 0}</div>
            {error && (
              <div className="mt-2 text-sm text-red-600">{error}</div>
            )}
          </div>

          <RowsPerPageBar rowsPerPage={limit} onChange={(v) => { setLimit(v); setPage(1); }} />

          {Table}

          <div className="flex items-center justify-end p-4 border-t border-red-100 text-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md ${page === 1 ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}
              >
                Previous
              </button>
              <span className="text-slate-700">Page {page} of {totalPages || 1}</span>
              <button
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                disabled={page === totalPages || totalPages === 0}
                className={`px-3 py-1 rounded-md ${page === totalPages || totalPages === 0 ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}
              >
                Next
              </button>
            </div>
          </div>

          <div className="md:hidden divide-y divide-red-100">
            {complaints.map((c) => (
              <div key={c._id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800">{c.complaintText}</div>
                  <span className="text-xs text-slate-600">#{c.complaintNo}</span>
                </div>
                <div className="text-sm text-slate-600">
                  <div><strong>Patient:</strong> {c?.patient?.patientId ? `${c.patient.patientId} - ${c.patient.name}` : (c?.patient || '-')}</div>
                  <div><strong>Severity:</strong> {c.severity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
