import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { History, Save, AlertCircle, Plus, Trash2 } from "lucide-react";

const HistorySection = ({ patientId }) => {
    const { API } = useAuth();

    const [form, setForm] = useState({
        pastHistory: {
            diseases: [],
            flags: { diabetes: false, asthma: false, hypertension: false, tuberculosis: false, jaundice: false, typhoid: false, skinDisease: false },
            surgeries: [],
            accidents: [],
            allergies: "",
            vaccinations: "",
        },
        familyHistory: {
            familyDiseases: { diabetes: false, hypertension: false, asthma: false, tuberculosis: false, cancer: false, psoriasis: false, psychiatricIllness: false },
            relationSpecific: [],
            consanguinity: "",
            notes: "",
        },
        personalHistory: {
            addictions: "",
            habits: "",
            occupationHazards: "",
            lifestyle: "",
        },
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("past");

    useEffect(() => {
        const fetchHistory = async () => {
            if (!patientId) return;
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`${API}/api/user/patients/${patientId}/history`, {
                    withCredentials: true,
                });
                const data = res?.data?.data;
                if (data) {
                    setForm({
                        pastHistory: {
                            diseases: Array.isArray(data.pastHistory?.diseases) ? data.pastHistory.diseases : [],
                            flags: data.pastHistory?.flags || { diabetes: false, asthma: false, hypertension: false, tuberculosis: false, jaundice: false, typhoid: false, skinDisease: false },
                            surgeries: Array.isArray(data.pastHistory?.surgeries) ? data.pastHistory.surgeries : [],
                            accidents: Array.isArray(data.pastHistory?.accidents) ? data.pastHistory.accidents : [],
                            allergies: data.pastHistory?.allergies || "",
                            vaccinations: data.pastHistory?.vaccinations || "",
                        },
                        familyHistory: {
                            familyDiseases: data.familyHistory?.familyDiseases || { diabetes: false, hypertension: false, asthma: false, tuberculosis: false, cancer: false, psoriasis: false, psychiatricIllness: false },
                            relationSpecific: Array.isArray(data.familyHistory?.relationSpecific) ? data.familyHistory.relationSpecific : [],
                            consanguinity: data.familyHistory?.consanguinity || "",
                            notes: data.familyHistory?.notes || "",
                        },
                        personalHistory: {
                            addictions: data.personalHistory?.addictions || "",
                            habits: data.personalHistory?.habits || "",
                            occupationHazards: data.personalHistory?.occupationHazards || "",
                            lifestyle: data.personalHistory?.lifestyle || "",
                        },
                    });
                }
            } catch (e) {
                setError(e?.response?.data?.message || e.message || "Failed to load history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [API, patientId]);

    const handleSimpleChange = (section, field, value) => {
        setForm((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    };

    const handleFlagChange = (section, subSection, key, checked) => {
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: { ...prev[section][subSection], [key]: checked },
            },
        }));
    };

    // Generic array handlers
    const addItem = (section, arrayName, itemTemplate) => {
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [arrayName]: [...prev[section][arrayName], itemTemplate],
            },
        }));
    };

    const removeItem = (section, arrayName, index) => {
        setForm((prev) => {
            const newArray = [...prev[section][arrayName]];
            newArray.splice(index, 1);
            return {
                ...prev,
                [section]: { ...prev[section], [arrayName]: newArray },
            };
        });
    };

    const updateItem = (section, arrayName, index, field, value) => {
        setForm((prev) => {
            const newArray = [...prev[section][arrayName]];
            newArray[index] = { ...newArray[index], [field]: value };
            return {
                ...prev,
                [section]: { ...prev[section], [arrayName]: newArray },
            };
        });
    };

    const handleSave = async () => {
        if (!patientId) return;
        setSaving(true);
        setError("");
        setMessage("");
        try {
            await axios.put(
                `${API}/api/user/patients/${patientId}/history`,
                form,
                { withCredentials: true }
            );
            setMessage("History saved successfully.");
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Failed to save history");
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
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                                    <History className="w-4 h-4" />
                                </span>
                                Medical History
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Past medical history, family history, and personal habits.
                            </CardDescription>
                        </div>
                        {saving && (
                            <span className="text-xs font-medium text-slate-500">Saving...</span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading history...</div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="past">Past History</TabsTrigger>
                                <TabsTrigger value="family">Family History</TabsTrigger>
                                <TabsTrigger value="personal">Personal History</TabsTrigger>
                            </TabsList>

                            {/* PAST HISTORY */}
                            <TabsContent value="past" className="space-y-6">
                                {/* Common Flags */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-700">Common Conditions (Check if present)</Label>
                                    <div className="flex flex-wrap gap-4">
                                        {Object.keys(form.pastHistory.flags).map((key) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`ph-${key}`}
                                                    checked={form.pastHistory.flags[key]}
                                                    onCheckedChange={(checked) => handleFlagChange("pastHistory", "flags", key, checked)}
                                                />
                                                <label
                                                    htmlFor={`ph-${key}`}
                                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                                >
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Diseases List */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-700">Other Diseases / Major Illnesses</Label>
                                        <Button size="sm" variant="ghost" onClick={() => addItem("pastHistory", "diseases", { name: "", year: "", treatmentTaken: "", outcome: "" })} className="h-6 text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                    {form.pastHistory.diseases.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-start mb-2">
                                            <Input placeholder="Disease Name" value={item.name} onChange={(e) => updateItem("pastHistory", "diseases", idx, "name", e.target.value)} className="h-8 text-xs" />
                                            <Input placeholder="Year" value={item.year} onChange={(e) => updateItem("pastHistory", "diseases", idx, "year", e.target.value)} className="h-8 text-xs w-20 shrink-0" />
                                            <Input placeholder="Treatment" value={item.treatmentTaken} onChange={(e) => updateItem("pastHistory", "diseases", idx, "treatmentTaken", e.target.value)} className="h-8 text-xs" />
                                            <Input placeholder="Outcome" value={item.outcome} onChange={(e) => updateItem("pastHistory", "diseases", idx, "outcome", e.target.value)} className="h-8 text-xs" />
                                            <Button size="icon" variant="ghost" onClick={() => removeItem("pastHistory", "diseases", idx)} className="h-8 w-8 shrink-0 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Surgeries */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-700">Surgeries</Label>
                                        <Button size="sm" variant="ghost" onClick={() => addItem("pastHistory", "surgeries", { type: "", year: "", complications: "" })} className="h-6 text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                    {form.pastHistory.surgeries.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-start mb-2">
                                            <Input placeholder="Surgery Type" value={item.type} onChange={(e) => updateItem("pastHistory", "surgeries", idx, "type", e.target.value)} className="h-8 text-xs" />
                                            <Input placeholder="Year" value={item.year} onChange={(e) => updateItem("pastHistory", "surgeries", idx, "year", e.target.value)} className="h-8 text-xs w-20 shrink-0" />
                                            <Input placeholder="Complications" value={item.complications} onChange={(e) => updateItem("pastHistory", "surgeries", idx, "complications", e.target.value)} className="h-8 text-xs" />
                                            <Button size="icon" variant="ghost" onClick={() => removeItem("pastHistory", "surgeries", idx)} className="h-8 w-8 shrink-0 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Accidents */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-700">Accidents / Trauma</Label>
                                        <Button size="sm" variant="ghost" onClick={() => addItem("pastHistory", "accidents", { type: "", year: "", effects: "" })} className="h-6 text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                    {form.pastHistory.accidents.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-start mb-2">
                                            <Input placeholder="Accident Type" value={item.type} onChange={(e) => updateItem("pastHistory", "accidents", idx, "type", e.target.value)} className="h-8 text-xs" />
                                            <Input placeholder="Year" value={item.year} onChange={(e) => updateItem("pastHistory", "accidents", idx, "year", e.target.value)} className="h-8 text-xs w-20 shrink-0" />
                                            <Input placeholder="After Effects" value={item.effects} onChange={(e) => updateItem("pastHistory", "accidents", idx, "effects", e.target.value)} className="h-8 text-xs" />
                                            <Button size="icon" variant="ghost" onClick={() => removeItem("pastHistory", "accidents", idx)} className="h-8 w-8 shrink-0 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Allergies</Label>
                                        <Textarea value={form.pastHistory.allergies} onChange={(e) => handleSimpleChange("pastHistory", "allergies", e.target.value)} placeholder="Food, drugs, dust, etc." className="text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Vaccinations</Label>
                                        <Textarea value={form.pastHistory.vaccinations} onChange={(e) => handleSimpleChange("pastHistory", "vaccinations", e.target.value)} placeholder="Vaccination history" className="text-xs sm:text-sm" />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* FAMILY HISTORY */}
                            <TabsContent value="family" className="space-y-6">
                                {/* Common Flags */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-700">Family Diseases (Check if present in family)</Label>
                                    <div className="flex flex-wrap gap-4">
                                        {Object.keys(form.familyHistory.familyDiseases).map((key) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`fh-${key}`}
                                                    checked={form.familyHistory.familyDiseases[key]}
                                                    onCheckedChange={(checked) => handleFlagChange("familyHistory", "familyDiseases", key, checked)}
                                                />
                                                <label
                                                    htmlFor={`fh-${key}`}
                                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                                >
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Relation Specific */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-700">Specific Relations & Diseases</Label>
                                        <Button size="sm" variant="ghost" onClick={() => addItem("familyHistory", "relationSpecific", { relation: "", disease: "", ageOfOnset: "" })} className="h-6 text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                    {form.familyHistory.relationSpecific.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-start mb-2">
                                            <Input placeholder="Relation (e.g. Father)" value={item.relation} onChange={(e) => updateItem("familyHistory", "relationSpecific", idx, "relation", e.target.value)} className="h-8 text-xs" />
                                            <Input placeholder="Disease" value={item.disease} onChange={(e) => updateItem("familyHistory", "relationSpecific", idx, "disease", e.target.value)} className="h-8 text-xs" />
                                            <Input placeholder="Age of Onset" value={item.ageOfOnset} onChange={(e) => updateItem("familyHistory", "relationSpecific", idx, "ageOfOnset", e.target.value)} className="h-8 text-xs" />
                                            <Button size="icon" variant="ghost" onClick={() => removeItem("familyHistory", "relationSpecific", idx)} className="h-8 w-8 shrink-0 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Consanguinity</Label>
                                        <Input value={form.familyHistory.consanguinity} onChange={(e) => handleSimpleChange("familyHistory", "consanguinity", e.target.value)} placeholder="Marriage between relatives?" className="text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Notes</Label>
                                        <Textarea value={form.familyHistory.notes} onChange={(e) => handleSimpleChange("familyHistory", "notes", e.target.value)} placeholder="Additional family history notes" className="text-xs sm:text-sm" />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PERSONAL HISTORY */}
                            <TabsContent value="personal" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Addictions</Label>
                                        <Textarea value={form.personalHistory.addictions} onChange={(e) => handleSimpleChange("personalHistory", "addictions", e.target.value)} placeholder="Tobacco, Alcohol, Drugs, etc." className="text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Habits</Label>
                                        <Textarea value={form.personalHistory.habits} onChange={(e) => handleSimpleChange("personalHistory", "habits", e.target.value)} placeholder="Nail biting, etc." className="text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Occupation Hazards</Label>
                                        <Textarea value={form.personalHistory.occupationHazards} onChange={(e) => handleSimpleChange("personalHistory", "occupationHazards", e.target.value)} placeholder="Chemical exposure, dust, stress, etc." className="text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block">Lifestyle</Label>
                                        <Textarea value={form.personalHistory.lifestyle} onChange={(e) => handleSimpleChange("personalHistory", "lifestyle", e.target.value)} placeholder="Sedentary, Active, etc." className="text-xs sm:text-sm" />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                            Thorough history taking is essential for chronic cases.
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
                            className="h-8 px-3 text-xs font-semibold rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            Save History
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default HistorySection;
