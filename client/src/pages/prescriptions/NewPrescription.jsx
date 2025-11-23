import React, { useState } from "react";
import { useAuth } from "@/store/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

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
        return <div className="p-8 text-center text-red-600">Patient ID is missing.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-800">New Prescription</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Medicines Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">Medicines</h2>
                            <button
                                type="button"
                                onClick={() => append({ name: "", potency: "", dosage: "", frequency: "" })}
                                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Medicine
                            </button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Medicine Name *</label>
                                            <input
                                                {...register(`medicines.${index}.name`, { required: "Medicine name is required" })}
                                                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                                placeholder="e.g. Nux Vomica"
                                            />
                                            {errors.medicines?.[index]?.name && (
                                                <span className="text-xs text-red-500 mt-1">{errors.medicines[index].name.message}</span>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Potency</label>
                                            <input
                                                {...register(`medicines.${index}.potency`)}
                                                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                                placeholder="e.g. 200C"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Dosage</label>
                                            <input
                                                {...register(`medicines.${index}.dosage`)}
                                                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                                placeholder="e.g. 3 drops TDS"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Frequency / Instructions</label>
                                            <input
                                                {...register(`medicines.${index}.frequency`)}
                                                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                                placeholder="e.g. Take before meals"
                                            />
                                        </div>
                                    </div>

                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove medicine"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.medicines && <span className="text-xs text-red-500 mt-2 block">At least one medicine is required.</span>}
                    </div>

                    {/* Clinical Notes Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">Clinical Notes</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Prescription</label>
                            <textarea
                                {...register("reason")}
                                rows={3}
                                className="w-full p-3 rounded-md border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                                placeholder="Key symptoms or analysis..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Notes</label>
                            <textarea
                                {...register("followUpNotes")}
                                rows={3}
                                className="w-full p-3 rounded-md border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                                placeholder="Improvement, aggravation, etc..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Next Visit Date</label>
                            <input
                                type="date"
                                {...register("nextVisit")}
                                className="w-full sm:w-auto h-10 px-3 rounded-md border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {submitError && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
                            {submitError}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
