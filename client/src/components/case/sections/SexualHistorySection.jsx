import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Save, AlertCircle, CalendarDays } from "lucide-react";

const SexualHistorySection = ({ patientId, patientSex }) => {
    const { API } = useAuth();
    const isFemale = patientSex === "Female";

    const [sexualForm, setSexualForm] = useState({
        desireLevel: "",
        aversion: "",
        guiltOrConflict: "",
        male: { erectionQuality: "", emissions: "", debility: "", masturbationHistory: "", contraceptionUse: "", stdHistory: "", performanceAnxiety: "" },
        female: { libido: "", dyspareunia: "", vaginalDryness: "", discharges: "", contraceptionUse: "", obstetricHistory: "" },
        notes: "",
    });

    const [menstrualForm, setMenstrualForm] = useState({
        lmp: "",
        cycleLength: "",
        flowDuration: "",
        regularity: "",
        flowAmount: "",
        flowColor: "",
        clots: "",
        pain: { timing: "", character: "", location: "", modalities: "" },
        moodChanges: "",
        associatedSymptoms: "",
        obstetricHistory: "",
        menarcheAge: "",
        menopauseAge: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("sexual");

    useEffect(() => {
        const fetchData = async () => {
            if (!patientId) return;
            setLoading(true);
            setError("");
            try {
                const sexualRes = await axios.get(`${API}/api/user/patients/${patientId}/sexual-function`, { withCredentials: true });
                const sexualData = sexualRes?.data?.data;
                if (sexualData) {
                    setSexualForm({
                        desireLevel: sexualData.desireLevel || "",
                        aversion: sexualData.aversion || "",
                        guiltOrConflict: sexualData.guiltOrConflict || "",
                        male: sexualData.male || { erectionQuality: "", emissions: "", debility: "", masturbationHistory: "", contraceptionUse: "", stdHistory: "", performanceAnxiety: "" },
                        female: sexualData.female || { libido: "", dyspareunia: "", vaginalDryness: "", discharges: "", contraceptionUse: "", obstetricHistory: "" },
                        notes: sexualData.notes || "",
                    });
                }

                if (isFemale) {
                    const menstrualRes = await axios.get(`${API}/api/user/patients/${patientId}/menstrual-history`, { withCredentials: true });
                    const menstrualData = menstrualRes?.data?.data;
                    if (menstrualData) {
                        setMenstrualForm({
                            lmp: menstrualData.lmp ? menstrualData.lmp.split('T')[0] : "",
                            cycleLength: menstrualData.cycleLength || "",
                            flowDuration: menstrualData.flowDuration || "",
                            regularity: menstrualData.regularity || "",
                            flowAmount: menstrualData.flowAmount || "",
                            flowColor: menstrualData.flowColor || "",
                            clots: menstrualData.clots || "",
                            pain: menstrualData.pain || { timing: "", character: "", location: "", modalities: "" },
                            moodChanges: menstrualData.moodChanges || "",
                            associatedSymptoms: menstrualData.associatedSymptoms || "",
                            obstetricHistory: menstrualData.obstetricHistory || "",
                            menarcheAge: menstrualData.menarcheAge || "",
                            menopauseAge: menstrualData.menopauseAge || "",
                        });
                    }
                }
            } catch (e) {
                setError(e?.response?.data?.message || e.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API, patientId, isFemale]);

    const handleSexualChange = (field, value) => {
        setSexualForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSexualNestedChange = (category, field, value) => {
        setSexualForm((prev) => ({
            ...prev,
            [category]: { ...prev[category], [field]: value },
        }));
    };

    const handleMenstrualChange = (field, value) => {
        setMenstrualForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleMenstrualNestedChange = (category, field, value) => {
        setMenstrualForm((prev) => ({
            ...prev,
            [category]: { ...prev[category], [field]: value },
        }));
    };

    const handleSave = async () => {
        if (!patientId) return;
        setSaving(true);
        setError("");
        setMessage("");
        try {
            // Save Sexual Function
            await axios.put(
                `${API}/api/user/patients/${patientId}/sexual-function`,
                { ...sexualForm, gender: patientSex },
                { withCredentials: true }
            );

            // Save Menstrual History if female
            if (isFemale) {
                await axios.put(
                    `${API}/api/user/patients/${patientId}/menstrual-history`,
                    menstrualForm,
                    { withCredentials: true }
                );
            }

            setMessage("Details saved successfully.");
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Failed to save details");
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
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-700 border border-pink-100">
                                    <Heart className="w-4 h-4" />
                                </span>
                                Sexual & Reproductive History
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Capture sexual function and menstrual history (if applicable).
                            </CardDescription>
                        </div>
                        {saving && (
                            <span className="text-xs font-medium text-slate-500">Saving...</span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading details...</div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="sexual">Sexual Function</TabsTrigger>
                                {isFemale && <TabsTrigger value="menstrual">Menstrual History</TabsTrigger>}
                            </TabsList>

                            <TabsContent value="sexual" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Desire Level</Label>
                                        <Input
                                            value={sexualForm.desireLevel || ""}
                                            onChange={(e) => handleSexualChange("desireLevel", e.target.value)}
                                            placeholder="e.g. High, Low, Absent"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Aversion</Label>
                                        <Input
                                            value={sexualForm.aversion || ""}
                                            onChange={(e) => handleSexualChange("aversion", e.target.value)}
                                            placeholder="e.g. To coition, to opposite sex"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="text-xs mb-1.5 block">Guilt / Conflict</Label>
                                        <Input
                                            value={sexualForm.guiltOrConflict || ""}
                                            onChange={(e) => handleSexualChange("guiltOrConflict", e.target.value)}
                                            placeholder="e.g. Religious guilt, marital conflict"
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {isFemale ? (
                                    <div className="space-y-3 border-t pt-3">
                                        <h3 className="text-sm font-semibold text-slate-800">Female Specific</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {["libido", "dyspareunia", "vaginalDryness", "discharges", "contraceptionUse", "obstetricHistory"].map((field) => (
                                                <div key={field}>
                                                    <Label className="text-xs mb-1.5 block capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                                    <Input
                                                        value={sexualForm.female[field] || ""}
                                                        onChange={(e) => handleSexualNestedChange("female", field, e.target.value)}
                                                        className="text-xs sm:text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 border-t pt-3">
                                        <h3 className="text-sm font-semibold text-slate-800">Male Specific</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {["erectionQuality", "emissions", "debility", "masturbationHistory", "contraceptionUse", "stdHistory", "performanceAnxiety"].map((field) => (
                                                <div key={field}>
                                                    <Label className="text-xs mb-1.5 block capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                                    <Input
                                                        value={sexualForm.male[field] || ""}
                                                        onChange={(e) => handleSexualNestedChange("male", field, e.target.value)}
                                                        className="text-xs sm:text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Label className="text-xs mb-1.5 block">Additional Notes</Label>
                                    <Textarea
                                        value={sexualForm.notes || ""}
                                        onChange={(e) => handleSexualChange("notes", e.target.value)}
                                        placeholder="Any other sexual history details..."
                                        className="text-xs sm:text-sm min-h-[80px]"
                                    />
                                </div>
                            </TabsContent>

                            {isFemale && (
                                <TabsContent value="menstrual" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-xs mb-1.5 block">LMP</Label>
                                            <Input
                                                type="date"
                                                value={menstrualForm.lmp || ""}
                                                onChange={(e) => handleMenstrualChange("lmp", e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Cycle Length</Label>
                                            <Input
                                                value={menstrualForm.cycleLength || ""}
                                                onChange={(e) => handleMenstrualChange("cycleLength", e.target.value)}
                                                placeholder="e.g. 28 days"
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Flow Duration</Label>
                                            <Input
                                                value={menstrualForm.flowDuration || ""}
                                                onChange={(e) => handleMenstrualChange("flowDuration", e.target.value)}
                                                placeholder="e.g. 4-5 days"
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {["regularity", "flowAmount", "flowColor", "clots", "moodChanges", "associatedSymptoms", "obstetricHistory"].map((field) => (
                                            <div key={field}>
                                                <Label className="text-xs mb-1.5 block capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                                <Input
                                                    value={menstrualForm[field] || ""}
                                                    onChange={(e) => handleMenstrualChange(field, e.target.value)}
                                                    className="text-xs sm:text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 border-t pt-3">
                                        <h3 className="text-sm font-semibold text-slate-800">Pain (Dysmenorrhea)</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {["timing", "character", "location", "modalities"].map((field) => (
                                                <div key={field}>
                                                    <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                                                    <Input
                                                        value={menstrualForm.pain[field] || ""}
                                                        onChange={(e) => handleMenstrualNestedChange("pain", field, e.target.value)}
                                                        className="text-xs sm:text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Menarche Age</Label>
                                            <Input
                                                type="number"
                                                value={menstrualForm.menarcheAge || ""}
                                                onChange={(e) => handleMenstrualChange("menarcheAge", e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1.5 block">Menopause Age</Label>
                                            <Input
                                                type="number"
                                                value={menstrualForm.menopauseAge || ""}
                                                onChange={(e) => handleMenstrualChange("menopauseAge", e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            )}
                        </Tabs>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                            Sensitive information. Ensure privacy while recording.
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
                            className="h-8 px-3 text-xs font-semibold rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            Save Details
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default SexualHistorySection;
