import { useState } from "react";
import { HardHat, Shield, MapPin, ArrowRight, Building2 } from "lucide-react";

const roles = [
  { id: "contractor", label: "Contractor", icon: HardHat, sub: "On-site Staff", color: "border-l-amber-500 hover:bg-amber-50" },
  { id: "admin", label: "DOH Admin", icon: Shield, sub: "Department of Highways", color: "border-l-blue-700 hover:bg-blue-50" },
  { id: "public", label: "Public User", icon: MapPin, sub: "Commuter", color: "border-l-green-600 hover:bg-green-50" }
];

export default function LoginView({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const handleContinue = () => {
    if (selectedRole) onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-16 pb-8 max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-2xl mb-5">
            <Building2 size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">DOH SafeZone</h1>
          <p className="text-blue-200 mt-2 text-sm">Highway Construction Reporting System</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-4">Select Your Role</h2>
          <div className="space-y-3">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button key={role.id} onClick={() => setSelectedRole(role.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-l-4 bg-white/5 text-white transition-all ${role.color} ${isSelected ? "ring-2 ring-white scale-[1.02]" : "opacity-70 hover:opacity-100"}`}>
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{role.label}</div>
                    <div className="text-xs text-white/70">{role.sub}</div>
                  </div>
                  {isSelected && <ArrowRight size={20} className="ml-auto text-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedRole && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4 animate-fadeIn">
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-medium">Username</label>
              <div className="mt-1 bg-white/10 rounded-xl px-4 py-3 text-white text-sm">
                {selectedRole === "contractor" ? "contractor_demo" : selectedRole === "admin" ? "admin_doh" : "commuter_demo"}
              </div>
            </div>
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-medium">Password</label>
              <div className="mt-1 bg-white/10 rounded-xl px-4 py-3 text-white text-sm flex items-center justify-between">
                <span>{showPass ? "Demo@2026" : "••••••••"}</span>
                <button onClick={() => setShowPass(!showPass)} className="text-white/50 text-xs hover:text-white">Show</button>
              </div>
            </div>
            <button onClick={handleContinue} className="w-full bg-white text-blue-900 font-bold py-4 rounded-xl text-lg hover:bg-blue-50 transition-all active:scale-[0.98] shadow-lg">
              Sign In
            </button>
          </div>
        )}

        <p className="text-blue-300 text-xs text-center mt-6">
          Demo Prototype &mdash; Hackathon 2026
        </p>
      </div>
    </div>
  );
}
