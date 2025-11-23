import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RowsPerPageBar from "./RowsPerPageBar";
import { Eye, Plus, FileText, Search, Filter, ChevronDown, ChevronUp, Calendar, User, MapPin } from "lucide-react";
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
  const [showFilters, setShowFilters] = useState(false);

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
    <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sex</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, idx) => (
                <tr key={`sk_${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-10" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                  <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-24 ml-auto" /></td>
                </tr>
              ))
            ) : patients?.length ? (
              patients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.patientId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.sex === 'Male' ? 'bg-blue-50 text-blue-700' :
                        p.sex === 'Female' ? 'bg-pink-50 text-pink-700' :
                          'bg-slate-100 text-slate-700'
                      }`}>
                      {p.sex}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.age}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={p.address}>{p.address || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleView(p)}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddComplaint(p)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                        title="Add Complaint"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/prescriptions/new?patient=${p._id}`)}
                        className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Add Prescription"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-12 text-center text-slate-500" colSpan={7}>
                  <div className="flex flex-col items-center justify-center">
                    <User className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">No patients found</p>
                    <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  ), [loading, patients]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Patients</h1>
                <p className="text-sm text-slate-500 hidden sm:block">Manage your patient records</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/patients/new')}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Patient</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            {showFilters ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          <div className={`p-4 lg:p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-4">
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by ID, name, address..."
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => { setSex(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 flex gap-2">
                <button
                  onClick={() => { setSearch(""); setSex(""); setOrder("desc"); setSortBy("createdAt"); setDateFrom(""); setDateTo(""); setPage(1); }}
                  className="h-10 px-4 w-full bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {pagination?.totalFiltered || 0} results</span>
              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <RowsPerPageBar rowsPerPage={limit} onChange={(v) => { setLimit(v); setPage(1); }} />
        </div>

        {/* Desktop Table */}
        {Table}

        {/* Mobile List View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              </div>
            ))
          ) : patients.length > 0 ? (
            patients.map((p) => (
              <div key={p._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden active:scale-[0.99] transition-transform duration-100">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{p.name}</h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{p.patientId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${p.sex === 'Male' ? 'bg-blue-50 text-blue-700' :
                        p.sex === 'Female' ? 'bg-pink-50 text-pink-700' :
                          'bg-slate-100 text-slate-700'
                      }`}>
                      {p.sex}, {p.age}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{p.address || "No address provided"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Registered {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleView(p)}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleAddComplaint(p)}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={() => navigate(`/prescriptions/new?patient=${p._id}`)}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Rx+
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-900 font-medium">No patients found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === 1
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
            Previous
          </button>

          <span className="text-sm font-medium text-slate-600">
            Page <span className="text-slate-900">{page}</span> of {totalPages || 1}
          </span>

          <button
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page === totalPages || totalPages === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === totalPages || totalPages === 0
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            Next
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
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
