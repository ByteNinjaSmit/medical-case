import React, { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users, FileText, Pill, Calendar, Microscope, Download,
  Filter, TrendingUp, BarChart3
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

  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate]);

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

  const StatBox = ({ label, value, color = "bg-blue-500" }) => (
    <div className="p-4 rounded-lg border border-slate-200 bg-white">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{loading ? "..." : value || 0}</p>
      <div className={`h-1 w-12 ${color} rounded-full mt-2`} />
    </div>
  );

  const BarItem = ({ label, value, total, color = "bg-blue-500" }) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="text-slate-500">{value} ({percentage}%)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-indigo-600" />
                Reports & Analytics
              </h1>
              <p className="text-sm text-slate-500 mt-1">Comprehensive insights into your clinic data</p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
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
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="h-9 w-full text-sm"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-white border border-slate-200 rounded-xl no-scrollbar gap-1 mb-6">
            {[
              { val: "patients", icon: Users, label: "Patients" },
              { val: "complaints", icon: FileText, label: "Complaints" },
              { val: "prescriptions", icon: Pill, label: "Prescriptions" },
              { val: "followups", icon: Calendar, label: "Follow-ups" },
              { val: "investigations", icon: Microscope, label: "Investigations" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.val}
                value={tab.val}
                className="flex-shrink-0 gap-1.5 text-xs font-medium px-4 py-2.5 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Patient Analytics */}
          <TabsContent value="patients" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox label="Total Patients" value={data?.totalCount} color="bg-blue-500" />
                <StatBox label="Male" value={data?.demographics?.gender?.find(g => g._id === "Male")?.count} color="bg-blue-400" />
                <StatBox label="Female" value={data?.demographics?.gender?.find(g => g._id === "Female")?.count} color="bg-pink-400" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Gender Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Marital Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                <StatBox label="Total Complaints" value={data?.totalComplaints} color="bg-red-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Complaint Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loading ? (
                      <div className="h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                      </div>
                    ) : data?.breakdown?.byType?.length > 0 ? (
                      data.breakdown.byType.slice(0, 8).map((item, idx) => {
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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">By Severity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                <StatBox label="Total Prescriptions" value={data?.totalPrescriptions} color="bg-emerald-500" />
                <StatBox
                  label="Avg Medicines/Rx"
                  value={data?.averageMedicinesPerPrescription?.toFixed(1)}
                  color="bg-emerald-400"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Most Prescribed Medicines</CardTitle>
                  <CardDescription>Top 15 medicines by prescription frequency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : data?.topMedicines?.length > 0 ? (
                    data.topMedicines.map((item, idx) => {
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
                <StatBox label="Total Follow-ups" value={data?.totalFollowUps} color="bg-amber-500" />
                <StatBox label="Upcoming" value={data?.upcomingFollowUps} color="bg-blue-500" />
                <StatBox label="Overdue" value={data?.overdueFollowUps} color="bg-red-500" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Patient State Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                <StatBox label="Total Investigations" value={data?.totalInvestigations} color="bg-purple-500" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investigation Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : data?.breakdown?.byType?.length > 0 ? (
                    data.breakdown.byType.map((item, idx) => {
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
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
