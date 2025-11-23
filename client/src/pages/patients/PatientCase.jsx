import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import PatientDetailsView from "@/components/PatientDetailsView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Utensils, Brain } from "lucide-react";
import DigestionSection from "@/components/case/sections/DigestionSection";

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
        setError(e?.response?.data?.message || e.message || "Failed to load patient");
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-0.5">
                Patient Case Record
              </p>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                {patient?.name || "Loading..."}
                {patient?.patientId && (
                  <span className="ml-2 text-xs font-mono text-slate-500">({patient.patientId})</span>
                )}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {error && (
            <Card className="border-red-200 bg-red-50/40">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-red-800">Error loading patient</CardTitle>
                <CardDescription className="text-red-700 text-sm">{error}</CardDescription>
              </CardHeader>
            </Card>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
                  <Activity className="w-3.5 h-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="digestion" className="gap-1.5 text-xs sm:text-sm">
                  <Utensils className="w-3.5 h-3.5" />
                  Digestion
                </TabsTrigger>
                <TabsTrigger value="mental" className="gap-1.5 text-xs sm:text-sm">
                  <Brain className="w-3.5 h-3.5" />
                  Mental / Generals
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <Card className="overflow-hidden border-slate-200 shadow-sm bg-white/90">
                <CardContent className="p-4 sm:p-6">
                  {loading ? (
                    <div className="text-sm text-slate-500">Loading patient overview...</div>
                  ) : (
                    patient && <PatientDetailsView patient={patient} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="digestion">
              <DigestionSection patientId={patientId} />
            </TabsContent>

            <TabsContent value="mental">
              <Card className="border-slate-200 bg-white/80">
                <CardHeader>
                  <CardTitle className="text-base">Mental / General Overview</CardTitle>
                  <CardDescription className="text-sm">
                    This section will capture mental generals, fears, anxieties, and overall temperament.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-500">
                  Detailed mental generals UI will be implemented next. For now, use the main complaints and
                  summary fields to record key mental symptoms.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientCase;
