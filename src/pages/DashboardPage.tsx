import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, BarChart3, Eye, Upload, Bell } from "lucide-react";
import { UploadPage } from "./UploadPage";
import { SimulationPage } from "./SimulationPage";
import { ExplainabilityPage } from "./ExplainabilityPage";
import { ComparePage } from "./ComparePage";
import { LiveMonitorPage } from "./LiveMonitorPage";

const tabs = [
  { to: "/dashboard", label: "Upload", icon: Upload, end: true },
  { to: "/dashboard/live", label: "24/7 Live Sentinel (WhatsApp & Email)", icon: Bell, highlight: true },
  { to: "/dashboard/simulation", label: "Scenario Simulation", icon: Activity },
  { to: "/dashboard/explainability", label: "Explainability", icon: Eye },
  { to: "/dashboard/baseline", label: "Baseline Comparison", icon: BarChart3 },
];

export function DashboardPage() {
  const location = useLocation();

  const renderTabContent = () => {
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") return <UploadPage />;
    if (location.pathname === "/dashboard/live") return <LiveMonitorPage />;
    if (location.pathname === "/dashboard/simulation") return <SimulationPage />;
    if (location.pathname === "/dashboard/explainability") return <ExplainabilityPage />;
    if (location.pathname === "/dashboard/baseline") return <ComparePage />;
    return <UploadPage />;
  };

  return (
    <div className="w-full pb-8">
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border p-2 glow-box" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "color-mix(in srgb, var(--color-accent) 12%, transparent)" : "transparent",
              border: isActive ? "1px solid color-mix(in srgb, var(--color-accent) 35%, var(--color-border))" : "1px solid transparent",
            })}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </div>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
}
