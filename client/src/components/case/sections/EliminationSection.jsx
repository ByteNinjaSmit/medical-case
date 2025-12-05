import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Save, AlertCircle, Droplets } from "lucide-react";
import { toast } from "sonner";

const EliminationSection = ({ patientId }) => {
    const { API } = useAuth();

    const [form, setForm] = useState({
        stool: { color: "", consistency: "", odor: "", satisfaction: "", urging: "", pain: "", frequency: "", bloodOrMucus: "" },
        urine: { color: "", odor: "", quantity: "", urgency: "", difficulty: "", burning: "", frequency: "" },
        discharges: [],
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchElimination = async () => {
            if (!patientId) return;
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`${API}/api/user/patients/${patientId}/elimination`, {
                    withCredentials: true,
                });
                const data = res?.data?.data;
                if (data) {
                    setForm({
                        stool: data.stool || { color: "", consistency: "", odor: "", satisfaction: "", urging: "", pain: "", frequency: "", bloodOrMucus: "" },
                        urine: data.urine || { color: "", odor: "", quantity: "", urgency: "", difficulty: "", burning: "", frequency: "" },
                        discharges: Array.isArray(data.discharges) ? data.discharges : [],
                    });
                }
            } catch (e) {
                const msg = e?.response?.data?.message || e.message || "Failed to load elimination details";
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchElimination();
    }, [API, patientId]);

    const handleNestedChange = (category, field, value) => {
        setForm((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value,
            },
        }));
    };

    const handleDischargeChange = (index, field, value) => {
        setForm((prev) => {
            const newDischarges = [...prev.discharges];
            newDischarges[index] = { ...newDischarges[index], [field]: value };
            return { ...prev, discharges: newDischarges };
        });
    };

    const addDischarge = () => {
        setForm((prev) => ({
            ...prev,
            discharges: [...prev.discharges, { type: "", color: "", odor: "", stainColor: "", consistency: "", timing: "" }],
        }));
    };

    const removeDischarge = (index) => {
        setForm((prev) => {
            const newDischarges = [...prev.discharges];
            newDischarges.splice(index, 1);
            return { ...prev, discharges: newDischarges };
        });
    };

    const handleSave = async () => {
        if (!patientId) return;
        setSaving(true);
        setError("");
        setMessage("");
        try {
            await axios.put(
                `${API}/api/user/patients/${patientId}/elimination`,
                form,
                { withCredentials: true }
            );
            const msg = "Elimination details saved successfully.";
            setMessage(msg);
            toast.success(msg);
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to save elimination details";
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
        >
            <Card className="border-slate-200 bg-white/90 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                    <Droplets className="w-4 h-4" />
                                </span>
                                Elimination
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Capture details about stool, urine, and other discharges.
                            </CardDescription>
                        </div>
                        {saving && (
                            <span className="text-xs font-medium text-slate-500">Saving...</span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading elimination details...</div>
                    ) : (
                        <>
                            {/* Stool */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Stool</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {["color", "consistency", "odor", "satisfaction", "urging", "pain", "frequency", "bloodOrMucus"].map((field) => (
                                        <div key={field}>
                                            <Label className="text-xs mb-1.5 block capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                            <Input
                                                value={form.stool[field] || ""}
                                                onChange={(e) => handleNestedChange("stool", field, e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Urine */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Urine</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {["color", "odor", "quantity", "urgency", "difficulty", "burning", "frequency"].map((field) => (
                                        <div key={field}>
                                            <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                                            <Input
                                                value={form.urine[field] || ""}
                                                onChange={(e) => handleNestedChange("urine", field, e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Discharges */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-1">
                                    <h3 className="text-sm font-semibold text-slate-800">Other Discharges</h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={addDischarge}
                                        className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Add Discharge
                                    </Button>
                                </div>

                                {form.discharges.length === 0 ? (
                                    <div className="text-xs text-slate-500 italic py-2">No other discharges recorded.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {form.discharges.map((discharge, index) => (
                                            <div key={index} className="relative p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeDischarge(index)}
                                                    className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                                                    {["type", "color", "odor", "stainColor", "consistency", "timing"].map((field) => (
                                                        <div key={field}>
                                                            <Label className="text-[10px] mb-1 block uppercase tracking-wide text-slate-500">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                                            <Input
                                                                value={discharge[field] || ""}
                                                                onChange={(e) => handleDischargeChange(index, field, e.target.value)}
                                                                className="h-8 text-xs"
                                                                placeholder={field}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                            Record all pathological discharges.
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {message && !error && (
                            <span className="text-xs text-emerald-600 font-medium">{message}</span>
                        )}
                        {error && (
                            <span className="text-xs text-red-600 font-medium">{error}</span>
                        )}
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="h-8 px-3 text-xs font-semibold rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            Save Elimination
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default EliminationSection;
