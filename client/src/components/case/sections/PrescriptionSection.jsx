import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pill, Plus, Trash2, Calendar, Clock, Edit2 } from "lucide-react";
import { format } from "date-fns";

const PrescriptionSection = ({ patientId }) => {
    const { API } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPrescription, setCurrentPrescription] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        medicines: [],
        reason: "",
        followUpNotes: "",
        nextVisit: ""
    });

    const fetchPrescriptions = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/user/prescriptions/${patientId}`, { withCredentials: true });
            setPrescriptions(res?.data || []);
        } catch (e) {
            console.error("Failed to load prescriptions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, [API, patientId]);

    const handleOpenDialog = (item = null) => {
        if (item) {
            setCurrentPrescription(item);
            setFormData({
                medicines: Array.isArray(item.medicines) ? item.medicines : [],
                reason: item.reason || "",
                followUpNotes: item.followUpNotes || "",
                nextVisit: item.nextVisit ? item.nextVisit.split('T')[0] : ""
            });
        } else {
            setCurrentPrescription(null);
            setFormData({
                medicines: [{ name: "", potency: "", dosage: "", duration: "", instruction: "" }],
                reason: "",
                followUpNotes: "",
                nextVisit: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleMedicineChange = (index, field, value) => {
        setFormData(prev => {
            const newMeds = [...prev.medicines];
            newMeds[index] = { ...newMeds[index], [field]: value };
            return { ...prev, medicines: newMeds };
        });
    };

    const addMedicine = () => {
        setFormData(prev => ({
            ...prev,
            medicines: [...prev.medicines, { name: "", potency: "", dosage: "", duration: "", instruction: "" }]
        }));
    };

    const removeMedicine = (index) => {
        setFormData(prev => {
            const newMeds = [...prev.medicines];
            newMeds.splice(index, 1);
            return { ...prev, medicines: newMeds };
        });
    };

    const handleSave = async () => {
        if (formData.medicines.length === 0 || !formData.medicines[0].name) {
            alert("Please add at least one medicine name.");
            return;
        }
        setSaving(true);
        try {
            const payload = { ...formData, patientId };
            if (currentPrescription) {
                await axios.put(`${API}/api/user/prescriptions/${currentPrescription._id}`, payload, { withCredentials: true });
            } else {
                await axios.post(`${API}/api/user/prescriptions`, payload, { withCredentials: true });
            }
            setIsDialogOpen(false);
            fetchPrescriptions();
        } catch (e) {
            alert("Failed to save prescription");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this prescription?")) return;
        try {
            await axios.delete(`${API}/api/user/prescriptions/${id}`, { withCredentials: true });
            fetchPrescriptions();
        } catch (e) {
            alert("Failed to delete prescription");
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-slate-200 bg-white/90 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <Pill className="w-4 h-4" />
                                </span>
                                Prescriptions
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Manage medicines and treatment plans.
                            </CardDescription>
                        </div>
                        <Button size="sm" onClick={() => handleOpenDialog()} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="w-3.5 h-3.5 mr-1" /> New Prescription
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading prescriptions...</div>
                    ) : prescriptions.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            No prescriptions recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {prescriptions.map((p) => (
                                <div key={p._id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Date</div>
                                                    <div className="font-semibold text-slate-900 text-sm">
                                                        {p.date ? format(new Date(p.date), "dd MMM yyyy") : "No Date"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {p.nextVisit && (
                                                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-100">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Next: {format(new Date(p.nextVisit), "dd MMM yyyy")}
                                                    </div>
                                                )}
                                                <div className="flex gap-1 ml-2">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpenDialog(p)}>
                                                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-red-600" onClick={() => handleDelete(p._id)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                                                    Medicines
                                                </h4>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {p.medicines.map((med, i) => (
                                                        <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className="font-medium text-slate-900 text-sm">{med.name}</div>
                                                                {med.potency && (
                                                                    <span className="shrink-0 px-1.5 py-0.5 bg-white rounded text-[10px] font-medium text-slate-600 border border-slate-200">
                                                                        {med.potency}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-600 mt-1">
                                                                {med.dosage} {med.instruction && `• ${med.instruction}`}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {(p.reason || p.followUpNotes) && (
                                                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                                                    {p.reason && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Diagnosis / Reason</h4>
                                                            <p className="text-sm text-slate-700">{p.reason}</p>
                                                        </div>
                                                    )}
                                                    {p.followUpNotes && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</h4>
                                                            <p className="text-sm text-slate-700">{p.followUpNotes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentPrescription ? "Edit Prescription" : "New Prescription"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-slate-800">Medicines</h3>
                                <Button size="sm" variant="ghost" onClick={addMedicine} className="h-6 text-xs"><Plus className="w-3 h-3 mr-1" /> Add Medicine</Button>
                            </div>
                            {formData.medicines.map((med, idx) => (
                                <div key={idx} className="flex flex-wrap gap-2 items-center bg-slate-50 p-2 rounded border border-slate-100">
                                    <Input placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicineChange(idx, "name", e.target.value)} className="h-8 text-xs w-full sm:w-auto sm:flex-1" />
                                    <Input placeholder="Potency" value={med.potency} onChange={(e) => handleMedicineChange(idx, "potency", e.target.value)} className="h-8 text-xs w-20" />
                                    <Input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)} className="h-8 text-xs w-24" />
                                    <Input placeholder="Instruction" value={med.instruction} onChange={(e) => handleMedicineChange(idx, "instruction", e.target.value)} className="h-8 text-xs w-full sm:w-auto sm:flex-1" />
                                    <Button size="icon" variant="ghost" onClick={() => removeMedicine(idx)} className="h-8 w-8 text-red-500 shrink-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs mb-1.5 block">Diagnosis / Reason</Label>
                                <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="text-xs" />
                            </div>
                            <div>
                                <Label className="text-xs mb-1.5 block">Follow-up Notes</Label>
                                <Textarea value={formData.followUpNotes} onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })} className="text-xs" />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Next Visit Date</Label>
                            <Input type="date" value={formData.nextVisit} onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })} className="h-8 text-xs w-40" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-8 text-xs">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                            {saving ? "Saving..." : "Save Prescription"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PrescriptionSection;
