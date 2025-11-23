import React, { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Pill, Calendar, FileText } from "lucide-react";

export default function PrescriptionList() {
    const { API } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const patientId = searchParams.get("patient");

    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (patientId) {
            fetchPrescriptions();
        }
    }, [patientId]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/prescriptions/${patientId}`, {
                withCredentials: true,
            });
            setPrescriptions(res.data);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to load prescriptions");
        } finally {
            setLoading(false);
        }
    };

    if (!patientId) {
        return <div className="p-8 text-center text-red-600">Patient ID is missing.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Pill className="w-6 h-6 text-red-600" />
                                Prescriptions
                            </h1>
                            <p className="text-slate-500 mt-1">Manage medications for Patient ID: {patientId}</p>
                        </div>
                        <button
                            onClick={() => navigate(`/prescriptions/new?patient=${patientId}`)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Prescription
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-white rounded-xl shadow-sm animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>
                ) : prescriptions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Pill className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No prescriptions found</h3>
                        <p className="text-slate-500 mt-1">Create a new prescription to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {prescriptions.map((prescription) => (
                            <div key={prescription._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(prescription.date).toLocaleDateString()}
                                        </div>
                                        {prescription.nextVisit && (
                                            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                                Next Visit: {new Date(prescription.nextVisit).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Medicines</h4>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {prescription.medicines.map((med, idx) => (
                                                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        <div className="font-medium text-slate-800">{med.name}</div>
                                                        <div className="text-sm text-slate-600 mt-1">
                                                            {med.potency && <span className="mr-2 px-2 py-0.5 bg-white rounded border border-slate-200 text-xs">{med.potency}</span>}
                                                            {med.dosage}
                                                        </div>
                                                        {med.frequency && <div className="text-xs text-slate-500 mt-1 italic">{med.frequency}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {prescription.reason && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-1">Reason</h4>
                                                <p className="text-slate-600 text-sm">{prescription.reason}</p>
                                            </div>
                                        )}

                                        {prescription.followUpNotes && (
                                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                                <h4 className="text-sm font-semibold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Follow-up Notes
                                                </h4>
                                                <p className="text-amber-800 text-sm">{prescription.followUpNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
