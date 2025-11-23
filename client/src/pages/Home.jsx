import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
// import SidebarDemo from "@/components/SidebarDemo"
import { Users, Heart, Shield, Database, Smartphone, CheckCircle, Award, FileText, Plus, List } from "lucide-react"
import { GiDrop } from "react-icons/gi";

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
