import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, FileText, Activity, Database } from "lucide-react";

const AnalyticsDashboard = () => {
  const { API } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    patients: {
      total: 0,
      new7d: 0,
      bySex: {},
      byAgeGroup: {},
    },
    complaints: {
      total: 0,
      new7d: 0,
      bySeverity: {},
    },
    summary: {
      activePatients: 0,
      avgComplaintsPerActive: 0,
    },
  });

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    sex: "",
    severity: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  useEffect(() => {
    if (!API) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const paramsPatients = {
          page: 1,
          limit: 200,
          sortBy: "createdAt",
          order: "desc",
          dateFrom: appliedFilters.dateFrom || undefined,
          dateTo: appliedFilters.dateTo || undefined,
          sex: appliedFilters.sex || undefined,
        };

        const paramsComplaints = {
          page: 1,
          limit: 200,
          sortBy: "createdAt",
          order: "desc",
          dateFrom: appliedFilters.dateFrom || undefined,
          dateTo: appliedFilters.dateTo || undefined,
          severity: appliedFilters.severity || undefined,
        };

        const [patientsRes, complaintsRes] = await Promise.all([
          axios.get(`${API}/api/user/patients`, {
            params: paramsPatients,
            withCredentials: true,
          }),
          axios.get(`${API}/api/user/complaints`, {
            params: paramsComplaints,
            withCredentials: true,
          }),
        ]);

        if (cancelled) return;

        const patientsPayload = patientsRes.data;
        const complaintsPayload = complaintsRes.data;

        const patients = Array.isArray(patientsPayload?.data) ? patientsPayload.data : [];
        const complaints = Array.isArray(complaintsPayload?.data) ? complaintsPayload.data : [];

        const patientsBySex = patients.reduce((acc, p) => {
          const key = (p.sex || "Unknown").trim() || "Unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const patientsByAgeGroup = patients.reduce(
          (acc, p) => {
            const ageNum = typeof p.age === "number" ? p.age : Number(p.age);
            if (!ageNum && ageNum !== 0) {
              acc["Unknown"] += 1;
            } else if (ageNum < 18) {
              acc["0-17"] += 1;
            } else if (ageNum <= 60) {
              acc["18-60"] += 1;
            } else {
              acc["60+"] += 1;
            }
            return acc;
          },
          {
            "0-17": 0,
            "18-60": 0,
            "60+": 0,
            Unknown: 0,
          }
        );

        const complaintsBySeverity = complaints.reduce(
          (acc, c) => {
            const key = (c.severity || "Unspecified").trim() || "Unspecified";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          },
          {}
        );

        const patientsLast7 = patients.filter((p) => {
          if (!p.createdAt) return false;
          const created = new Date(p.createdAt);
          return created >= sevenDaysAgo;
        });

        const complaintsLast7 = complaints.filter((c) => {
          if (!c.createdAt) return false;
          const created = new Date(c.createdAt);
          return created >= sevenDaysAgo;
        });

        const activePatientIds = new Set();
        complaints.forEach((c) => {
          const pid =
            (c.patient && (c.patient._id || c.patient.patientId || c.patient)) ||
            c.patient ||
            null;
          if (pid) activePatientIds.add(pid);
        });

        const activePatients = activePatientIds.size;
        const avgComplaintsPerActive = activePatients
          ? Number((complaints.length / activePatients).toFixed(1))
          : 0;

        setStats({
          patients: {
            total:
              patientsPayload?.pagination?.totalFiltered ??
              patientsPayload?.pagination?.total ??
              patients.length,
            new7d: patientsLast7.length,
            bySex: patientsBySex,
            byAgeGroup: patientsByAgeGroup,
          },
          complaints: {
            total:
              complaintsPayload?.pagination?.totalFiltered ??
              complaintsPayload?.pagination?.total ??
              complaints.length,
            new7d: complaintsLast7.length,
            bySeverity: complaintsBySeverity,
          },
          summary: {
            activePatients,
            avgComplaintsPerActive,
          },
        });
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e.message || "Failed to load analytics");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [API, appliedFilters]);

  const sexEntries = Object.entries(stats.patients.bySex || {});
  const ageEntries = Object.entries(stats.patients.byAgeGroup || {});
  const severityEntries = Object.entries(stats.complaints.bySeverity || {});

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Business Intelligence</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              High level overview of patients and complaints to understand your clinical workload.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-700" />
              <span className="text-xs sm:text-sm font-medium text-slate-800">Filters</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilters({ dateFrom: "", dateTo: "", sex: "", severity: "" });
                  setAppliedFilters({ dateFrom: "", dateTo: "", sex: "", severity: "" });
                }}
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setAppliedFilters(filters)}
                className="px-3 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-medium hover:bg-red-700"
              >
                Apply
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase tracking-wide">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase tracking-wide">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase tracking-wide">Patient Sex</label>
              <select
                value={filters.sex}
                onChange={(e) => setFilters((f) => ({ ...f, sex: e.target.value }))}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase tracking-wide">Complaint Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">All</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Very Severe">Very Severe</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-xs sm:text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border-orange-100 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Total Patients</span>
                <Users className="w-4 h-4 text-orange-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-800">
                {loading ? "..." : stats.patients.total}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                New last 7 days: <span className="font-semibold">{loading ? "..." : stats.patients.new7d}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-100 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Total Complaints</span>
                <FileText className="w-4 h-4 text-blue-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-800">
                {loading ? "..." : stats.complaints.total}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                New last 7 days: <span className="font-semibold">{loading ? "..." : stats.complaints.new7d}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-emerald-100 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Data Sample</span>
                <Database className="w-4 h-4 text-emerald-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">
                Analytics are based on the most recent sample of patients and complaints. Use this view to spot
                trends, not for exact reporting totals.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-violet-100 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Case Load KPIs</span>
                <Activity className="w-4 h-4 text-violet-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-1">Active patients with complaints</p>
              <p className="text-xl font-bold text-slate-900 mb-2">
                {loading ? "..." : stats.summary.activePatients}
              </p>
              <p className="text-xs text-slate-600 mb-1">Average complaints per active patient</p>
              <p className="text-xl font-bold text-slate-900">
                {loading ? "..." : stats.summary.avgComplaintsPerActive}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm bg-white/95 border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-slate-700" />
                Patients by Sex
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && <p className="text-xs text-slate-500">Loading...</p>}
              {!loading && sexEntries.length === 0 && (
                <p className="text-xs text-slate-500">No patient data available.</p>
              )}
              {!loading &&
                sexEntries.map(([label, value]) => {
                  const total =
                    sexEntries.reduce((sum, [, v]) => {
                      const numeric = typeof v === "number" ? v : Number(v) || 0;
                      return sum + numeric;
                    }, 0) || 1;
                  const numericValue = typeof value === "number" ? value : Number(value) || 0;
                  const percent = Math.round((numericValue / total) * 100);
                  return (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-red-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-slate-600 min-w-14 text-right">
                          {numericValue} ({percent}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-white/95 border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-slate-700" />
                Patients by Age Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && <p className="text-xs text-slate-500">Loading...</p>}
              {!loading && ageEntries.length === 0 && (
                <p className="text-xs text-slate-500">No patient data available.</p>
              )}
              {!loading &&
                ageEntries.map(([label, value]) => {
                  const total =
                    ageEntries.reduce((sum, [, v]) => {
                      const numeric = typeof v === "number" ? v : Number(v) || 0;
                      return sum + numeric;
                    }, 0) || 1;
                  const numericValue = typeof value === "number" ? value : Number(value) || 0;
                  const percent = Math.round((numericValue / total) * 100);
                  return (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-red-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-slate-600 min-w-14 text-right">
                          {numericValue} ({percent}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm bg-white/95 border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-slate-700" />
              Complaints by Severity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <p className="text-xs text-slate-500">Loading...</p>}
            {!loading && severityEntries.length === 0 && (
              <p className="text-xs text-slate-500">No complaint data available.</p>
            )}
            {!loading &&
              severityEntries.map(([label, value]) => {
                const total =
                  severityEntries.reduce((sum, [, v]) => {
                    const numeric = typeof v === "number" ? v : Number(v) || 0;
                    return sum + numeric;
                  }, 0) || 1;
                const numericValue = typeof value === "number" ? value : Number(value) || 0;
                const percent = Math.round((numericValue / total) * 100);
                return (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-red-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-slate-600 min-w-14 text-right">
                        {numericValue} ({percent}%)
                      </span>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
