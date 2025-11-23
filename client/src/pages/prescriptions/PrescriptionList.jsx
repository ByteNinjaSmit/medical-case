import React, { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Pill, Calendar, FileText, ArrowLeft, Activity, Clock } from "lucide-react";

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
                    <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900">Patient ID Missing</h2>
                    <p className="text-slate-500 mt-2">Please select a patient to view prescriptions.</p>
                    <button
                        onClick={() => navigate('/patients')}
                        className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                        Go to Patients
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    Prescriptions
                                </h1>
                                <p className="text-sm text-slate-500">History for Patient ID: <span className="font-mono text-slate-700">{patientId}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/prescriptions/new?patient=${patientId}`)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors shadow-sm hover:shadow font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Prescription</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
                                <div className="flex justify-between mb-4">
                                    <div className="h-4 bg-slate-100 rounded w-32"></div>
                                    <div className="h-4 bg-slate-100 rounded w-24"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                        <Activity className="w-5 h-5" />
                        {error}
                    </div>
                ) : prescriptions.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Pill className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No prescriptions found</h3>
                        <p className="text-slate-500 mt-1 mb-6">Create a new prescription to get started.</p>
                        <button
                            onClick={() => navigate(`/prescriptions/new?patient=${patientId}`)}
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Prescription
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {prescriptions.map((prescription) => (
                            <div key={prescription._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Visit Date</div>
                                                <div className="font-semibold text-slate-900">
                                                    {new Date(prescription.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        {prescription.nextVisit && (
                                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-100 self-start sm:self-auto">
                                                <Clock className="w-4 h-4" />
                                                Next Visit: {new Date(prescription.nextVisit).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                                                <Pill className="w-4 h-4 text-slate-400" />
                                                Medicines
                                            </h4>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {prescription.medicines.map((med, idx) => (
                                                    <div key={idx} className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="font-medium text-slate-900">{med.name}</div>
                                                            {med.potency && (
                                                                <span className="shrink-0 px-2 py-0.5 bg-white rounded text-xs font-medium text-slate-600 border border-slate-200 shadow-sm">
                                                                    {med.potency}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-slate-600 mt-1.5 flex items-center gap-2">
                                                            <span className="font-medium text-slate-700">{med.dosage}</span>
                                                            {med.frequency && <span className="text-slate-400">•</span>}
                                                            {med.frequency && <span className="italic">{med.frequency}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {(prescription.reason || prescription.followUpNotes) && (
                                            <div className="grid sm:grid-cols-2 gap-6 pt-2">
                                                {prescription.reason && (
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Diagnosis / Reason</h4>
                                                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                            {prescription.reason}
                                                        </p>
                                                    </div>
                                                )}

                                                {prescription.followUpNotes && (
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Follow-up Notes</h4>
                                                        <p className="text-sm text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                                                            {prescription.followUpNotes}
                                                        </p>
                                                    </div>
                                                )}
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
