import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import LoginPage from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import StudentDashboard from "./components/Student-dashboard.jsx";
import StudentProfile from "./components/StudentProfile.jsx";
import InstitutionDashboard from "./components/Institution-dashboard.jsx";
import InstitutionSetup from "./components/InstitutionSetup.jsx";
import InstitutionNotifications from "./components/InstitutionNotifications.jsx";
import InstitutionUsers from "./components/InstitutionUsers.jsx";
import IssueCertificate from "./components/IssueCertificate.jsx";
import VerifyCertificate from "./components/VerifyCertificate.jsx";
import CertificateView from "./components/CertificateView.jsx";
import AdminDashboard from "./components/Admin-dashboard.jsx";
import "./App.css";
import logo from "./logo.svg";

function App() {
  return (
    <Router>
      <Routes>

        {/* Default home page */}
        <Route
          path="/"
           element={<Navigate to="/login" replace />}
        />

        {/* Login page route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/institution-dashboard" element={<InstitutionDashboard />} />
        <Route path="/institute/setup" element={<InstitutionSetup />} />
        <Route path="/institution/notifications" element={<InstitutionNotifications />} />
        <Route path="/institution/users" element={<InstitutionUsers />} />
        <Route path="/issue-certificate" element={<IssueCertificate />} />
        <Route path="/verify/:tokenId" element={<VerifyCertificate />} />
        <Route path="/certificate/:id" element={<CertificateView />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

      </Routes>
  
    </Router>
  );
}

export default App;
