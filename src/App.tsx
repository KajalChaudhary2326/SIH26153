import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ArchitecturePage } from "./pages/ArchitecturePage";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/live" element={<DashboardPage />} />
            <Route path="/dashboard/simulation" element={<DashboardPage />} />
            <Route path="/dashboard/explainability" element={<DashboardPage />} />
            <Route path="/dashboard/baseline" element={<DashboardPage />} />

            <Route path="/upload" element={<Navigate to="/dashboard" replace />} />
            <Route path="/simulation" element={<Navigate to="/dashboard/simulation" replace />} />
            <Route path="/compare" element={<Navigate to="/dashboard/baseline" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
