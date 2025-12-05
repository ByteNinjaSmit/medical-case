import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import PatientDetailsView from "@/components/PatientDetailsView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Activity, Utensils, Brain, User, Droplets, Moon,
  Heart, History, ThermometerSun, Microscope, CalendarClock, Pill
} from "lucide-react";
import { toast } from "sonner";

// Section Components
import DigestionSection from "@/components/case/sections/DigestionSection";
import PhysicalGeneralsSection from "@/components/case/sections/PhysicalGeneralsSection";
import EliminationSection from "@/components/case/sections/EliminationSection";
import SleepSection from "@/components/case/sections/SleepSection";
import SexualHistorySection from "@/components/case/sections/SexualHistorySection";
import HistorySection from "@/components/case/sections/HistorySection";
import ThermalSection from "@/components/case/sections/ThermalSection";
import InvestigationsSection from "@/components/case/sections/InvestigationsSection";
import FollowUpSection from "@/components/case/sections/FollowUpSection";
import PrescriptionSection from "@/components/case/sections/PrescriptionSection";

const PatientCase = () => {
  const { API } = useAuth();
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API}/api/user/patients/${patientId}`, {
          withCredentials: true,
        });
        setPatient(res?.data?.data || null);
      } catch (e) {
        const msg = e?.response?.data?.message || e.message || "Failed to load patient";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [API, patientId]);

  const handleBack = () => {
    navigate("/patients");
  };

  const handleAddComplaint = () => {
    if (!patient) return;
    navigate(`/complaints/new?patient=${patient._id}`, { state: { patient } });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-slate-200/60 backdrop-blur-md bg-white/80 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 -ml-2"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {patient?.name || "Loading..."}
                </h1>
                {patient?.patientId && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium tracking-wide">
                    {patient.patientId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">Case Record</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-6"
        >
          {error && (
            <Card className="border-red-200 bg-red-50/50 shadow-none">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-semibold text-red-800 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  Error loading patient
                </CardTitle>
                <CardDescription className="text-red-700 text-xs mt-1">{error}</CardDescription>
              </CardHeader>
            </Card>
          )}

          <Tabs defaultValue="overview" className="w-full">
            {/* Scrollable Tabs List */}
            <div className="sticky top-[60px] z-20 bg-slate-50/95 backdrop-blur-sm py-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none transition-all">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-slate-200/50 rounded-xl no-scrollbar gap-1">
                {[
                  { val: "overview", icon: Activity, label: "Overview" },
                  { val: "physical", icon: User, label: "Physical" },
                  { val: "digestion", icon: Utensils, label: "Digestion" },
                  { val: "elimination", icon: Droplets, label: "Elimination" },
                  { val: "sleep", icon: Moon, label: "Sleep" },
                  { val: "sexual", icon: Heart, label: "Sexual" },
                  { val: "history", icon: History, label: "History" },
                  { val: "thermal", icon: ThermometerSun, label: "Thermal" },
                  { val: "investigations", icon: Microscope, label: "Labs" },
                  { val: "followup", icon: CalendarClock, label: "Follow-up" },
                  { val: "prescription", icon: Pill, label: "Rx" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.val}
                    value={tab.val}
                    className="flex-shrink-0 gap-1.5 text-xs font-medium px-3 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="mt-4">
              <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                <Card className="overflow-hidden border-slate-200/60 shadow-sm bg-white">
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="p-8 text-center text-sm text-slate-500">Loading patient overview...</div>
                    ) : (
                      patient && <PatientDetailsView patient={patient} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="physical" className="mt-0 focus-visible:outline-none">
                <PhysicalGeneralsSection patientId={patientId} />
              </TabsContent>

              <TabsContent value="digestion" className="mt-0 focus-visible:outline-none">
                <DigestionSection patientId={patientId} />
              </TabsContent>

              <TabsContent value="elimination" className="mt-0 focus-visible:outline-none">
                <EliminationSection patientId={patientId} />
              </TabsContent>

              <TabsContent value="sleep" className="mt-0 focus-visible:outline-none">
                <SleepSection patientId={patientId} />
              </TabsContent>

              <TabsContent value="sexual" className="mt-0 focus-visible:outline-none">
                <SexualHistorySection patientId={patientId} patientSex={patient?.sex} />
              </TabsContent>

              <TabsContent value="history" className="mt-0 focus-visible:outline-none">
                <HistorySection patientId={patientId} />
              </TabsContent>

              <TabsContent value="thermal" className="mt-0 focus-visible:outline-none">
                <ThermalSection patientId={patientId} />
              </TabsContent>

              <TabsContent value="investigations" className="mt-0 focus-visible:outline-none">
                <InvestigationsSection patientId={patientId} />
              </TabsContent>

              <TabsContent value="followup" className="mt-0 focus-visible:outline-none">
                <FollowUpSection patientId={patientId} />
              </TabsContent>

              <TabsContent value="prescription" className="mt-0 focus-visible:outline-none">
                <PrescriptionSection patientId={patientId} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>

      {/* Mobile quick actions bar */}
      {patient && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 p-4 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto shadow-lg rounded-full bg-white p-1.5 border border-slate-100 ring-1 ring-slate-900/5">
            <Button
              type="button"
              onClick={handleAddComplaint}
              className="flex-1 h-10 text-xs font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-transform active:scale-95"
            >
              New Complaint
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/prescriptions/new?patient=${patient._id}`)}
              variant="ghost"
              className="flex-1 h-10 text-xs font-semibold rounded-full text-slate-700 hover:bg-slate-100 transition-transform active:scale-95"
            >
              New Prescription
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCase;
