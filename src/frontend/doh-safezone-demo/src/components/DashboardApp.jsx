import { useState } from "react";
import LoginView from "./LoginView";
import ContractorView from "./ContractorView";
import AdminView from "./AdminView";
import PublicView from "./PublicView";
import SystemFlow from "./SystemFlow";
import { initialZones, contractorKpiData, sampleFeedback } from "../data/initialData";

export default function DashboardApp() {
  const [zones, setZones] = useState(initialZones);
  const [feedback, setFeedback] = useState(sampleFeedback);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showSystemFlow, setShowSystemFlow] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (msg) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleLogin = (role) => {
    setLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserRole(null);
  };

  if (!loggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50">
        {notifications.map((n) => (
          <div key={n.id} className="animate-slideDown bg-blue-700 text-white px-4 py-3 shadow-lg text-sm text-center">{n.msg}</div>
        ))}
      </div>

      {userRole === "contractor" && (
        <ContractorView zones={zones} setZones={setZones} kpiData={contractorKpiData} addNotification={addNotification} onLogout={handleLogout} />
      )}
      {userRole === "admin" && (
        <AdminView zones={zones} setZones={setZones} kpiData={contractorKpiData} addNotification={addNotification} feedback={feedback} setFeedback={setFeedback} onLogout={handleLogout} />
      )}
      {userRole === "public" && (
        <PublicView zones={zones} addNotification={addNotification} feedback={feedback} setFeedback={setFeedback} onLogout={handleLogout} />
      )}

      {userRole === "admin" && (
        <button onClick={() => setShowSystemFlow(true)} className="fixed bottom-4 right-4 z-40 bg-white border border-gray-300 rounded-full px-3 py-1.5 text-xs text-gray-500 shadow hover:shadow-md transition-shadow">
          System Flow
        </button>
      )}

      {showSystemFlow && <SystemFlow onClose={() => setShowSystemFlow(false)} />}
    </div>
  );
}
