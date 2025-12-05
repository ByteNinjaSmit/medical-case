import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Microscope, Plus, FileText, Trash2, Edit2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const InvestigationsSection = ({ patientId }) => {
    const { API } = useAuth();
    const [investigations, setInvestigations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentInv, setCurrentInv] = useState(null); // null for new, object for edit
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: "",
        hb: "", wbc: "", rbc: "", esr: "", bloodSugar: "", lipidProfile: "",
        urineReport: "", stoolReport: "", radiology: "", ecg: "", other: "",
        reportSummary: "",
        values: []
    });

    const fetchInvestigations = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/user/patients/${patientId}/investigations`, {
                withCredentials: true,
            });
            setInvestigations(res?.data?.data || []);
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to load investigations";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestigations();
    }, [API, patientId]);

    const handleOpenDialog = (inv = null) => {
        if (inv) {
            setCurrentInv(inv);
            setFormData({
                date: inv.date ? inv.date.split('T')[0] : new Date().toISOString().split('T')[0],
                type: inv.type || "",
                hb: inv.hb || "", wbc: inv.wbc || "", rbc: inv.rbc || "", esr: inv.esr || "",
                bloodSugar: inv.bloodSugar || "", lipidProfile: inv.lipidProfile || "",
                urineReport: inv.urineReport || "", stoolReport: inv.stoolReport || "",
                radiology: inv.radiology || "", ecg: inv.ecg || "", other: inv.other || "",
                reportSummary: inv.reportSummary || "",
                values: Array.isArray(inv.values) ? inv.values : []
            });
        } else {
            setCurrentInv(null);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                type: "",
                hb: "", wbc: "", rbc: "", esr: "", bloodSugar: "", lipidProfile: "",
                urineReport: "", stoolReport: "", radiology: "", ecg: "", other: "",
                reportSummary: "",
                values: []
            });
        }
        setIsDialogOpen(true);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleValueChange = (index, field, value) => {
        setFormData(prev => {
            const newValues = [...prev.values];
            newValues[index] = { ...newValues[index], [field]: value };
            return { ...prev, values: newValues };
        });
    };

    const addValue = () => {
        setFormData(prev => ({
            ...prev,
            values: [...prev.values, { name: "", value: "", unit: "", referenceRange: "" }]
        }));
    };

    const removeValue = (index) => {
        setFormData(prev => {
            const newValues = [...prev.values];
            newValues.splice(index, 1);
            return { ...prev, values: newValues };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (currentInv) {
                await axios.put(`${API}/api/user/investigations/${currentInv._id}`, formData, { withCredentials: true });
                toast.success("Investigation updated successfully.");
            } else {
                await axios.post(`${API}/api/user/patients/${patientId}/investigations`, formData, { withCredentials: true });
                toast.success("Investigation created successfully.");
            }
            setIsDialogOpen(false);
            fetchInvestigations();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to save investigation";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this investigation?")) return;
        try {
            await axios.delete(`${API}/api/user/investigations/${id}`, { withCredentials: true });
            fetchInvestigations();
            toast.success("Investigation deleted successfully.");
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to delete investigation";
            toast.error(msg);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-slate-200 bg-white/90 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                                    <Microscope className="w-4 h-4" />
                                </span>
                                Investigations
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Lab reports, radiology, and other diagnostic tests.
                            </CardDescription>
                        </div>
                        <Button size="sm" onClick={() => handleOpenDialog()} className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add New
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading investigations...</div>
                    ) : investigations.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            No investigations recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {investigations.map((inv) => (
                                <div key={inv._id} className="group relative border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-slate-100 p-1.5 rounded text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-800">
                                                    {inv.date ? format(new Date(inv.date), "dd MMM yyyy") : "No Date"}
                                                </p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">{inv.type || "General Report"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpenDialog(inv)}>
                                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-red-600" onClick={() => handleDelete(inv._id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 mb-2">
                                        {inv.hb && <div><span className="font-semibold text-slate-500">Hb:</span> {inv.hb}</div>}
                                        {inv.wbc && <div><span className="font-semibold text-slate-500">WBC:</span> {inv.wbc}</div>}
                                        {inv.esr && <div><span className="font-semibold text-slate-500">ESR:</span> {inv.esr}</div>}
                                        {inv.bloodSugar && <div><span className="font-semibold text-slate-500">Sugar:</span> {inv.bloodSugar}</div>}
                                    </div>

                                    {inv.reportSummary && (
                                        <div className="text-xs text-slate-600 bg-slate-100/50 p-2 rounded mt-2">
                                            <span className="font-semibold">Summary: </span>{inv.reportSummary}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentInv ? "Edit Investigation" : "New Investigation"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs mb-1.5 block">Date</Label>
                                <Input type="date" value={formData.date} onChange={(e) => handleFormChange("date", e.target.value)} className="h-8 text-xs" />
                            </div>
                            <div>
                                <Label className="text-xs mb-1.5 block">Report Type</Label>
                                <Input value={formData.type} onChange={(e) => handleFormChange("type", e.target.value)} placeholder="e.g. CBC, X-Ray" className="h-8 text-xs" />
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-3">
                            <h3 className="text-sm font-semibold text-slate-800">Common Parameters</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {["hb", "wbc", "rbc", "esr", "bloodSugar", "lipidProfile"].map(field => (
                                    <div key={field}>
                                        <Label className="text-xs mb-1 block capitalize">{field}</Label>
                                        <Input value={formData[field]} onChange={(e) => handleFormChange(field, e.target.value)} className="h-8 text-xs" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-3">
                            <h3 className="text-sm font-semibold text-slate-800">Detailed Reports</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {["urineReport", "stoolReport", "radiology", "ecg", "other"].map(field => (
                                    <div key={field}>
                                        <Label className="text-xs mb-1 block capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                        <Textarea value={formData[field]} onChange={(e) => handleFormChange(field, e.target.value)} className="min-h-[60px] text-xs" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-slate-800">Specific Values</h3>
                                <Button size="sm" variant="ghost" onClick={addValue} className="h-6 text-xs"><Plus className="w-3 h-3 mr-1" /> Add Value</Button>
                            </div>
                            {formData.values.map((val, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input placeholder="Test Name" value={val.name} onChange={(e) => handleValueChange(idx, "name", e.target.value)} className="h-8 text-xs flex-1" />
                                    <Input placeholder="Value" value={val.value} onChange={(e) => handleValueChange(idx, "value", e.target.value)} className="h-8 text-xs w-20" />
                                    <Input placeholder="Unit" value={val.unit} onChange={(e) => handleValueChange(idx, "unit", e.target.value)} className="h-8 text-xs w-16" />
                                    <Input placeholder="Ref Range" value={val.referenceRange} onChange={(e) => handleValueChange(idx, "referenceRange", e.target.value)} className="h-8 text-xs w-24" />
                                    <Button size="icon" variant="ghost" onClick={() => removeValue(idx)} className="h-8 w-8 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2">
                            <Label className="text-xs mb-1.5 block">Overall Summary</Label>
                            <Textarea value={formData.reportSummary} onChange={(e) => handleFormChange("reportSummary", e.target.value)} className="text-xs" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-8 text-xs">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white">
                            {saving ? "Saving..." : "Save Report"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InvestigationsSection;
