import React from "react";
import { format, isValid } from 'date-fns';
import { Clock, Activity, AlertCircle, MapPin, Zap, Layers } from "lucide-react";

export default function ComplaintHistory({ complaints, loading }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-32 mb-4"></div>
                        <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!Array.isArray(complaints) || complaints.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-900 font-medium">No complaints recorded</p>
                <p className="text-sm text-slate-500">New complaints will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {complaints.map((c, idx) => {
                const complaintDate = new Date(c.visitDate || c.createdAt);
                const isDateValid = isValid(complaintDate);

                return (
                    <div key={c._id || idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                        {/* Header */}
                        <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
                                    #{c.complaintNo || idx + 1}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-900">
                                        {isDateValid ? format(complaintDate, 'MMMM d, yyyy') : 'Date Unknown'}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {isDateValid ? format(complaintDate, 'h:mm a') : '--:--'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {c.severity && (
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5 ${c.severity === 'Severe' || c.severity === 'Very Severe' ? 'bg-red-50 text-red-700 border-red-100' :
                                            c.severity === 'Moderate' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-green-50 text-green-700 border-green-100'
                                        }`}>
                                        <AlertCircle className="w-3 h-3" />
                                        {c.severity}
                                    </span>
                                )}
                                {c.duration && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                                        {c.duration}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            {/* Main Complaint */}
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Chief Complaint</h4>
                                <p className="text-sm text-slate-900 leading-relaxed font-medium">
                                    {c.complaintText}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                {c.location && (
                                    <div className="flex gap-2.5">
                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Location</div>
                                            <div className="text-sm text-slate-900">{c.location}</div>
                                        </div>
                                    </div>
                                )}
                                {c.sensation && (
                                    <div className="flex gap-2.5">
                                        <Zap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Sensation</div>
                                            <div className="text-sm text-slate-900">{c.sensation}</div>
                                        </div>
                                    </div>
                                )}
                                {c.concomitants && (
                                    <div className="md:col-span-2 flex gap-2.5">
                                        <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Concomitants</div>
                                            <div className="text-sm text-slate-900">{c.concomitants}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modalities */}
                            {(c.onset || c.aggravation || c.amelioration) && (
                                <div className="border-t border-slate-100 pt-3">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modalities</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <ModalityItem label="Onset" value={c.onset} color="blue" />
                                        <ModalityItem label="Aggravation" value={c.aggravation} color="red" />
                                        <ModalityItem label="Amelioration" value={c.amelioration} color="emerald" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ModalityItem({ label, value, color }) {
    if (!value) return null;

    const colorStyles = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        red: "bg-red-50 text-red-700 border-red-100",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100"
    };

    return (
        <div className={`p-3 rounded-lg border ${colorStyles[color]} text-sm`}>
            <div className="font-semibold text-xs uppercase tracking-wide opacity-70 mb-1">{label}</div>
            <div>{value}</div>
        </div>
    );
}
