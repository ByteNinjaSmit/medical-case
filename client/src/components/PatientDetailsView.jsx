import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import axios from "axios";
import { User, FileText, Pill, Calendar, Activity, Clock } from "lucide-react";
import { format, isValid } from 'date-fns';

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

    // const formattedDate = format(new Date(c.date), 'yyyy-MM-dd');

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
        <div className="flex flex-col h-full min-h-[400px]">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                            ? "border-red-600 text-red-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm animate-fade-in">
                        <InfoItem label="Patient ID" value={patient.patientId} />
                        <InfoItem label="Name" value={patient.name} />
                        <InfoItem label="Sex" value={patient.sex} />
                        <InfoItem label="Age" value={patient.age} />
                        <InfoItem label="Mobile" value={patient.mobileNo} />
                        <InfoItem label="Referred By" value={patient.referredBy} />
                        <InfoItem label="Marital Status" value={patient.maritalStatus} />
                        <InfoItem label="Diet" value={patient.diet} />
                        <InfoItem label="Education" value={patient.education} />
                        <InfoItem label="Occupation" value={patient.occupation} />
                        <div className="sm:col-span-2">
                            <InfoItem label="Address" value={patient.address} />
                        </div>
                        <div className="sm:col-span-2">
                            <InfoItem label="Summary" value={patient.summary} />
                        </div>
                        <InfoItem label="Created" value={patient.createdAt ? new Date(patient.createdAt).toLocaleString() : '-'} />
                        <InfoItem label="Last Updated" value={patient.updatedAt ? new Date(patient.updatedAt).toLocaleString() : '-'} />
                    </div>
                )}

                {activeTab === "complaints" && (
                    <div className="space-y-4 animate-fade-in">
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading complaints...</div>
                        ) : !Array.isArray(complaints) || complaints.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                No complaints recorded.
                            </div>
                        ) : (
                            complaints.map((c, idx) => {
                                // Check if the date is valid
                                const complaintDate = new Date(c.visitDate || c.createdAt);
                                const isDateValid = isValid(complaintDate);

                                return (
                                    <div key={c._id || idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-semibold text-slate-800 flex items-center gap-2">
                                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                                                    #{c.complaintNo || idx + 1}
                                                </span>
                                                {/* Check if the date is valid before formatting */}
                                                {isDateValid ? format(complaintDate, 'yyyy-MM-dd') : 'Invalid Date'}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {/* Check if the date is valid before formatting */}
                                                {isDateValid ? format(complaintDate, 'HH:mm') : 'Invalid Time'}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{c.complaintText}</div>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {c.severity && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${c.severity === 'Severe' || c.severity === 'Very Severe' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                c.severity === 'Moderate' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                                    'bg-green-50 text-green-700 border-green-100'
                                                            }`}>
                                                            {c.severity}
                                                        </span>
                                                    )}
                                                    {c.duration && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                            {c.duration}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                                                {c.location && <div><span className="font-medium text-slate-700">Location:</span> {c.location}</div>}
                                                {c.sensation && <div><span className="font-medium text-slate-700">Sensation:</span> {c.sensation}</div>}
                                                {c.concomitants && <div className="sm:col-span-2"><span className="font-medium text-slate-700">Concomitants:</span> {c.concomitants}</div>}

                                                {(c.onset || c.aggravation || c.amelioration) && (
                                                    <div className="sm:col-span-2 mt-1 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                                        {c.onset && <div><span className="font-medium">Onset:</span> {c.onset}</div>}
                                                        {c.aggravation && <div><span className="font-medium">Aggravation:</span> {c.aggravation}</div>}
                                                        {c.amelioration && <div><span className="font-medium">Amelioration:</span> {c.amelioration}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === "prescriptions" && (
                    <div className="space-y-4 animate-fade-in">
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading prescriptions...</div>
                        ) : prescriptions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                No prescriptions found.
                            </div>
                        ) : (
                            prescriptions.map((p, idx) => (
                                <div key={p._id || idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                            <Calendar className="w-4 h-4 text-red-500" />
                                            {new Date(p.date).toLocaleDateString()}
                                        </div>
                                        {p.nextVisit && (
                                            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                                Next: {new Date(p.nextVisit).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {p.medicines.map((med, i) => (
                                                <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100 text-sm">
                                                    <div className="font-medium text-slate-900">{med.name}</div>
                                                    <div className="text-slate-500 text-xs mt-0.5">
                                                        {med.potency && <span className="mr-1">{med.potency} •</span>}
                                                        {med.dosage}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {p.reason && (
                                            <div className="text-xs text-slate-600">
                                                <span className="font-semibold text-slate-500">Reason:</span> {p.reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <div className="text-slate-500 text-xs">{label}</div>
            <div className="font-medium text-slate-800 whitespace-pre-wrap">{value || '-'}</div>
        </div>
    );
}
