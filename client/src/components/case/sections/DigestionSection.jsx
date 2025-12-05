import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Utensils, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const cravingOptions = ["Sweet", "Salty", "Spicy", "Sour", "Eggs", "Milk", "Fried", "Cold Drinks"];
const aversionOptions = ["Milk", "Oil/Fats", "Rice", "Spices", "Sweets", "Warm Food", "Cold Food"];

const DigestionSection = ({ patientId }) => {
  const { API } = useAuth();

  const [form, setForm] = useState({
    acidity: "None",
    appetite: "Normal",
    colics: { present: false, description: "" },
    eructations: "",
    flatulence: { location: "None", description: "" },
    hungerPattern: "",
    nausea: { description: "", timing: "", modalities: "" },
    salivation: "",
    taste: "",
    thirstLevel: 5,
    thirstNote: "",
    cravings: [],
    cravingsNote: "",
    aversions: [],
    aversionsNote: "",
    foodReactions: [],
    foodEffectsNote: "",
    generalModalities: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newFoodItem, setNewFoodItem] = useState("");
  const [newFoodEffect, setNewFoodEffect] = useState("");

  useEffect(() => {
    const fetchDigestion = async () => {
      if (!patientId) return;
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API}/api/user/patients/${patientId}/digestion`, {
          withCredentials: true,
        });
        const data = res?.data?.data;
        if (data) {
          setForm({
            acidity: data.acidity || "None",
            appetite: data.appetite || "Normal",
            colics: data.colics || { present: false, description: "" },
            eructations: data.eructations || "",
            flatulence: data.flatulence || { location: "None", description: "" },
            hungerPattern: data.hungerPattern || "",
            nausea: data.nausea || { description: "", timing: "", modalities: "" },
            salivation: data.salivation || "",
            taste: data.taste || "",
            thirstLevel: typeof data.thirstLevel === "number" ? data.thirstLevel : 5,
            thirstNote: data.thirstNote || "",
            cravings: Array.isArray(data.cravings) ? data.cravings : [],
            cravingsNote: data.cravingsNote || "",
            aversions: Array.isArray(data.aversions) ? data.aversions : [],
            aversionsNote: data.aversionsNote || "",
            foodReactions: Array.isArray(data.foodReactions) ? data.foodReactions : [],
            foodEffectsNote: data.foodEffectsNote || "",
            generalModalities: data.generalModalities || "",
            notes: data.notes || "",
          });
        }
      } catch (e) {
        const msg = e?.response?.data?.message || e.message || "Failed to load digestion section";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDigestion();
  }, [API, patientId]);

  const handleSimpleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (path, value) => {
    setForm((prev) => {
      const clone = { ...prev };
      let ref = clone;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        ref[key] = ref[key] || {};
        ref = ref[key];
      }
      ref[path[path.length - 1]] = value;
      return clone;
    });
  };

  const toggleArrayValue = (field, option) => {
    setForm((prev) => {
      const arr = Array.isArray(prev[field]) ? [...prev[field]] : [];
      const idx = arr.indexOf(option);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(option);
      return { ...prev, [field]: arr };
    });
  };

  const addFoodReaction = () => {
    const item = newFoodItem.trim();
    const effect = newFoodEffect.trim();
    if (!item || !effect) return;
    setForm((prev) => ({
      ...prev,
      foodReactions: [...(prev.foodReactions || []), { item, effect }],
    }));
    setNewFoodItem("");
    setNewFoodEffect("");
  };

  const handleSave = async () => {
    if (!patientId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
      };
      const res = await axios.put(
        `${API}/api/user/patients/${patientId}/digestion`,
        payload,
        { withCredentials: true }
      );
      const msg = "Digestion details saved successfully.";
      setMessage(msg);
      toast.success(msg);
      const data = res?.data?.data;
      if (data && typeof data.thirstLevel === "number") {
        setForm((prev) => ({ ...prev, thirstLevel: data.thirstLevel }));
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to save digestion section";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const thirstLabel = (() => {
    if (form.thirstLevel <= 3) return "Low";
    if (form.thirstLevel >= 7) return "High";
    return "Normal";
  })();

  const cravingsSummary =
    form.cravingsNote ||
    (form.cravings && form.cravings.length ? form.cravings.join(", ") : "None");

  const aversionsSummary =
    form.aversionsNote ||
    (form.aversions && form.aversions.length ? form.aversions.join(", ") : "None");

  const thirstSummary = `Thirst: ${thirstLabel} (${form.thirstLevel}/10${
    form.thirstNote ? `, ${form.thirstNote}` : ""
  })`;

  const summaryText = `Acidity: ${form.acidity || "-"}; Appetite: ${
    form.appetite || "-"
  }; ${thirstSummary}; Cravings: ${cravingsSummary}; Aversions: ${aversionsSummary}.`;

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
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-700 border border-red-100">
                  <Utensils className="w-4 h-4" />
                </span>
                Digestion & Gastrointestinal Profile
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Capture appetite, acidity, thirst, cravings, aversions and food reactions for repertorization.
              </CardDescription>
            </div>
            {saving && (
              <span className="text-xs font-medium text-slate-500">Saving...</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-sm text-slate-500">Loading digestion details...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Acidity</Label>
                      <Select
                        value={form.acidity}
                        onValueChange={(v) => handleSimpleChange("acidity", v)}
                      >
                        <SelectTrigger className="h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Mild">Mild</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Appetite</Label>
                      <Select
                        value={form.appetite}
                        onValueChange={(v) => handleSimpleChange("appetite", v)}
                      >
                        <SelectTrigger className="h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Variable">Variable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Salivation</Label>
                      <Input
                        value={form.salivation || ""}
                        onChange={(e) => handleSimpleChange("salivation", e.target.value)}
                        placeholder="e.g. Excess, scanty, sticky, drooling, etc."
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs mb-1 block">Thirst (0–10)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[form.thirstLevel ?? 5]}
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(val) =>
                          handleSimpleChange("thirstLevel", Array.isArray(val) ? val[0] ?? 5 : 5)
                        }
                      />
                      <div className="w-16 text-xs text-right text-slate-600">
                        {form.thirstLevel}/10
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          {thirstLabel}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label className="text-[11px] mb-1 block">Thirst description (text)</Label>
                      <Input
                        value={form.thirstNote || ""}
                        onChange={(e) => handleSimpleChange("thirstNote", e.target.value)}
                        placeholder="e.g. Very thirsty but drinks small quantities; thirstless even in heat, etc."
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Hunger pattern</Label>
                      <Input
                        value={form.hungerPattern || ""}
                        onChange={(e) => handleSimpleChange("hungerPattern", e.target.value)}
                        placeholder="e.g. Frequent hunger, no desire to eat, empty feeling, etc."
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Taste in mouth</Label>
                      <Input
                        value={form.taste || ""}
                        onChange={(e) => handleSimpleChange("taste", e.target.value)}
                        placeholder="e.g. Bitter, sour, metallic, foul, etc."
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Colics</Label>
                      <Input
                        value={form.colics?.description || ""}
                        onChange={(e) =>
                          handleNestedChange(["colics", "description"], e.target.value)
                        }
                        placeholder="Describe colicky pains, location, timing, modalities"
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Eructations</Label>
                      <Input
                        value={form.eructations || ""}
                        onChange={(e) => handleSimpleChange("eructations", e.target.value)}
                        placeholder="e.g. Sour, bitter, foul, gaseous, etc."
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Flatulence</Label>
                      <Input
                        value={form.flatulence?.description || ""}
                        onChange={(e) =>
                          handleNestedChange(["flatulence", "description"], e.target.value)
                        }
                        placeholder="Upper abdomen, lower abdomen, shifting, noisy, etc."
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Flatulence Location</Label>
                      <Select
                        value={form.flatulence?.location || "None"}
                        onValueChange={(v) => handleNestedChange(["flatulence", "location"], v)}
                      >
                        <SelectTrigger className="h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Upper Abdomen">Upper Abdomen</SelectItem>
                          <SelectItem value="Lower Abdomen">Lower Abdomen</SelectItem>
                          <SelectItem value="Generalized">Generalized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label className="text-xs mb-1.5 block">Nausea</Label>
                      <Textarea
                        value={form.nausea?.description || ""}
                        onChange={(e) =>
                          handleNestedChange(["nausea", "description"], e.target.value)
                        }
                        placeholder="Describe character of nausea, associated sensations"
                        className="text-xs sm:text-sm min-h-[60px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs mb-1 block">Nausea timing</Label>
                        <Input
                          value={form.nausea?.timing || ""}
                          onChange={(e) =>
                            handleNestedChange(["nausea", "timing"], e.target.value)
                          }
                          placeholder="e.g. Morning, after eating, during travel"
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Nausea modalities</Label>
                        <Input
                          value={form.nausea?.modalities || ""}
                          onChange={(e) =>
                            handleNestedChange(["nausea", "modalities"], e.target.value)
                          }
                          placeholder="Better/worse by food, motion, open air, etc."
                          className="text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 space-y-4">
                  <div className="border border-slate-200 rounded-xl bg-slate-50/80 p-3 sm:p-4">
                    <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                        GI
                      </span>
                      Snapshot Summary
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {summaryText}
                    </p>
                    {form.generalModalities && (
                      <p className="mt-2 text-[11px] text-slate-600">
                        <span className="font-semibold">Modalities: </span>
                        {form.generalModalities}
                      </p>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-xl bg-white p-3 sm:p-4 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs mb-1.5 block">Cravings (text)</Label>
                      <Textarea
                        value={form.cravingsNote || ""}
                        onChange={(e) => handleSimpleChange("cravingsNote", e.target.value)}
                        placeholder="e.g. Strong craving for salty and spicy food; desire for sweets in evening."
                        className="text-xs sm:text-sm min-h-[48px]"
                      />
                      <div>
                        <Label className="text-[11px] mb-1 block text-slate-500">Quick tags (optional)</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {cravingOptions.map((opt) => {
                            const active = form.cravings?.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleArrayValue("cravings", opt)}
                                className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                                  active
                                    ? "bg-red-100 border-red-300 text-red-800"
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs mb-1.5 block">Aversions (text)</Label>
                      <Textarea
                        value={form.aversionsNote || ""}
                        onChange={(e) => handleSimpleChange("aversionsNote", e.target.value)}
                        placeholder="e.g. Aversion to milk, rice, oily foods, etc."
                        className="text-xs sm:text-sm min-h-[48px]"
                      />
                      <div>
                        <Label className="text-[11px] mb-1 block text-slate-500">Quick tags (optional)</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {aversionOptions.map((opt) => {
                            const active = form.aversions?.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleArrayValue("aversions", opt)}
                                className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                                  active
                                    ? "bg-slate-900 border-slate-900 text-white"
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl bg-white p-3 sm:p-4 space-y-3">
                    <Label className="text-xs mb-1.5 block">Food Reactions</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newFoodItem}
                        onChange={(e) => setNewFoodItem(e.target.value)}
                        placeholder="Food item (e.g. Milk)"
                        className="text-xs sm:text-sm"
                      />
                      <Input
                        value={newFoodEffect}
                        onChange={(e) => setNewFoodEffect(e.target.value)}
                        placeholder="Effect (e.g. causes acidity)"
                        className="text-xs sm:text-sm"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="shrink-0 h-9 w-9"
                        onClick={addFoodReaction}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {(form.foodReactions || []).length === 0 ? (
                        <p className="text-[11px] text-slate-500">
                          No specific food reactions recorded yet.
                        </p>
                      ) : (
                        form.foodReactions.map((fr, idx) => (
                          <div
                            key={`${fr.item}-${idx}`}
                            className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5"
                          >
                            <span className="font-semibold">{fr.item}:</span> {fr.effect}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs mb-1.5 block">Overall effects of food (text)</Label>
                      <Textarea
                        value={form.foodEffectsNote || ""}
                        onChange={(e) => handleSimpleChange("foodEffectsNote", e.target.value)}
                        placeholder="e.g. Milk worsens acidity; cold drinks relieve burning; onions aggravate, etc."
                        className="text-xs sm:text-sm min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">General modalities (digestion)</Label>
                  <Textarea
                    value={form.generalModalities || ""}
                    onChange={(e) => handleSimpleChange("generalModalities", e.target.value)}
                    placeholder="Better/worse by warm food, cold drinks, motion, rest, pressure, etc."
                    className="text-xs sm:text-sm min-h-[70px]"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Additional notes</Label>
                  <Textarea
                    value={form.notes || ""}
                    onChange={(e) => handleSimpleChange("notes", e.target.value)}
                    placeholder="Any additional remarks that help in remedy selection."
                    className="text-xs sm:text-sm min-h-[70px]"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>
              These generals strongly influence homeopathic remedy selection. Capture as precisely as possible.
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
              className="h-8 px-3 text-xs font-semibold rounded-full bg-red-700 hover:bg-red-800 text-white shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Save Digestion
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DigestionSection;
