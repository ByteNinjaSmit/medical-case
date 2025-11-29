import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import axios from "axios";
import { User, Activity, Pill, ClipboardList } from "lucide-react";
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
        { id: "case-modules", label: "Case Modules", icon: ClipboardList },
    ];

    return (
        <div className="flex flex-col h-full min-h-[380px] sm:min-h-[500px]">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 mb-4 sm:mb-6 sticky top-0 bg-white z-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all border-b-2 relative ${activeTab === tab.id
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
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar pb-4 sm:pb-6">
                {activeTab === "overview" && <PatientInfoCard patient={patient} />}

                {activeTab === "complaints" && (
                    <ComplaintHistory complaints={complaints} loading={loading} />
                )}

                {activeTab === "prescriptions" && (
                    <PrescriptionHistory prescriptions={prescriptions} loading={loading} />
                )}

                {activeTab === "case-modules" && (
                    <CaseModulesStatus patient={patient} />
                )}
            </div>
        </div>
    );
}

const CaseModulesStatus = ({ patient }) => {
    const { API } = useAuth();
    const [loading, setLoading] = useState(false);
    const [modules, setModules] = useState({
        physicalGenerals: null,
        digestion: null,
        elimination: null,
        sleepDreams: null,
        sexualFunction: null,
        menstrualHistory: null,
        history: null,
        thermalModalities: null,
        mentalGenerals: null,
        investigationsCount: 0,
        followupsCount: 0,
    });

    useEffect(() => {
        if (!patient?._id || !API) return;
        let cancelled = false;

        const fetchModules = async () => {
            setLoading(true);
            try {
                const pid = patient._id;
                const [phys, dig, elim, sleep, sexual, menstrual, hist, thermal, mental, inv, fol] = await Promise.all([
                    axios.get(`${API}/api/user/patients/${pid}/physical-generals`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/digestion`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/elimination`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/sleep-dreams`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/sexual-function`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/menstrual-history`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/history`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/thermal-modalities`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/mental-generals`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/investigations`, { withCredentials: true }).catch(() => null),
                    axios.get(`${API}/api/user/patients/${pid}/followups`, { withCredentials: true }).catch(() => null),
                ]);

                if (cancelled) return;

                const getSingle = (res) => (res && (res.data?.data || res.data)) || null;
                const getListCount = (res) => {
                    if (!res) return 0;
                    const data = res.data;
                    if (Array.isArray(data)) return data.length;
                    if (Array.isArray(data?.data)) return data.data.length;
                    if (Array.isArray(data?.items)) return data.items.length;
                    return 0;
                };

                setModules({
                    physicalGenerals: getSingle(phys),
                    digestion: getSingle(dig),
                    elimination: getSingle(elim),
                    sleepDreams: getSingle(sleep),
                    sexualFunction: getSingle(sexual),
                    menstrualHistory: getSingle(menstrual),
                    history: getSingle(hist),
                    thermalModalities: getSingle(thermal),
                    mentalGenerals: getSingle(mental),
                    investigationsCount: getListCount(inv),
                    followupsCount: getListCount(fol),
                });
            } catch {
                if (!cancelled) {
                    setModules((m) => ({ ...m }));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchModules();

        return () => {
            cancelled = true;
        };
    }, [API, patient?._id]);

    const items = [
        { key: "physicalGenerals", label: "Physical Generals", type: "single" },
        { key: "digestion", label: "Digestion", type: "single" },
        { key: "elimination", label: "Elimination", type: "single" },
        { key: "sleepDreams", label: "Sleep & Dreams", type: "single" },
        { key: "sexualFunction", label: "Sexual / Function", type: "single" },
        { key: "menstrualHistory", label: "Menstrual History", type: "single" },
        { key: "history", label: "Past / Family / Personal History", type: "single" },
        { key: "thermalModalities", label: "Thermal Modalities", type: "single" },
        { key: "mentalGenerals", label: "Mental Generals", type: "single" },
        { key: "investigationsCount", label: "Investigations", type: "count" },
        { key: "followupsCount", label: "Follow-ups", type: "count" },
    ];

    const getStatus = (item) => {
        if (item.type === "single") {
            return modules[item.key] ? "Recorded" : "Not recorded";
        }
        const count = modules[item.key];
        return count > 0 ? `${count} records` : "No records";
    };

    return (
        <div className="space-y-3">
            {loading && (
                <div className="text-xs text-slate-500 mb-1">Loading case module summary...</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item) => (
                    <div
                        key={item.key}
                        className="border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/60 flex items-center justify-between text-xs sm:text-sm"
                    >
                        <div className="text-slate-700 font-medium mr-3">{item.label}</div>
                        <div
                            className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                                item.type === "single"
                                    ? modules[item.key]
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-slate-50 text-slate-600 border border-slate-200"
                                    : modules[item.key] > 0
                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                    : "bg-slate-50 text-slate-600 border border-slate-200"
                            }`}
                        >
                            {getStatus(item)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
