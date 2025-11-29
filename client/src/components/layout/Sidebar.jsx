import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronRight, ChevronDown, Users, List, Plus, User, LogOut, Shield, Activity, FileText, Pill, ClipboardList } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { GiDrop } from "react-icons/gi";

const MODULES = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: <Activity className="w-5 h-5" />,
    href: '/',
    description: 'Clinical overview & quick actions',
  },
  {
    id: 'patient',
    name: 'Patients',
    icon: <Users className="w-5 h-5" />,
    subModules: [
      { name: 'New Patient', icon: <Plus className="w-5 h-5" />, href: '/patients/new', description: 'Register new patient' },
      { name: 'Patient List', icon: <List className="w-5 h-5" />, href: '/patients', description: 'View all patients & open cases' },
    ],
    description: 'Patient management',
  },
  {
    id: 'complaint',
    name: 'Complaints',
    icon: <FileText className="w-5 h-5" />,
    subModules: [
      { name: 'New Complaint', icon: <Plus className="w-5 h-5" />, href: '/complaints/new', description: 'Record new complaint for a patient' },
      { name: 'Complaint List', icon: <List className="w-5 h-5" />, href: '/complaints', description: 'Review all complaints' },
    ],
    description: 'Complaint management',
  },
  {
    id: 'prescriptions',
    name: 'Prescriptions',
    icon: <Pill className="w-5 h-5" />,
    subModules: [
      { name: 'Prescription History', icon: <List className="w-5 h-5" />, href: '/patients', description: 'Open a patient case to view prescriptions' },
    ],
    description: 'Prescription records',
  },
  {
    id: 'case-record',
    name: 'Case Record',
    icon: <ClipboardList className="w-5 h-5" />,
    href: '/patients',
    description: 'Per-patient modules: physical generals, digestion, elimination, sleep, sexual/menses, history, thermal, investigations, follow-ups',
  },
];

const Sidebar = ({
  isOpen,
  onToggle,
  isMobile,
  showMobileOverlay,
  onCloseMobile
}) => {
  const { user, LogoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState(() => new Set());
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubModule, setSelectedSubModule] = useState(null);
  const [tempOpenForSubmodule, setTempOpenForSubmodule] = useState(false);

  const filteredModules = useMemo(() =>
    MODULES.filter((module) => module.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  useEffect(() => {
    const currentModule = MODULES.find((module) => {
      if (module.href === location.pathname) return true;
      return module.subModules?.some((sub) => sub.href === location.pathname);
    });

    if (currentModule) {
      setSelectedModule(currentModule);
      const currentSubModule = currentModule.subModules?.find((sub) => sub.href === location.pathname);
      setSelectedSubModule(currentSubModule || null);

      if (currentSubModule) {
        setExpandedModules((prev) => {
          const newSet = new Set(prev);
          newSet.add(currentModule.id);
          return newSet;
        });
      }
    }
  }, [location.pathname]);

  const handleModuleClick = useCallback((module) => {
    const hasSubmodules = module.subModules && module.subModules.length > 0;

    // If sidebar is collapsed, temporarily open to show submodules
    if (!isOpen && hasSubmodules) {
      setTempOpenForSubmodule(true);
      setExpandedModules((prev) => {
        const next = new Set(prev);
        next.add(module.id);
        return next;
      });
      return;
    }

    // If sidebar is open and module has submodules, toggle expansion
    if (hasSubmodules && (isOpen || tempOpenForSubmodule)) {
      setExpandedModules((prev) => {
        const next = new Set(prev);
        if (next.has(module.id)) next.delete(module.id);
        else next.add(module.id);
        return next;
      });
      return;
    }

    // Fallback: navigate if module has a direct href
    if (module.href) {
      navigate(module.href);
      if (isMobile) onCloseMobile();
      setTempOpenForSubmodule(false);
    }
  }, [navigate, isMobile, onCloseMobile, isOpen, tempOpenForSubmodule]);

  const handleSubModuleClick = useCallback((module, subModule) => {
    navigate(subModule.href);
    if (isMobile) {
      onCloseMobile();
    }
    setTempOpenForSubmodule(false);
  }, [navigate, isMobile, onCloseMobile]);

  useEffect(() => {
    if (isOpen && tempOpenForSubmodule) {
      setTempOpenForSubmodule(false);
    }
  }, [isOpen, tempOpenForSubmodule]);

  const isActive = useCallback((href) => location.pathname === href, [location.pathname]);

  const handleLogout = useCallback(() => {
    LogoutUser();
  }, [LogoutUser]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const shouldDisplayOpen = isOpen || tempOpenForSubmodule;

  return (
    <>
      {isMobile && showMobileOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <div
        className={`
          ${isMobile
            ? `fixed left-0 top-0 h-full w-80 z-50 transform transition-all duration-300 ease-in-out ${showMobileOverlay ? "translate-x-0" : "-translate-x-full"
            }`
            : `${shouldDisplayOpen ? "w-80" : "w-16"} h-full transition-all duration-300 ease-in-out`
          } 
          bg-gradient-to-br from-red-900 via-red-800 to-red-900 
          text-white flex flex-col shadow-2xl border-r border-red-700/30
        `}
      >
        <div className="shrink-0">
          <div className="p-6 border-b border-red-700/30 bg-red-800/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {shouldDisplayOpen && (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                      <GiDrop className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-white">Homeopathy Clinical Data System</h1>
                    <p className="text-red-100 text-sm font-medium">Homeopathy Clinical Data System</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-red-200" />
                        <span className="text-xs text-red-100 truncate">{user?.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3 text-red-200" />
                      <span className="text-xs text-red-100 capitalize">{user?.isDoctor ? 'Doctor' : ''}</span>
                    </div>
                  </div>
                </div>
              )}
              {!shouldDisplayOpen && !isMobile && (
                <div className="flex justify-center w-full">
                  <div className="relative">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                      <GiDrop className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {shouldDisplayOpen && (
            <div className="p-4 border-b border-red-700/30">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-300 w-4 h-4 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder:text-red-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 scrollbar-none overflow-y-auto">
          <div className={`p-4 space-y-2 ${!shouldDisplayOpen && !isMobile ? "flex flex-col items-center" : ""}`}>
            {filteredModules.map((module) => (
              <div key={module.id} className={`${shouldDisplayOpen ? "group w-full" : "w-full flex justify-center"}`}>
                <div
                  onClick={() => handleModuleClick(module)}
                  className={`
                    ${shouldDisplayOpen
                      ? "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 w-full"
                      : "flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 w-12 h-12"
                    }
                    ${isActive(module.href) || module.subModules?.some((sub) => isActive(sub.href))
                      ? "bg-white/25 text-white shadow-lg backdrop-blur-sm border border-white/20"
                      : "hover:bg-white/20 text-red-100 hover:text-white hover:shadow-md"
                    }
                    ${shouldDisplayOpen ? "group-hover:scale-[1.02]" : "hover:scale-105"} transform hover:border hover:border-white/20
                  `}
                  title={!shouldDisplayOpen ? module.name : ""}
                >
                  <div className={`shrink-0 ${shouldDisplayOpen ? "p-1" : ""}`}>
                    {module.icon}
                  </div>
                  {shouldDisplayOpen && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{module.name}</span>
                        </div>
                        {module.subModules && module.subModules.length > 0 && (
                          <div className="transition-transform duration-200">
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="w-4 h-4 shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 shrink-0" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs opacity-80 truncate">{module.description}</div>
                    </div>
                  )}
                </div>

                {module.subModules && module.subModules.length > 0 && shouldDisplayOpen && (
                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${expandedModules.has(module.id)
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                      }
                    `}
                  >
                    <div className="ml-6 mr-2 space-y-1">
                      {module.subModules.map((subModule, index) => (
                        <div
                          key={`${module.id}-${index}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubModuleClick(module, subModule);
                          }}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                            ${isActive(subModule.href)
                              ? "bg-white/30 text-white shadow-md backdrop-blur-sm border border-white/30"
                              : "hover:bg-white/25 text-red-100 hover:text-white hover:shadow-md"
                            }
                            hover:scale-[1.01] transform hover:border hover:border-white/20
                          `}
                        >
                          <div className="shrink-0 p-1">
                            {subModule.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{subModule.name}</span>
                            </div>
                            <div className="text-xs opacity-75 truncate">{subModule.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Footer Section */}
        <div className="shrink-0 border-t border-red-700/30 bg-red-800/20 backdrop-blur-sm">
          <div className={`${shouldDisplayOpen ? "p-4" : "p-2"}`}>
            <button
              onClick={handleLogout}
              className={`
                ${shouldDisplayOpen
                  ? "w-full flex items-center gap-3 p-3 text-red-100 hover:text-white hover:bg-red-700/30 rounded-lg"
                  : "w-full flex items-center justify-center p-3 text-red-100 hover:text-white hover:bg-red-700/30 rounded-lg"
                }
                transition-all cursor-pointer duration-200 group hover:shadow-md hover:border hover:border-white/20
              `}
              title={!shouldDisplayOpen ? "Logout" : ""}
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {shouldDisplayOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Sidebar);