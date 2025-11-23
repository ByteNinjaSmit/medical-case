import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import axios from "axios";
import { User, Activity, Pill } from "lucide-react";
import PatientInfoCard from "./patient-details/PatientInfoCard";
import ComplaintHistory from "./patient-details/ComplaintHistory";
import PrescriptionHistory from "./patient-details/PrescriptionHistory";

export default function PatientDetailsView({ patient }) {
    const { API } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [complaints, setComplaints] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === "complaints" && complaints.length === 0) {
            fetchComplaints();
        }
        if (activeTab === "prescriptions" && prescriptions.length === 0) {
            fetchPrescriptions();
        }
    }, [activeTab]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/user/complaint/${patient._id}`, {
                withCredentials: true,
            });
            const data = res.data;
            const complaintsList = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.complaints)
                        ? data.complaints
                        : [];
            setComplaints(complaintsList);
        } catch (e) {
            console.error("Failed to fetch complaints", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/prescriptions/${patient._id}`, {
                withCredentials: true,
            });
            setPrescriptions(res.data);
        } catch (e) {
            console.error("Failed to fetch prescriptions", e);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "complaints", label: "Complaints", icon: Activity },
        { id: "prescriptions", label: "Prescriptions", icon: Pill },
    ];

    return (
        <div className="flex flex-col h-full min-h-[500px]">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 mb-6 sticky top-0 bg-white z-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 relative ${activeTab === tab.id
                            ? "border-red-600 text-red-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-red-600" : "text-slate-400"}`} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                {activeTab === "overview" && <PatientInfoCard patient={patient} />}

                {activeTab === "complaints" && (
                    <ComplaintHistory complaints={complaints} loading={loading} />
                )}

                {activeTab === "prescriptions" && (
                    <PrescriptionHistory prescriptions={prescriptions} loading={loading} />
                )}
            </div>
        </div>
    );
}
