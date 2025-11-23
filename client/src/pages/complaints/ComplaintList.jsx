import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/store/auth";
import axios from "axios";
import RowsPerPageBar from "./RowsPerPageBar";
import { Search, Filter, ChevronDown, ChevronUp, Activity, Calendar, User, AlertCircle } from "lucide-react";

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
  const [showFilters, setShowFilters] = useState(false);

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

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Mild': return 'bg-green-50 text-green-700 border-green-100';
      case 'Moderate': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Severe': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Very Severe': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const Table = useMemo(() => (
    <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint No</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visit Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, idx) => (
                <tr key={`sk_${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-64" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                </tr>
              ))
            ) : complaints?.length ? (
              complaints.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">#{c.complaintNo}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {c?.patient?.patientId ? `${c.patient.name}` : (c?.patient || '-')}
                    <div className="text-xs text-slate-500 font-normal">{c?.patient?.patientId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate" title={c.complaintText}>{c.complaintText}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(c.severity)}`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(c.visitDate || c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-12 text-center text-slate-500" colSpan={5}>
                  <div className="flex flex-col items-center justify-center">
                    <Activity className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">No complaints found</p>
                    <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  ), [loading, complaints]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Complaints</h1>
              <p className="text-sm text-slate-500 hidden sm:block">Review and manage patient complaints</p>
            </div>
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
                    placeholder="Search complaint, location..."
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none"
                >
                  <option value="">All Severities</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Very Severe">Very Severe</option>
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
                  onClick={() => { setSearch(""); setSeverity(""); setOrder("desc"); setSortBy("createdAt"); setDateFrom(""); setDateTo(""); setPage(1); }}
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
          ) : complaints.length > 0 ? (
            complaints.map((c) => (
              <div key={c._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden active:scale-[0.99] transition-transform duration-100">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{c.complaintText}</h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">#{c.complaintNo}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(c.severity)}`}>
                      {c.severity}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {c?.patient?.patientId ? `${c.patient.name}` : (c?.patient || '-')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{new Date(c.visitDate || c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-900 font-medium">No complaints found</p>
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
    </div>
  );
}
