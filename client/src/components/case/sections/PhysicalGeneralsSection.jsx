import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Activity, Save, AlertCircle } from "lucide-react";

const PhysicalGeneralsSection = ({ patientId }) => {
  const { API } = useAuth();

  const [form, setForm] = useState({
    appearance: { bodyType: "", complexion: "", build: "", gait: "", generalLook: "" },
    skin: { color: "", texture: "", eruptions: "", itching: "", dryness: "", sensitivity: "" },
    hair: { type: "", fall: "", color: "", dandruff: "" },
    nails: { brittleness: "", color: "", shape: "", thickness: "" },
    face: { expression: "", puffiness: "", discoloration: "" },
    eyes: { complaints: "", modalities: "" },
    ears: { complaints: "", discharges: "" },
    mouthTeeth: { tongue: "", ulcers: "", gums: "", teeth: "" },
    perspiration: { distribution: "", odour: "", staining: "", amount: "", temperature: "" },
    extremities: { swelling: "", tremors: "", weakness: "" },
    dietRoutine: { mealPattern: "", addictions: "", physicalActivity: "", sleepSchedule: "" },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPhysicalGenerals = async () => {
      if (!patientId) return;
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API}/api/user/patients/${patientId}/physical-generals`, {
          withCredentials: true,
        });
        const data = res?.data?.data;
        if (data) {
          setForm({
            appearance: data.appearance || { bodyType: "", complexion: "", build: "", gait: "", generalLook: "" },
            skin: data.skin || { color: "", texture: "", eruptions: "", itching: "", dryness: "", sensitivity: "" },
            hair: data.hair || { type: "", fall: "", color: "", dandruff: "" },
            nails: data.nails || { brittleness: "", color: "", shape: "", thickness: "" },
            face: data.face || { expression: "", puffiness: "", discoloration: "" },
            eyes: data.eyes || { complaints: "", modalities: "" },
            ears: data.ears || { complaints: "", discharges: "" },
            mouthTeeth: data.mouthTeeth || { tongue: "", ulcers: "", gums: "", teeth: "" },
            perspiration: data.perspiration || { distribution: "", odour: "", staining: "", amount: "", temperature: "" },
            extremities: data.extremities || { swelling: "", tremors: "", weakness: "" },
            dietRoutine: data.dietRoutine || { mealPattern: "", addictions: "", physicalActivity: "", sleepSchedule: "" },
          });
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load physical generals");
      } finally {
        setLoading(false);
      }
    };

    fetchPhysicalGenerals();
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

  const handleSave = async () => {
    if (!patientId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await axios.put(
        `${API}/api/user/patients/${patientId}/physical-generals`,
        form,
        { withCredentials: true }
      );
      setMessage("Physical generals saved successfully.");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to save physical generals");
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
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <Activity className="w-4 h-4" />
                </span>
                Physical Generals
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Capture physical characteristics, appearance, and general symptoms.
              </CardDescription>
            </div>
            {saving && (
              <span className="text-xs font-medium text-slate-500">Saving...</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-sm text-slate-500">Loading physical generals...</div>
          ) : (
            <>
              {/* Appearance */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Appearance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["bodyType", "complexion", "build", "gait", "generalLook"].map((field) => (
                    <div key={field}>
                      <Label className="text-xs mb-1.5 block capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Input
                        value={form.appearance[field] || ""}
                        onChange={(e) => handleNestedChange("appearance", field, e.target.value)}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skin */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Skin</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["color", "texture", "eruptions", "itching", "dryness", "sensitivity"].map((field) => (
                    <div key={field}>
                      <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                      <Input
                        value={form.skin[field] || ""}
                        onChange={(e) => handleNestedChange("skin", field, e.target.value)}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

               {/* Hair & Nails */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Hair</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["type", "fall", "color", "dandruff"].map((field) => (
                            <div key={field}>
                            <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                            <Input
                                value={form.hair[field] || ""}
                                onChange={(e) => handleNestedChange("hair", field, e.target.value)}
                                className="text-xs sm:text-sm"
                            />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Nails</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["brittleness", "color", "shape", "thickness"].map((field) => (
                            <div key={field}>
                            <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                            <Input
                                value={form.nails[field] || ""}
                                onChange={(e) => handleNestedChange("nails", field, e.target.value)}
                                className="text-xs sm:text-sm"
                            />
                            </div>
                        ))}
                    </div>
                </div>
               </div>

              {/* Head & Face */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Face</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {["expression", "puffiness", "discoloration"].map((field) => (
                            <div key={field}>
                            <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                            <Input
                                value={form.face[field] || ""}
                                onChange={(e) => handleNestedChange("face", field, e.target.value)}
                                className="text-xs sm:text-sm"
                            />
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Eyes & Ears</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label className="text-xs mb-1.5 block">Eyes Complaints</Label>
                            <Input value={form.eyes.complaints || ""} onChange={(e) => handleNestedChange("eyes", "complaints", e.target.value)} className="text-xs sm:text-sm" />
                        </div>
                         <div>
                            <Label className="text-xs mb-1.5 block">Eyes Modalities</Label>
                            <Input value={form.eyes.modalities || ""} onChange={(e) => handleNestedChange("eyes", "modalities", e.target.value)} className="text-xs sm:text-sm" />
                        </div>
                         <div>
                            <Label className="text-xs mb-1.5 block">Ears Complaints</Label>
                            <Input value={form.ears.complaints || ""} onChange={(e) => handleNestedChange("ears", "complaints", e.target.value)} className="text-xs sm:text-sm" />
                        </div>
                         <div>
                            <Label className="text-xs mb-1.5 block">Ears Discharges</Label>
                            <Input value={form.ears.discharges || ""} onChange={(e) => handleNestedChange("ears", "discharges", e.target.value)} className="text-xs sm:text-sm" />
                        </div>
                    </div>
                 </div>
              </div>

              {/* Mouth & Perspiration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Mouth & Teeth</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["tongue", "ulcers", "gums", "teeth"].map((field) => (
                            <div key={field}>
                            <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                            <Input
                                value={form.mouthTeeth[field] || ""}
                                onChange={(e) => handleNestedChange("mouthTeeth", field, e.target.value)}
                                className="text-xs sm:text-sm"
                            />
                            </div>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Perspiration</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["distribution", "odour", "staining", "amount", "temperature"].map((field) => (
                            <div key={field}>
                            <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                            <Input
                                value={form.perspiration[field] || ""}
                                onChange={(e) => handleNestedChange("perspiration", field, e.target.value)}
                                className="text-xs sm:text-sm"
                            />
                            </div>
                        ))}
                    </div>
                  </div>
              </div>

              {/* Extremities & Diet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Extremities</h3>
                     <div className="grid grid-cols-1 gap-4">
                        {["swelling", "tremors", "weakness"].map((field) => (
                            <div key={field}>
                            <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
                            <Input
                                value={form.extremities[field] || ""}
                                onChange={(e) => handleNestedChange("extremities", field, e.target.value)}
                                className="text-xs sm:text-sm"
                            />
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-1">Diet & Routine</h3>
                     <div className="grid grid-cols-1 gap-4">
                        {["mealPattern", "addictions", "physicalActivity", "sleepSchedule"].map((field) => (
                            <div key={field}>
                            <Label className="text-xs mb-1.5 block capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                            <Input
                                value={form.dietRoutine[field] || ""}
                                onChange={(e) => handleNestedChange("dietRoutine", field, e.target.value)}
                                className="text-xs sm:text-sm"
                            />
                            </div>
                        ))}
                    </div>
                 </div>
              </div>

            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Capture detailed physical characteristics for accurate diagnosis.
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
              className="h-8 px-3 text-xs font-semibold rounded-full bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Save Physical Generals
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PhysicalGeneralsSection;
