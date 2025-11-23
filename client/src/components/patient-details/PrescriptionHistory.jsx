import React from "react";
import { Pill, Calendar, FileText, Clock, AlertCircle } from "lucide-react";

export default function PrescriptionHistory({ prescriptions, loading }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
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
        );
    }

    if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Pill className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-900 font-medium">No prescriptions found</p>
                <p className="text-sm text-slate-500">New prescriptions will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {prescriptions.map((p, idx) => (
                <div key={p._id || idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="p-5">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Visit Date</div>
                                    <div className="font-semibold text-slate-900 text-sm">
                                        {new Date(p.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {p.nextVisit && (
                                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-100 self-start sm:self-auto">
                                    <Clock className="w-3.5 h-3.5" />
                                    Next Visit: {new Date(p.nextVisit).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Medicines */}
                            <div>
                                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                                    <Pill className="w-3.5 h-3.5 text-slate-400" />
                                    Medicines Prescribed
                                </h4>
                                <div className="grid gap-2.5 sm:grid-cols-2">
                                    {p.medicines.map((med, i) => (
                                        <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="font-medium text-slate-900 text-sm">{med.name}</div>
                                                {med.potency && (
                                                    <span className="shrink-0 px-1.5 py-0.5 bg-white rounded text-[10px] font-medium text-slate-600 border border-slate-200 shadow-sm">
                                                        {med.potency}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                                                <span className="font-medium text-slate-700">{med.dosage}</span>
                                                {med.frequency && <span className="text-slate-400">•</span>}
                                                {med.frequency && <span className="italic">{med.frequency}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes & Diagnosis */}
                            {(p.reason || p.followUpNotes) && (
                                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                                    {p.reason && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Diagnosis / Reason</h4>
                                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                {p.reason}
                                            </p>
                                        </div>
                                    )}

                                    {p.followUpNotes && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Follow-up Notes</h4>
                                            <p className="text-sm text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                                                {p.followUpNotes}
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
    );
}
