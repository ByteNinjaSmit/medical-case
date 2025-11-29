import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import axios from "axios";
import { motion } from "framer-motion";
import {
    Users, TrendingUp, FileText, Calendar, Activity, Plus,
    ArrowUpRight, ArrowDownRight, Clock, Pill
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
    const { API } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/reports/dashboard`, {
                withCredentials: true,
            });
            setStats(res.data.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden border-slate-200/60 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                            <h3 className="text-3xl font-bold text-slate-900">{loading ? "..." : value}</h3>
                            {change !== undefined && (
                                <div className="flex items-center gap-1 mt-2">
                                    {trend === "up" ? (
                                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className={`text-sm font-medium ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                                        {Math.abs(change)}%
                                    </span>
                                    <span className="text-xs text-slate-500">vs last month</span>
                                </div>
                            )}
                        </div>
                        <div className={`p-4 rounded-2xl ${color}`}>
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const QuickAction = ({ title, description, icon: Icon, color, onClick }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                </div>
                <Plus className="w-5 h-5 text-slate-400" />
            </div>
        </motion.button>
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                            <p className="text-sm text-slate-500 mt-1">Welcome back! Here's your clinic overview</p>
                        </div>
                        <Button
                            onClick={() => navigate("/reports")}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            View Reports
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Patients"
                        value={stats?.overview?.totalPatients || 0}
                        change={stats?.overview?.patientGrowth}
                        trend={stats?.overview?.patientGrowth >= 0 ? "up" : "down"}
                        icon={Users}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="New This Month"
                        value={stats?.overview?.newPatientsThisMonth || 0}
                        icon={TrendingUp}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    />
                    <StatCard
                        title="Prescriptions"
                        value={stats?.overview?.prescriptionsThisMonth || 0}
                        icon={Pill}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                    <StatCard
                        title="Pending Follow-ups"
                        value={stats?.overview?.pendingFollowUps || 0}
                        icon={Calendar}
                        color="bg-gradient-to-br from-amber-500 to-amber-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <QuickAction
                                title="New Patient"
                                description="Register a new patient"
                                icon={Users}
                                color="bg-blue-500"
                                onClick={() => navigate("/patients/new")}
                            />
                            <QuickAction
                                title="New Complaint"
                                description="Add patient complaint"
                                icon={Activity}
                                color="bg-red-500"
                                onClick={() => navigate("/complaints/new")}
                            />
                            <QuickAction
                                title="New Prescription"
                                description="Create prescription"
                                icon={Pill}
                                color="bg-emerald-500"
                                onClick={() => navigate("/prescriptions/new")}
                            />
                        </CardContent>
                    </Card>

                    {/* Recent Patients */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Recent Patients</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/patients")}
                                    className="text-xs"
                                >
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                            <div className="w-10 h-10 rounded-full bg-slate-200" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 rounded w-1/3" />
                                                <div className="h-3 bg-slate-200 rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : stats?.recentActivity?.patients?.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.recentActivity.patients.map((patient) => (
                                        <motion.div
                                            key={patient._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/patients/${patient._id}/case`)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                {patient.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 text-sm truncate">{patient.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {patient.patientId} • {patient.sex}, {patient.age}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No recent patients
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Gender Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-48 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                </div>
                            ) : stats?.demographics?.gender?.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.demographics.gender.map((item) => {
                                        const total = stats.demographics.gender.reduce((sum, g) => sum + g.count, 0);
                                        const percentage = ((item.count / total) * 100).toFixed(1);
                                        const colors = {
                                            Male: "bg-blue-500",
                                            Female: "bg-pink-500",
                                            Other: "bg-purple-500",
                                        };
                                        return (
                                            <div key={item._id}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-slate-700">{item._id}</span>
                                                    <span className="text-sm text-slate-500">{item.count} ({percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${colors[item._id] || "bg-slate-400"}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Age Groups</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-48 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                </div>
                            ) : stats?.demographics?.ageGroups?.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.demographics.ageGroups.map((item, index) => {
                                        const total = stats.demographics.ageGroups.reduce((sum, g) => sum + g.count, 0);
                                        const percentage = ((item.count / total) * 100).toFixed(1);
                                        const colors = ["bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-red-500"];
                                        return (
                                            <div key={index}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-slate-700">{item.range}</span>
                                                    <span className="text-sm text-slate-500">{item.count} ({percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
