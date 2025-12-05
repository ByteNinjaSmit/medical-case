import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarClock, Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const FollowUpSection = ({ patientId }) => {
    const { API } = useAuth();
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentFollowUp, setCurrentFollowUp] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        patientState: "",
        changesInComplaints: "",
        changesInGenerals: "",
        remedyReaction: "",
        nextPrescription: "",
        nextVisitDate: "",
        notes: ""
    });

    const fetchFollowUps = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/user/patients/${patientId}/followups`, { withCredentials: true });
            setFollowUps(res?.data?.data || []);
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to load follow-ups";
            console.error("Failed to load follow-ups", e);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowUps();
    }, [API, patientId]);

    const handleOpenDialog = (item = null) => {
        if (item) {
            setCurrentFollowUp(item);
            setFormData({
                date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
                patientState: item.patientState || "",
                changesInComplaints: item.changesInComplaints || "",
                changesInGenerals: item.changesInGenerals || "",
                remedyReaction: item.remedyReaction || "",
                nextPrescription: item.nextPrescription || "",
                nextVisitDate: item.nextVisitDate ? item.nextVisitDate.split('T')[0] : "",
                notes: item.notes || ""
            });
        } else {
            setCurrentFollowUp(null);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                patientState: "",
                changesInComplaints: "",
                changesInGenerals: "",
                remedyReaction: "",
                nextPrescription: "",
                nextVisitDate: "",
                notes: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (currentFollowUp) {
                await axios.put(`${API}/api/user/followups/${currentFollowUp._id}`, formData, { withCredentials: true });
                toast.success("Follow-up updated successfully.");
            } else {
                await axios.post(`${API}/api/user/patients/${patientId}/followups`, formData, { withCredentials: true });
                toast.success("Follow-up created successfully.");
            }
            setIsDialogOpen(false);
            fetchFollowUps();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to save follow-up";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this follow-up record?")) return;
        try {
            await axios.delete(`${API}/api/user/followups/${id}`, { withCredentials: true });
            fetchFollowUps();
            toast.success("Follow-up deleted successfully.");
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Failed to delete follow-up";
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
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-700 border border-green-100">
                                    <CalendarClock className="w-4 h-4" />
                                </span>
                                Follow-ups
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Track patient progress and remedy reactions over time.
                            </CardDescription>
                        </div>
                        <Button size="sm" onClick={() => handleOpenDialog()} className="h-8 text-xs bg-green-600 hover:bg-green-700">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Follow-up
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading follow-ups...</div>
                    ) : followUps.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            No follow-ups recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {followUps.map((item) => (
                                <div key={item._id} className="relative border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-slate-100 p-1.5 rounded text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {item.date ? format(new Date(item.date), "dd MMM yyyy") : "No Date"}
                                                </p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Visit Date</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpenDialog(item)}>
                                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-red-600" onClick={() => handleDelete(item._id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                                        {item.patientState && (
                                            <div className="bg-white p-2 rounded border border-slate-100">
                                                <span className="font-semibold block text-slate-500 mb-1">General State:</span>
                                                {item.patientState}
                                            </div>
                                        )}
                                        {item.changesInComplaints && (
                                            <div className="bg-white p-2 rounded border border-slate-100">
                                                <span className="font-semibold block text-slate-500 mb-1">Changes in Complaints:</span>
                                                {item.changesInComplaints}
                                            </div>
                                        )}
                                        {item.remedyReaction && (
                                            <div className="bg-white p-2 rounded border border-slate-100">
                                                <span className="font-semibold block text-slate-500 mb-1">Remedy Reaction:</span>
                                                {item.remedyReaction}
                                            </div>
                                        )}
                                        {item.nextPrescription && (
                                            <div className="bg-white p-2 rounded border border-slate-100">
                                                <span className="font-semibold block text-slate-500 mb-1">Next Prescription:</span>
                                                {item.nextPrescription}
                                            </div>
                                        )}
                                    </div>

                                    {item.nextVisitDate && (
                                        <div className="mt-3 text-xs font-medium text-blue-600 flex items-center gap-1">
                                            <CalendarClock className="w-3 h-3" />
                                            Next Visit: {format(new Date(item.nextVisitDate), "dd MMM yyyy")}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentFollowUp ? "Edit Follow-up" : "New Follow-up"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs mb-1.5 block">Visit Date</Label>
                                <Input type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)} className="h-8 text-xs" />
                            </div>
                            <div>
                                <Label className="text-xs mb-1.5 block">Next Visit Date</Label>
                                <Input type="date" value={formData.nextVisitDate} onChange={(e) => handleChange("nextVisitDate", e.target.value)} className="h-8 text-xs" />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Patient's General State</Label>
                            <Textarea value={formData.patientState} onChange={(e) => handleChange("patientState", e.target.value)} placeholder="How is the patient feeling overall?" className="text-xs min-h-[60px]" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs mb-1.5 block">Changes in Complaints</Label>
                                <Textarea value={formData.changesInComplaints} onChange={(e) => handleChange("changesInComplaints", e.target.value)} placeholder="Better/Worse/Same" className="text-xs min-h-[80px]" />
                            </div>
                            <div>
                                <Label className="text-xs mb-1.5 block">Changes in Generals</Label>
                                <Textarea value={formData.changesInGenerals} onChange={(e) => handleChange("changesInGenerals", e.target.value)} placeholder="Appetite, Sleep, etc." className="text-xs min-h-[80px]" />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Remedy Reaction / Assessment</Label>
                            <Input value={formData.remedyReaction} onChange={(e) => handleChange("remedyReaction", e.target.value)} placeholder="e.g. Aggravation, Amelioration" className="h-8 text-xs" />
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Prescription / Plan</Label>
                            <Textarea value={formData.nextPrescription} onChange={(e) => handleChange("nextPrescription", e.target.value)} placeholder="Medicine given or planned" className="text-xs" />
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Internal Notes</Label>
                            <Input value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="Private notes" className="h-8 text-xs" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-8 text-xs">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white">
                            {saving ? "Saving..." : "Save Record"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FollowUpSection;
