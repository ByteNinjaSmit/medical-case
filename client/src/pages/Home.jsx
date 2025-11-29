import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
// import SidebarDemo from "@/components/SidebarDemo"
import { Users, Heart, Shield, Database, Smartphone, CheckCircle, Award, FileText, Plus, List } from "lucide-react"
import { GiDrop } from "react-icons/gi";
import { useAuth } from "@/store/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const { API } = useAuth();
  const [mounted, setMounted] = useState(false)

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients7d: 0,
    totalComplaints: 0,
    newComplaints7d: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!API) return;
    let isCancelled = false;

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError("");
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dateFrom = sevenDaysAgo.toISOString().slice(0, 10);

        const [patientsRes, patientsNewRes, complaintsRes, complaintsNewRes] = await Promise.all([
          axios.get(`${API}/api/user/patients`, {
            params: { page: 1, limit: 5, sortBy: "createdAt", order: "desc" },
            withCredentials: true,
          }),
          axios.get(`${API}/api/user/patients`, {
            params: { page: 1, limit: 1, dateFrom },
            withCredentials: true,
          }),
          axios.get(`${API}/api/user/complaints`, {
            params: { page: 1, limit: 5, sortBy: "createdAt", order: "desc" },
            withCredentials: true,
          }),
          axios.get(`${API}/api/user/complaints`, {
            params: { page: 1, limit: 1, dateFrom },
            withCredentials: true,
          }),
        ]);

        if (isCancelled) return;

        const patientsData = patientsRes.data;
        const patientsNewData = patientsNewRes.data;
        const complaintsData = complaintsRes.data;
        const complaintsNewData = complaintsNewRes.data;

        setStats({
          totalPatients: patientsData?.pagination?.totalFiltered ?? patientsData?.pagination?.total ?? 0,
          newPatients7d: patientsNewData?.pagination?.totalFiltered ?? patientsNewData?.pagination?.total ?? 0,
          totalComplaints: complaintsData?.pagination?.totalFiltered ?? complaintsData?.pagination?.total ?? 0,
          newComplaints7d: complaintsNewData?.pagination?.totalFiltered ?? complaintsNewData?.pagination?.total ?? 0,
        });

        setRecentPatients(Array.isArray(patientsData?.data) ? patientsData.data : []);
        setRecentComplaints(Array.isArray(complaintsData?.data) ? complaintsData.data : []);
      } catch (e) {
        if (isCancelled) return;
        setStatsError(e?.response?.data?.message || e.message || "Failed to load dashboard stats");
      } finally {
        if (!isCancelled) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isCancelled = true;
    };
  }, [API]);

  const bloodBankCapabilities = [
    {
      category: "Patient Management",
      icon: Users,
      color: "orange",
      description: "Create and browse patient records for case taking",
      features: [
        { icon: Plus, title: "New Patient", desc: "Register a new patient with basic demographics" },
        { icon: List, title: "Patient List", desc: "View and search all registered patients" },
      ],
    },
    {
      category: "Complaint Management",
      icon: FileText,
      color: "blue",
      description: "Record and review patient chief complaints",
      features: [
        { icon: Plus, title: "New Complaint", desc: "Add a new complaint entry for a patient" },
        { icon: List, title: "Complaint List", desc: "Browse complaints for a selected patient" },
      ],
    },
  ]

  const quickAccessLinks = [
    { icon: Plus, label: "New Patient", link: "/patients/new", color: "orange" },
    { icon: Users, label: "Patient List", link: "/patients", color: "orange" },
    { icon: Plus, label: "New Complaint", link: "/complaints/new", color: "blue" },
    { icon: List, label: "Complaint List", link: "/complaints", color: "blue" },
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden rounded-2xl">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-orange-100 rounded-full opacity-50"></div>
      <div className="absolute bottom-32 left-16 w-24 h-24 bg-red-100 rounded-full opacity-50"></div>
      <div className="absolute top-1/3 left-8 w-16 h-16 bg-orange-200 rounded-full opacity-30"></div>
      <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-red-200 rounded-full opacity-40"></div>
      <div className="absolute bottom-1/4 right-8 w-12 h-12 bg-orange-300 rounded-full opacity-60"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* Header Section */}
        <div
          className={`text-center mb-10 md:mb-16 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-orange-800 rounded-full flex items-center justify-center border-4 border-orange-200 shadow-2xl">
                <GiDrop className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="border-4 border-red-800 text-white text-xl md:text-3xl font-bold rounded-2xl  flex flex-row shadow-2xl">
                <div className="bg-red-800 text-white text-xl md:text-3xl font-bold py-1 px-2 rounded-l-md shadow-2xl">HOMEOPATHY</div>
                <div className=" text-red-800 text-xl md:text-3xl font-bold py-1 px-2 rounded-md  shadow-2xl">CLINICAL DATA SYSTEM</div>
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-red-800 mb-4">Clinical Case Taking & Patient Records</h1>
            <p className="text-gray-600 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
              Record patient data, manage complaints, and streamline homeopathic case taking with secure, fast tools.
            </p>
          </div>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <Card className="col-span-1 md:col-span-2 shadow-md border-orange-100 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm md:text-base">
                <span>Total Patients</span>
                <Users className="w-4 h-4 text-orange-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-800">
                {statsLoading ? "..." : stats.totalPatients}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Last 7 days:{" "}
                <span className="font-semibold text-slate-700">
                  {statsLoading ? "..." : stats.newPatients7d}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 shadow-md border-blue-100 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm md:text-base">
                <span>Total Complaints</span>
                <FileText className="w-4 h-4 text-blue-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-800">
                {statsLoading ? "..." : stats.totalComplaints}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Last 7 days:{" "}
                <span className="font-semibold text-slate-700">
                  {statsLoading ? "..." : stats.newComplaints7d}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {statsError && (
          <div className="mb-6 text-xs md:text-sm text-red-100 bg-red-900/60 border border-red-500/60 rounded-xl px-3 py-2">
            {statsError}
          </div>
        )}

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-md border-red-100 bg-red-50/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base text-red-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/patients/new"
                  className="flex flex-col items-center justify-center rounded-xl bg-white/80 border border-red-100 px-3 py-3 text-xs md:text-sm text-red-800 hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <Plus className="w-4 h-4 mb-1" />
                  New Patient
                </Link>
                <Link
                  to="/patients"
                  className="flex flex-col items-center justify-center rounded-xl bg-white/80 border border-red-100 px-3 py-3 text-xs md:text-sm text-red-800 hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <Users className="w-4 h-4 mb-1" />
                  Patient List
                </Link>
                <Link
                  to="/complaints/new"
                  className="flex flex-col items-center justify-center rounded-xl bg-white/80 border border-blue-100 px-3 py-3 text-xs md:text-sm text-blue-800 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <Plus className="w-4 h-4 mb-1" />
                  New Complaint
                </Link>
                <Link
                  to="/complaints"
                  className="flex flex-col items-center justify-center rounded-xl bg-white/80 border border-blue-100 px-3 py-3 text-xs md:text-sm text-blue-800 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <List className="w-4 h-4 mb-1" />
                  Complaint List
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-slate-200 lg:col-span-1 bg-white/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                Recent Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-1 space-y-2 max-h-60 overflow-y-auto pr-1">
              {statsLoading ? (
                <p className="text-xs text-slate-500">Loading patients...</p>
              ) : recentPatients.length === 0 ? (
                <p className="text-xs text-slate-500">No patients yet.</p>
              ) : (
                recentPatients.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/80 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {p.patientId}
                      </p>
                    </div>
                    <span className="ml-2 text-[11px] text-slate-500">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-slate-200 lg:col-span-1 bg-white/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                Recent Complaints
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-1 space-y-2 max-h-60 overflow-y-auto pr-1">
              {statsLoading ? (
                <p className="text-xs text-slate-500">Loading complaints...</p>
              ) : recentComplaints.length === 0 ? (
                <p className="text-xs text-slate-500">No complaints yet.</p>
              ) : (
                recentComplaints.map((c) => (
                  <div
                    key={c._id}
                    className="rounded-lg border border-slate-100 bg-white/80 px-3 py-2 text-xs"
                  >
                    <p className="font-semibold text-slate-900 line-clamp-1">
                      {c.complaintText}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {c?.patient?.patientId
                        ? `${c.patient.patientId} – ${c.patient.name}`
                        : "Unlinked patient"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {c.visitDate
                        ? new Date(c.visitDate).toLocaleDateString()
                        : c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Blood Bank Capabilities Grid */}
        <div className="space-y-12">
          {bloodBankCapabilities.map((capability, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 delay-${(index + 1) * 200} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
            >
              {/* Category Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-orange-800 rounded-2xl p-4 shadow-xl">
                    <capability.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{capability.category}</h2>
                <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">{capability.description}</p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {capability.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="bg-white border-2 border-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 hover:border-orange-200 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-orange-100 rounded-xl p-3 group-hover:bg-orange-200 transition-colors duration-300">
                        <feature.icon className="w-6 h-6 text-orange-800" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-800 font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Technology & Security Section */}
        <div
          className={`mt-16 transition-all duration-1000 delay-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
        >
          <div className="bg-orange-50 border-2 border-orange-100 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-orange-800 rounded-2xl p-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">System Overview</h2>
              <p className="text-gray-600 text-lg">
                Secure, role-ready platform for homeopathy clinics to manage patients and complaints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-800 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-800 font-semibold text-xl mb-3">Modern Interface</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    React + Vite
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Tailwind CSS Styling
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Mobile Responsive
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Accessibility Ready
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <div className="bg-orange-800 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-800 font-semibold text-xl mb-3">Secure Database</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Encrypted Storage
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Real-time Sync
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Automated Backups
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Data Recovery
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <div className="bg-orange-800 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-800 font-semibold text-xl mb-3">Medical-Grade Security</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    HIPAA Compliance
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Role-based Access
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Audit Trails
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-800" />
                    Data Encryption
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-1200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-orange-800 rounded-xl p-3 mr-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-800 text-2xl font-bold">Homeopathy Clinical Data System</h3>
            </div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Manage patient records and complaints efficiently. Built for reliability and privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
