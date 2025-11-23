import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RowsPerPageBar from "./RowsPerPageBar";
import { Eye } from "lucide-react";
import CustomModal from "@/components/CustomModal";
import PatientDetailsView from "@/components/PatientDetailsView";

export default function PatientList() {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [search, setSearch] = useState("");
  const [sex, setSex] = useState("");
  const [order, setOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("createdAt");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewPatient, setViewPatient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/user/patients`, {
        params: {
          page,
          limit,
          search: search || undefined,
          sex: sex || undefined,
          sortBy,
          order,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
        withCredentials: true,
      });
      const data = res.data;
      setPatients(data?.data || []);
      setPagination(data?.pagination || null);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, sex, sortBy, order, dateFrom, dateTo]);

  const handleAddComplaint = (patient) => {
    navigate(`/complaints/new?patient=${patient._id}`, { state: { patient } });
  };

  const handleView = (p) => {
    setViewPatient(p);
    setShowViewModal(true);
  };

  const Table = useMemo(() => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-red-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Patient ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Sex</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Age</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Address</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Created</th>
            <th className="px-6 py-4 text-middle text-sm font-semibold text-slate-800">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-100">
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <tr key={`sk_${idx}`} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-28" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-40" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-16" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-10" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-48" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-red-100 rounded w-24" /></td>
                <td className="px-6 py-4"><div className="h-8 bg-red-100 rounded w-24" /></td>
              </tr>
            ))
          ) : patients?.length ? (
            patients.map((p) => (
              <tr key={p._id} className="hover:bg-red-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{p.patientId}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.sex}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.age}</td>
                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{p.address || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(p)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAddComplaint(p)}
                      className="h-8 px-3 rounded-md text-xs bg-red-600 text-white hover:bg-red-700"
                    >
                      Add Complaint
                    </button>
                    <button
                      onClick={() => navigate(`/prescriptions?patient=${p._id}`)}
                      className="h-8 px-3 rounded-md text-xs bg-slate-800 text-white hover:bg-slate-900"
                    >
                      Prescriptions
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-6 py-8 text-center text-slate-500" colSpan={7}>No patients found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ), [loading, patients]);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-red-800 via-red-700 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-xl backdrop-blur-md">
              <div className="w-8 h-8 rounded bg-white/20" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Patients</h1>
              <p className="text-red-100 mt-1">Manage patient records</p>
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
                  placeholder="Search by patient ID, name, address"
                  className="w-full h-10 px-3 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => { setSex(e.target.value); setPage(1); }}
                  className="h-10 px-3 border rounded-md text-sm"
                >
                  <option value="">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer Not To Say">Prefer Not To Say</option>
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
                  onClick={() => { setSearch(""); setSex(""); setOrder("desc"); setSortBy("createdAt"); setDateFrom(""); setDateTo(""); setPage(1); }}
                  className="h-10 bg-gray-100 border border-gray-300 text-slate-700 rounded-md px-4 hover:bg-gray-200"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">Total: {pagination?.total || 0} | Filtered: {pagination?.totalFiltered || 0}</div>
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
            {patients.map((p) => (
              <div key={p._id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800">{p.name}</div>
                  <span className="text-xs text-slate-600">{p.patientId}</span>
                </div>
                <div className="text-sm text-slate-600">
                  <div><strong>Sex:</strong> {p.sex} &nbsp; <strong>Age:</strong> {p.age}</div>
                  <div className="truncate"><strong>Address:</strong> {p.address || "-"}</div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => handleAddComplaint(p)} className="flex-1 bg-red-600 text-white rounded-md py-2 text-sm hover:bg-red-700">Add Complaint</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showViewModal && (
        <CustomModal
          open={showViewModal}
          title="Patient Details"
          description={viewPatient ? `${viewPatient.patientId} - ${viewPatient.name}` : ''}
          confirmText="New Complaint"
          cancelText="Close"
          onConfirm={() => { setShowViewModal(false); navigate(`/complaints/new?patient=${viewPatient?._id}`, { state: { patient: viewPatient } }); }}
          onCancel={() => { setShowViewModal(false); setViewPatient(null); }}
          confirmVariant="primary"
          size="lg"
        >
          {viewPatient && (
            <PatientDetailsView patient={viewPatient} />
          )}
        </CustomModal>
      )}
    </div>
  );
}
