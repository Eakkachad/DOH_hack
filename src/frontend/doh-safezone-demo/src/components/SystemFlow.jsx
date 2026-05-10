import { X, HardHat, Shield, MapPin, ArrowRight, Cloud } from "lucide-react";

export default function SystemFlow({ onClose }) {
  const layers = [
    {
      title: "Contractor Layer",
      icon: HardHat,
      color: "bg-amber-500",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      items: [
        "Login & Role Management",
        "GPS Location Pinning",
        "Geofence Radius Setup",
        "On-site Photo Uploads",
        "Safety Checklist",
        "Job Status Updates"
      ]
    },
    {
      title: "DOH Backend Layer",
      icon: Shield,
      color: "bg-blue-700",
      text: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      items: [
        "Report Verification",
        "Approve / Reject",
        "KPI Evaluation",
        "Data Analytics",
        "National Monitoring",
        "Data Export"
      ]
    },
    {
      title: "Public User Layer",
      icon: MapPin,
      color: "bg-green-600",
      text: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      items: [
        "Interactive Map View",
        "Geofence Alerts",
        "Push Notifications",
        "Route Planning",
        "Citizen Feedback",
        "Construction Details"
      ]
    },
    {
      title: "Integration Layer",
      icon: Cloud,
      color: "bg-purple-600",
      text: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200",
      items: [
        "LINE OA Notifications",
        "Google Maps / Waze API",
        "Open Data Portal",
        "API Gateway",
        "External Analytics",
        "Third-party Integration"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-8 px-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-lg">System Architecture</h2>
            <p className="text-xs text-gray-500">End-to-End Data Flow</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-0">
          {layers.map((layer, idx) => {
            const Icon = layer.icon;
            return (
              <div key={layer.title}>
                <div className={`${layer.bg} ${layer.border} border rounded-xl p-4 relative`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${layer.color} rounded-xl flex items-center justify-center`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{layer.title}</h3>
                      <p className="text-[10px] text-gray-500">{layer.items.length} functions</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {layer.items.map((item) => (
                      <div key={item} className={`flex items-center gap-1.5 text-xs ${layer.text} bg-white/80 rounded-lg px-2 py-1.5`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${layer.color}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                {idx < layers.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="flex flex-col items-center">
                      <ArrowRight size={20} className="text-gray-300" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Data Lifecycle</h3>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            {["Contractor logs in", "Creates report", "Pins GPS location", "Uploads photos", "DOH verifies", "Approves", "Broadcasts to public", "Commuter receives alert"].map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{i + 1}</span>
                <span className="text-gray-600">{step}</span>
                {i < 7 && <ChevronRight size={12} className="text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 text-center rounded-b-2xl">
          <p className="text-white text-xs font-medium">DOH SafeZone &mdash; Real-time Highway Construction Reporting &amp; Alert System</p>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
