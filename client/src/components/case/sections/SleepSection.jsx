import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Save, AlertCircle, Moon } from "lucide-react";
import { toast } from "sonner";

const SleepSection = ({ patientId }) => {
    const { API } = useAuth();

    const [form, setForm] = useState({
        sleepQuality: "Normal",
        sleepPosition: "Variable",
        timeToSleep: "",
        earlyWaking: "",
        nightAwakenings: { reason: "", frequency: "" },
        disturbances: "",
        dreams: [],
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchSleep = async () => {
            if (!patientId) return;
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`${API}/api/user/patients/${patientId}/sleep-dreams`, {
                    withCredentials: true,
                });
                const data = res?.data?.data;
                if (data) {
                    setForm({
                        sleepQuality: data.sleepQuality || "Normal",
                        sleepPosition: data.sleepPosition || "Variable",
                        timeToSleep: data.timeToSleep || "",
                        earlyWaking: data.earlyWaking || "",
                        nightAwakenings: data.nightAwakenings || { reason: "", frequency: "" },
                        disturbances: data.disturbances || "",
                        dreams: Array.isArray(data.dreams) ? data.dreams : [],
                    });
                }
            } catch (e) {
                const msg = e?.response?.data?.message || e.message || "Failed to load sleep details";
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchSleep();
    }, [API, patientId]);

    const handleSimpleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (category, field, value) => {
        setForm((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value,
            },
        }));
    };

    const handleDreamChange = (index, field, value) => {
        setForm((prev) => {
            const newDreams = [...prev.dreams];
            newDreams[index] = { ...newDreams[index], [field]: value };
            return { ...prev, dreams: newDreams };
        });
    };

    const addDream = () => {
        setForm((prev) => ({
            ...prev,
            dreams: [...prev.dreams, { theme: "", frequency: "", emotionalTone: "", notes: "" }],
        }));
    };

    const removeDream = (index) => {
        setForm((prev) => {
            const newDreams = [...prev.dreams];
            newDreams.splice(index, 1);
            return { ...prev, dreams: newDreams };
        });
    };

    const handleSave = async () => {
        if (!patientId) return;
        setSaving(true);
        setError("");
        setMessage("");
        try {
            await axios.put(
                `${API}/api/user/patients/${patientId}/sleep-dreams`,
                form,
                { withCredentials: true }
            );
            const msg = "Sleep details saved successfully.";
            setMessage(msg);
            toast.success(msg);
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to save sleep details";
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
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    <Moon className="w-4 h-4" />
                                </span>
                                Sleep & Dreams
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Capture sleep patterns, position, and dream themes.
                            </CardDescription>
                        </div>
                        {saving && (
                            <span className="text-xs font-medium text-slate-500">Saving...</span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading sleep details...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Sleep Quality</Label>
                                            <Select
                                                value={form.sleepQuality}
                                                onValueChange={(v) => handleSimpleChange("sleepQuality", v)}
                                            >
                                                <SelectTrigger className="h-9 text-xs sm:text-sm">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["Light", "Deep", "Broken", "Restless", "Normal"].map((opt) => (
                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Sleep Position</Label>
                                            <Select
                                                value={form.sleepPosition}
                                                onValueChange={(v) => handleSimpleChange("sleepPosition", v)}
                                            >
                                                <SelectTrigger className="h-9 text-xs sm:text-sm">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["Back", "Side", "Stomach", "Variable", "Unknown"].map((opt) => (
                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1.5 block">Time to Sleep</Label>
                                        <Input
                                            value={form.timeToSleep || ""}
                                            onChange={(e) => handleSimpleChange("timeToSleep", e.target.value)}
                                            placeholder="e.g. 10 PM, late, variable"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1.5 block">Early Waking</Label>
                                        <Input
                                            value={form.earlyWaking || ""}
                                            onChange={(e) => handleSimpleChange("earlyWaking", e.target.value)}
                                            placeholder="e.g. 4 AM, with anxiety"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Awakening Reason</Label>
                                            <Input
                                                value={form.nightAwakenings.reason || ""}
                                                onChange={(e) => handleNestedChange("nightAwakenings", "reason", e.target.value)}
                                                placeholder="e.g. Urination, thirst"
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Awakening Freq</Label>
                                            <Input
                                                value={form.nightAwakenings.frequency || ""}
                                                onChange={(e) => handleNestedChange("nightAwakenings", "frequency", e.target.value)}
                                                placeholder="e.g. 2-3 times"
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Disturbances</Label>
                                        <Input
                                            value={form.disturbances || ""}
                                            onChange={(e) => handleSimpleChange("disturbances", e.target.value)}
                                            placeholder="e.g. Noise, light, thoughts"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b pb-1">
                                        <h3 className="text-sm font-semibold text-slate-800">Dreams</h3>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={addDream}
                                            className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            Add Dream
                                        </Button>
                                    </div>

                                    {form.dreams.length === 0 ? (
                                        <div className="text-xs text-slate-500 italic py-2">No dreams recorded.</div>
                                    ) : (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                            {form.dreams.map((dream, index) => (
                                                <div key={index} className="relative p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeDream(index)}
                                                        className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <div className="space-y-2 pr-6">
                                                        <div>
                                                            <Label className="text-[10px] mb-0.5 block uppercase tracking-wide text-slate-500">Theme</Label>
                                                            <Input
                                                                value={dream.theme || ""}
                                                                onChange={(e) => handleDreamChange(index, "theme", e.target.value)}
                                                                className="h-8 text-xs"
                                                                placeholder="e.g. Falling, snakes, dead people"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <Label className="text-[10px] mb-0.5 block uppercase tracking-wide text-slate-500">Frequency</Label>
                                                                <Input
                                                                    value={dream.frequency || ""}
                                                                    onChange={(e) => handleDreamChange(index, "frequency", e.target.value)}
                                                                    className="h-8 text-xs"
                                                                    placeholder="e.g. Recurrent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-[10px] mb-0.5 block uppercase tracking-wide text-slate-500">Emotional Tone</Label>
                                                                <Input
                                                                    value={dream.emotionalTone || ""}
                                                                    onChange={(e) => handleDreamChange(index, "emotionalTone", e.target.value)}
                                                                    className="h-8 text-xs"
                                                                    placeholder="e.g. Fearful"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-[10px] mb-0.5 block uppercase tracking-wide text-slate-500">Notes</Label>
                                                            <Input
                                                                value={dream.notes || ""}
                                                                onChange={(e) => handleDreamChange(index, "notes", e.target.value)}
                                                                className="h-8 text-xs"
                                                                placeholder="Additional details"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                            Dreams are often the key to the patient's subconscious state.
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
                            className="h-8 px-3 text-xs font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            Save Sleep
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default SleepSection;
