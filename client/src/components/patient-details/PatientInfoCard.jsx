import React from "react";
import { User, Phone, MapPin, Briefcase, GraduationCap, Heart, Utensils, Calendar, Clock, FileText } from "lucide-react";

export default function PatientInfoCard({ patient }) {
    if (!patient) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Primary Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <User className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm">Personal Information</h3>
                </div>
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoItem label="Full Name" value={patient.name} />
                    <InfoItem label="Patient ID" value={patient.patientId} mono />
                    <InfoItem label="Age / Sex" value={`${patient.age} years / ${patient.sex}`} />
                    <InfoItem label="Marital Status" value={patient.maritalStatus} icon={Heart} />
                    <InfoItem label="Education" value={patient.education} icon={GraduationCap} />
                    <InfoItem label="Occupation" value={patient.occupation} icon={Briefcase} />
                </div>
            </div>

            {/* Contact & Address */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm">Contact Details</h3>
                </div>
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem label="Mobile Number" value={patient.mobileNo} icon={Phone} />
                    <div className="sm:col-span-2">
                        <InfoItem label="Address" value={patient.address} />
                    </div>
                </div>
            </div>

            {/* Medical Context */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm">Medical Context</h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem label="Dietary Habits" value={patient.diet} icon={Utensils} />
                    <InfoItem label="Referred By" value={patient.referredBy} />
                    <div className="sm:col-span-2">
                        <InfoItem label="Case Summary" value={patient.summary} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm leading-relaxed" />
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-6 text-xs text-slate-400 px-2">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Registered: {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '-'}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Last Updated: {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : '-'}
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon: Icon, mono, className }) {
    return (
        <div className={className}>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </div>
            <div className={`text-sm text-slate-900 font-medium ${mono ? 'font-mono' : ''}`}>
                {value || <span className="text-slate-300 italic">Not provided</span>}
            </div>
        </div>
    );
}
