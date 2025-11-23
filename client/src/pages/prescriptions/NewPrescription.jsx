import React, { useState } from "react";
import { useAuth } from "@/store/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Save, ArrowLeft, Pill, FileText, Calendar, AlertCircle } from "lucide-react";

export default function NewPrescription() {
    const { API } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const patientId = searchParams.get("patient");
    const [submitError, setSubmitError] = useState("");

    const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            medicines: [{ name: "", potency: "", dosage: "", frequency: "" }],
            reason: "",
            followUpNotes: "",
            nextVisit: ""
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "medicines"
    });

    const onSubmit = async (data) => {
        setSubmitError("");
        try {
            await axios.post(`${API}/api/prescriptions`, {
                patientId,
                ...data
            }, {
                withCredentials: true,
            });
            navigate(`/prescriptions?patient=${patientId}`);
        } catch (e) {
            setSubmitError(e?.response?.data?.message || "Failed to save prescription");
        }
    };

    if (!patientId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900">Patient ID Missing</h2>
                    <p className="text-slate-500 mt-2">Cannot create prescription without a patient ID.</p>
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
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">New Prescription</h1>
                            <p className="text-sm text-slate-500">Create a new prescription record</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Medicines Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Pill className="w-4 h-4 text-emerald-600" />
                                Medicines
                            </h2>
                            <button
                                type="button"
                                onClick={() => append({ name: "", potency: "", dosage: "", frequency: "" })}
                                className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors border border-emerald-100"
                            >
                                <Plus className="w-3 h-3" />
                                Add Medicine
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group transition-all hover:shadow-sm hover:border-slate-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                        <div className="sm:col-span-6">
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Medicine Name *</label>
                                            <input
                                                {...register(`medicines.${index}.name`, { required: "Required" })}
                                                className={`w-full h-10 px-3 rounded-lg border ${errors.medicines?.[index]?.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'} focus:ring-4 focus:outline-none transition-all bg-white`}
                                                placeholder="e.g. Nux Vomica"
                                            />
                                            {errors.medicines?.[index]?.name && (
                                                <span className="text-xs text-red-500 mt-1">{errors.medicines[index].name.message}</span>
                                            )}
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Potency</label>
                                            <input
                                                {...register(`medicines.${index}.potency`)}
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none transition-all bg-white"
                                                placeholder="e.g. 200C"
                                            />
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Dosage</label>
                                            <input
                                                {...register(`medicines.${index}.dosage`)}
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none transition-all bg-white"
                                                placeholder="e.g. 3 drops"
                                            />
                                        </div>

                                        <div className="sm:col-span-12">
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Frequency / Instructions</label>
                                            <input
                                                {...register(`medicines.${index}.frequency`)}
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none transition-all bg-white"
                                                placeholder="e.g. Take before meals, TDS"
                                            />
                                        </div>
                                    </div>

                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="absolute -top-2 -right-2 p-1.5 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full border border-slate-200 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove medicine"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {errors.medicines && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> At least one medicine is required.</span>}
                        </div>
                    </div>

                    {/* Clinical Notes Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Clinical Details
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Diagnosis / Reason</label>
                                <textarea
                                    {...register("reason")}
                                    rows={3}
                                    className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all resize-none"
                                    placeholder="Enter key symptoms, diagnosis or reason for prescription..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Follow-up Notes</label>
                                <textarea
                                    {...register("followUpNotes")}
                                    rows={3}
                                    className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all resize-none"
                                    placeholder="Notes on improvement, aggravation, or other observations..."
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    Next Visit Date
                                </label>
                                <input
                                    type="date"
                                    {...register("nextVisit")}
                                    className="w-full sm:w-auto h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {submitError && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {submitError}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 pb-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? "Saving..." : "Save Prescription"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
