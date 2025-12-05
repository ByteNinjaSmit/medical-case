import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ThermometerSun, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const ThermalSection = ({ patientId }) => {
    const { API } = useAuth();

    const [form, setForm] = useState({
        thermalState: "Neutral",
        sunReaction: "",
        moonReaction: "",
        noiseSensitivity: "",
        bathPreference: "",
        weatherPreference: "",
        seasonWorse: "",
        seasonBetter: "",
        coveringPreference: "",
        roomTemperaturePreference: "",
        generalModalities: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchThermal = async () => {
            if (!patientId) return;
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`${API}/api/user/patients/${patientId}/thermal-modalities`, {
                    withCredentials: true,
                });
                const data = res?.data?.data;
                if (data) {
                    setForm({
                        thermalState: data.thermalState || "Neutral",
                        sunReaction: data.sunReaction || "",
                        moonReaction: data.moonReaction || "",
                        noiseSensitivity: data.noiseSensitivity || "",
                        bathPreference: data.bathPreference || "",
                        weatherPreference: data.weatherPreference || "",
                        seasonWorse: data.seasonWorse || "",
                        seasonBetter: data.seasonBetter || "",
                        coveringPreference: data.coveringPreference || "",
                        roomTemperaturePreference: data.roomTemperaturePreference || "",
                        generalModalities: data.generalModalities || "",
                    });
                }
            } catch (e) {
                const msg = e?.response?.data?.message || e.message || "Failed to load thermal modalities";
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchThermal();
    }, [API, patientId]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!patientId) return;
        setSaving(true);
        setError("");
        setMessage("");
        try {
            await axios.put(
                `${API}/api/user/patients/${patientId}/thermal-modalities`,
                form,
                { withCredentials: true }
            );
            const msg = "Thermal modalities saved successfully.";
            setMessage(msg);
            toast.success(msg);
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to save thermal modalities";
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
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                                    <ThermometerSun className="w-4 h-4" />
                                </span>
                                Thermal Modalities
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Capture the patient's thermal state and general sensitivities.
                            </CardDescription>
                        </div>
                        {saving && (
                            <span className="text-xs font-medium text-slate-500">Saving...</span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading thermal modalities...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Thermal State</Label>
                                        <Select
                                            value={form.thermalState}
                                            onValueChange={(v) => handleChange("thermalState", v)}
                                        >
                                            <SelectTrigger className="h-9 text-xs sm:text-sm">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Hot">Hot (Aggravation from heat)</SelectItem>
                                                <SelectItem value="Cold">Chilly (Aggravation from cold)</SelectItem>
                                                <SelectItem value="Neutral">Neutral / Ambithermal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1.5 block">Reaction to Sun</Label>
                                        <Input
                                            value={form.sunReaction || ""}
                                            onChange={(e) => handleChange("sunReaction", e.target.value)}
                                            placeholder="e.g. Headache, burns easily, loves sun"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1.5 block">Reaction to Moon</Label>
                                        <Input
                                            value={form.moonReaction || ""}
                                            onChange={(e) => handleChange("moonReaction", e.target.value)}
                                            placeholder="e.g. Worse during full moon"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1.5 block">Noise Sensitivity</Label>
                                        <Input
                                            value={form.noiseSensitivity || ""}
                                            onChange={(e) => handleChange("noiseSensitivity", e.target.value)}
                                            placeholder="e.g. Irritable, startles easily"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1.5 block">Bath Preference</Label>
                                        <Input
                                            value={form.bathPreference || ""}
                                            onChange={(e) => handleChange("bathPreference", e.target.value)}
                                            placeholder="e.g. Hot, Cold, Lukewarm"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Weather Preference</Label>
                                        <Input
                                            value={form.weatherPreference || ""}
                                            onChange={(e) => handleChange("weatherPreference", e.target.value)}
                                            placeholder="e.g. Loves rain, hates wind"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Season Worse</Label>
                                            <Input
                                                value={form.seasonWorse || ""}
                                                onChange={(e) => handleChange("seasonWorse", e.target.value)}
                                                placeholder="e.g. Winter"
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Season Better</Label>
                                            <Input
                                                value={form.seasonBetter || ""}
                                                onChange={(e) => handleChange("seasonBetter", e.target.value)}
                                                placeholder="e.g. Summer"
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1.5 block">Covering Preference</Label>
                                        <Input
                                            value={form.coveringPreference || ""}
                                            onChange={(e) => handleChange("coveringPreference", e.target.value)}
                                            placeholder="e.g. Thin sheet, heavy blanket, feet uncovered"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1.5 block">Room Temp Preference</Label>
                                        <Input
                                            value={form.roomTemperaturePreference || ""}
                                            onChange={(e) => handleChange("roomTemperaturePreference", e.target.value)}
                                            placeholder="e.g. Fan on full speed, AC needed"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs mb-1.5 block">General Modalities</Label>
                                <Textarea
                                    value={form.generalModalities || ""}
                                    onChange={(e) => handleChange("generalModalities", e.target.value)}
                                    placeholder="Other general aggravations or ameliorations (time, position, etc.)"
                                    className="text-xs sm:text-sm min-h-[80px]"
                                />
                            </div>
                        </>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                            Thermal state is a key eliminator in repertorization.
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
                            className="h-8 px-3 text-xs font-semibold rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            Save Thermals
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default ThermalSection;
