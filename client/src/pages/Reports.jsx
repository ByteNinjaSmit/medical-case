import React, { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, FileText, Pill, Calendar, Microscope, Download,
  Filter, TrendingUp, BarChart3, Search, User, Clock,
  Activity, CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Reports = () => {
  const { API } = useAuth();
  const [activeTab, setActiveTab] = useState("patients");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Patient-wise report
  const [patientSearch, setPatientSearch] = useState("");
  const [patientList, setPatientList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientReport, setPatientReport] = useState(null);
  const [loadingPatientReport, setLoadingPatientReport] = useState(false);

  useEffect(() => {
    if (activeTab !== "patient-wise") {
      fetchReportData();
    }
  }, [activeTab, startDate, endDate]);

  useEffect(() => {
    if (activeTab === "patient-wise") {
      fetchPatientList();
    }
  }, [activeTab, patientSearch]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`${API}/api/reports/${activeTab}`, {
        params,
        withCredentials: true,
      });
      setData(res.data.data);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientList = async () => {
    try {
      const res = await axios.get(`${API}/api/user/patients`, {
        params: {
          search: patientSearch || undefined,
          limit: 10,
        },
        withCredentials: true,
      });
      setPatientList(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  const fetchPatientReport = async (patientId) => {
    setLoadingPatientReport(true);
    try {
      const res = await axios.get(`${API}/api/reports/patient/${patientId}`, {
        withCredentials: true,
      });
      setPatientReport(res.data.data);
    } catch (error) {
      console.error("Failed to fetch patient report:", error);
    } finally {
      setLoadingPatientReport(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientReport(patient._id);
  };

  const StatBox = ({ label, value, color = "bg-blue-500", icon: Icon }) => (
    <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <p className="text-3xl font-bold text-slate-900">{loading ? "..." : value || 0}</p>
      <div className={`h-1.5 w-16 ${color} rounded-full mt-3`} />
    </div>
  );

  const BarItem = ({ label, value, total, color = "bg-blue-500" }) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700 truncate flex-1">{label}</span>
          <span className="text-slate-500 ml-2 font-semibold">{value} <span className="text-xs">({percentage}%)</span></span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-3 rounded-full ${color}`}
          />
        </div>
      </div>
    );
  };

  const TimelineItem = ({ event }) => {
    const typeColors = {
      registration: "bg-blue-500",
      complaint: "bg-red-500",
      prescription: "bg-emerald-500",
      followup: "bg-amber-500",
      investigation: "bg-purple-500",
    };

    const typeIcons = {
      registration: User,
      complaint: Activity,
      prescription: Pill,
      followup: Calendar,
      investigation: Microscope,
    };

    const Icon = typeIcons[event.type] || Activity;
    const color = typeColors[event.type] || "bg-slate-500";

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-4 pb-6 last:pb-0"
      >
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white shadow-lg`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="w-0.5 h-full bg-slate-200 mt-2" />
        </div>
        <div className="flex-1 pb-4">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-slate-900">{event.title}</h4>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(event.date).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-slate-600">{event.description}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                Reports & Analytics
              </h1>
              <p className="text-sm text-slate-500 mt-2">Comprehensive insights into your clinic data</p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-slate-50"
              onClick={() => alert("Export functionality coming soon!")}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        {activeTab !== "patient-wise" && (
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-base">Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Label className="text-xs mb-1.5 block font-semibold text-slate-600">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label className="text-xs mb-1.5 block font-semibold text-slate-600">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="md:col-span-2 flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setStartDate(""); setEndDate(""); }}
                    className="h-10 flex-1 text-sm"
                  >
                    Reset Filters
                  </Button>
                  <Button
                    onClick={fetchReportData}
                    className="h-10 flex-1 text-sm bg-indigo-600 hover:bg-indigo-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm mb-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-0 bg-transparent gap-2 no-scrollbar">
              {[
                { val: "patients", icon: Users, label: "Patients" },
                { val: "complaints", icon: FileText, label: "Complaints" },
                { val: "prescriptions", icon: Pill, label: "Prescriptions" },
                { val: "followups", icon: Calendar, label: "Follow-ups" },
                { val: "investigations", icon: Microscope, label: "Investigations" },
                { val: "patient-wise", icon: User, label: "Patient Report" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.val}
                  value={tab.val}
                  className="flex-shrink-0 gap-2 text-sm font-medium px-4 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Patient Analytics */}
          <TabsContent value="patients" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox label="Total Patients" value={data?.totalCount} color="bg-blue-500" icon={Users} />
                <StatBox label="Male" value={data?.demographics?.gender?.find(g => g._id === "Male")?.count} color="bg-blue-400" icon={Users} />
                <StatBox label="Female" value={data?.demographics?.gender?.find(g => g._id === "Female")?.count} color="bg-pink-400" icon={Users} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Gender Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {loading ? (
                      <div className="h-32 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                      </div>
                    ) : data?.demographics?.gender?.length > 0 ? (
                      data.demographics.gender.map((item) => {
                        const total = data.demographics.gender.reduce((sum, g) => sum + g.count, 0);
                        const colors = { Male: "bg-blue-500", Female: "bg-pink-500", Other: "bg-purple-500" };
                        return (
                          <BarItem
                            key={item._id}
                            label={item._id}
                            value={item.count}
                            total={total}
                            color={colors[item._id] || "bg-slate-400"}
                          />
                        );
                      })
                    ) : (
                      <p className="text-center text-slate-500 text-sm py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Marital Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {loading ? (
                      <div className="h-32 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                      </div>
                    ) : data?.demographics?.maritalStatus?.length > 0 ? (
                      data.demographics.maritalStatus.map((item, idx) => {
                        const total = data.demographics.maritalStatus.reduce((sum, m) => sum + m.count, 0);
                        const colors = ["bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];
                        return (
                          <BarItem
                            key={item._id}
                            label={item._id}
                            value={item.count}
                            total={total}
                            color={colors[idx % colors.length]}
                          />
                        );
                      })
                    ) : (
                      <p className="text-center text-slate-500 text-sm py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Complaint Analytics */}
          <TabsContent value="complaints" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox label="Total Complaints" value={data?.totalComplaints} color="bg-red-500" icon={FileText} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      Top Complaint Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {loading ? (
                      <div className="h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                      </div>
                    ) : data?.breakdown?.byType?.length > 0 ? (
                      data.breakdown.byType.slice(0, 8).map((item) => {
                        const total = data.breakdown.byType.reduce((sum, t) => sum + t.count, 0);
                        return (
                          <BarItem
                            key={item._id}
                            label={item._id || "Unspecified"}
                            value={item.count}
                            total={total}
                            color="bg-red-500"
                          />
                        );
                      })
                    ) : (
                      <p className="text-center text-slate-500 text-sm py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      By Severity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {loading ? (
                      <div className="h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                      </div>
                    ) : data?.breakdown?.bySeverity?.length > 0 ? (
                      data.breakdown.bySeverity.map((item) => {
                        const total = data.breakdown.bySeverity.reduce((sum, s) => sum + s.count, 0);
                        const colors = { Mild: "bg-green-500", Moderate: "bg-amber-500", Severe: "bg-red-500" };
                        return (
                          <BarItem
                            key={item._id}
                            label={item._id || "Unspecified"}
                            value={item.count}
                            total={total}
                            color={colors[item._id] || "bg-slate-400"}
                          />
                        );
                      })
                    ) : (
                      <p className="text-center text-slate-500 text-sm py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Prescription Analytics */}
          <TabsContent value="prescriptions" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox label="Total Prescriptions" value={data?.totalPrescriptions} color="bg-emerald-500" icon={Pill} />
                <StatBox
                  label="Avg Medicines/Rx"
                  value={data?.averageMedicinesPerPrescription?.toFixed(1)}
                  color="bg-emerald-400"
                  icon={Pill}
                />
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="w-5 h-5 text-emerald-600" />
                    Most Prescribed Medicines
                  </CardTitle>
                  <CardDescription>Top 15 medicines by prescription frequency</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : data?.topMedicines?.length > 0 ? (
                    data.topMedicines.map((item) => {
                      const total = data.topMedicines.reduce((sum, m) => sum + m.count, 0);
                      return (
                        <BarItem
                          key={item._id}
                          label={item._id}
                          value={item.count}
                          total={total}
                          color="bg-emerald-500"
                        />
                      );
                    })
                  ) : (
                    <p className="text-center text-slate-500 text-sm py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Follow-up Analytics */}
          <TabsContent value="followups" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox label="Total Follow-ups" value={data?.totalFollowUps} color="bg-amber-500" icon={Calendar} />
                <StatBox label="Upcoming" value={data?.upcomingFollowUps} color="bg-blue-500" icon={Calendar} />
                <StatBox label="Overdue" value={data?.overdueFollowUps} color="bg-red-500" icon={AlertCircle} />
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-600" />
                    Patient State Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {loading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : data?.patientStateDistribution?.length > 0 ? (
                    data.patientStateDistribution.map((item, idx) => {
                      const total = data.patientStateDistribution.reduce((sum, s) => sum + s.count, 0);
                      const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-red-500"];
                      return (
                        <BarItem
                          key={item._id}
                          label={item._id}
                          value={item.count}
                          total={total}
                          color={colors[idx % colors.length]}
                        />
                      );
                    })
                  ) : (
                    <p className="text-center text-slate-500 text-sm py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investigation Analytics */}
          <TabsContent value="investigations" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox label="Total Investigations" value={data?.totalInvestigations} color="bg-purple-500" icon={Microscope} />
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Microscope className="w-5 h-5 text-purple-600" />
                    Investigation Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {loading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : data?.breakdown?.byType?.length > 0 ? (
                    data.breakdown.byType.map((item) => {
                      const total = data.breakdown.byType.reduce((sum, t) => sum + t.count, 0);
                      return (
                        <BarItem
                          key={item._id}
                          label={item._id}
                          value={item.count}
                          total={total}
                          color="bg-purple-500"
                        />
                      );
                    })
                  ) : (
                    <p className="text-center text-slate-500 text-sm py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patient-Wise Report */}
          <TabsContent value="patient-wise" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Selection */}
              <Card className="lg:col-span-1 border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-600" />
                    Select Patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Search by name or ID..."
                      className="pl-10"
                    />
                  </div>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {patientList.map((patient) => (
                      <motion.div
                        key={patient._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePatientSelect(patient)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPatient?._id === patient._id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 text-sm">{patient.name}</p>
                            <p className="text-xs text-slate-500">{patient.patientId}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Patient Report */}
              <div className="lg:col-span-2 space-y-6">
                {!selectedPatient ? (
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Select a patient to view their detailed report</p>
                    </CardContent>
                  </Card>
                ) : loadingPatientReport ? (
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                      <p className="text-slate-500">Loading patient report...</p>
                    </CardContent>
                  </Card>
                ) : patientReport ? (
                  <>
                    {/* Patient Info */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{patientReport.patient.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {patientReport.patient.patientId} • {patientReport.patient.sex}, {patientReport.patient.age} years
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">Treatment Duration</p>
                            <p className="text-2xl font-bold text-indigo-600">{patientReport.stats.treatmentDuration} days</p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatBox label="Complaints" value={patientReport.stats.totalComplaints} color="bg-red-500" icon={FileText} />
                      <StatBox label="Prescriptions" value={patientReport.stats.totalPrescriptions} color="bg-emerald-500" icon={Pill} />
                      <StatBox label="Follow-ups" value={patientReport.stats.totalFollowUps} color="bg-amber-500" icon={Calendar} />
                      <StatBox label="Investigations" value={patientReport.stats.totalInvestigations} color="bg-purple-500" icon={Microscope} />
                    </div>

                    {/* Treatment Progress */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-600" />
                          Treatment Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`px-4 py-2 rounded-full ${patientReport.treatmentProgress.improvementTrend === "improving" ? "bg-emerald-100 text-emerald-700" :
                              patientReport.treatmentProgress.improvementTrend === "declining" ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                            }`}>
                            <span className="font-semibold capitalize">{patientReport.treatmentProgress.improvementTrend}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-600">Case Record Completion</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${patientReport.caseRecordSummary.completionPercentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-700">
                                {patientReport.caseRecordSummary.completionPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-600" />
                          Treatment Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {patientReport.timeline.slice(0, 10).map((event, idx) => (
                            <TimelineItem key={idx} event={event} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Common Complaints */}
                    {patientReport.complaintAnalysis.commonComplaints.length > 0 && (
                      <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-600" />
                            Most Common Complaints
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          {patientReport.complaintAnalysis.commonComplaints.map((item) => {
                            const total = patientReport.complaintAnalysis.commonComplaints.reduce((sum, c) => sum + c.count, 0);
                            return (
                              <BarItem
                                key={item.type}
                                label={item.type}
                                value={item.count}
                                total={total}
                                color="bg-red-500"
                              />
                            );
                          })}
                        </CardContent>
                      </Card>
                    )}

                    {/* Common Medicines */}
                    {patientReport.prescriptionAnalysis.commonMedicines.length > 0 && (
                      <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Pill className="w-5 h-5 text-emerald-600" />
                            Most Prescribed Medicines
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          {patientReport.prescriptionAnalysis.commonMedicines.slice(0, 8).map((item) => {
                            const total = patientReport.prescriptionAnalysis.commonMedicines.reduce((sum, m) => sum + m.count, 0);
                            return (
                              <BarItem
                                key={item.name}
                                label={item.name}
                                value={item.count}
                                total={total}
                                color="bg-emerald-500"
                              />
                            );
                          })}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
