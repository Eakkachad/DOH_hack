import { useState, useEffect } from "react";
import { MapPin, Bell, Route, Navigation, X, AlertTriangle, ChevronRight, ChevronLeft, Clock, ShieldCheck, Camera, CheckCircle, AlertOctagon, LogOut } from "lucide-react";
import { issueTypeLabels } from "../data/initialData";

const dummyPhotos = [
  "https://images.unsplash.com/photo-1541888946425-d81bbd40a9d1?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1590674899484-13f8e9f6c21f?w=400&h=300&fit=crop"
];

export default function PublicView({ zones, addNotification, feedback, setFeedback, onLogout }) {
  const [publicView, setPublicView] = useState("onboarding");
  const [selectedZone, setSelectedZone] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [carPosition, setCarPosition] = useState(0);

  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false);
  const [feedbackIssueType, setFeedbackIssueType] = useState("");
  const [feedbackLocation, setFeedbackLocation] = useState("");
  const [feedbackDesc, setFeedbackDesc] = useState("");
  const [feedbackPhotos, setFeedbackPhotos] = useState([]);
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);

  const activeZones = zones.filter((z) => z.status === "Active");

  const riskColors = { High: "text-red-500", Medium: "text-yellow-500", Low: "text-blue-400" };
  const riskBg = { High: "bg-red-500", Medium: "bg-yellow-500", Low: "bg-blue-400" };

  useEffect(() => {
    const interval = setInterval(() => setCarPosition((p) => (p + 0.5) % 100), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDrivingSimulation = () => {
    if (activeZones.length === 0) { addNotification("ไม่พบเขตงานก่อสร้างในเส้นทางของคุณ"); return; }
    const randomZone = activeZones[Math.floor(Math.random() * activeZones.length)];
    setAlertData(randomZone);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const dismissAlert = () => { setShowAlert(false); setAlertData(null); };

  const handleFeedbackPhotoUpload = () => {
    if (feedbackPhotos.length >= 2) return;
    const randomPhoto = dummyPhotos[feedbackPhotos.length % dummyPhotos.length];
    setFeedbackPhotos((prev) => [...prev, { url: randomPhoto, timestamp: new Date().toLocaleString() }]);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackIssueType) return;
    const loc = feedbackLocation || "ทางหลวงหมายเลข 32 ใกล้ กม. 46";
    const newFeedback = {
      id: `FB-2026-${String(feedback.length + 1).padStart(4, "0")}`,
      issueType: feedbackIssueType, location: loc, lat: 14.1234, lng: 100.1234,
      submittedAt: new Date().toISOString(),
      photoUrl: feedbackPhotos.length > 0 ? feedbackPhotos[0].url : null,
      description: feedbackDesc || "", status: "Pending Review"
    };
    setFeedback((prev) => [...prev, newFeedback]);
    setShowFeedbackSheet(false);
    setShowFeedbackToast(true);
    setFeedbackIssueType(""); setFeedbackLocation(""); setFeedbackDesc(""); setFeedbackPhotos([]);
    setTimeout(() => setShowFeedbackToast(false), 3000);
  };

  const mapPins = activeZones.slice(0, 5).map((z, i) => ({
    ...z,
    top: 18 + (i * 18) % 60,
    left: 15 + (i * 22) % 75
  }));

  if (publicView === "onboarding") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mb-6"><ShieldCheck size={48} className="text-white" /></div>
          <h1 className="text-3xl font-bold text-white mb-2">DOH SafeZone</h1>
          <p className="text-blue-200 mb-8 text-sm">รู้ก่อน ระวังก่อน ถึงปลอดภัย</p>
          <div className="space-y-4 w-full max-w-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 text-left"><MapPin size={24} className="text-yellow-300 flex-shrink-0" /><p className="text-white text-sm">แจ้งเตือนเขตงานก่อสร้างแบบเรียลไทม์</p></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 text-left"><Bell size={24} className="text-yellow-300 flex-shrink-0" /><p className="text-white text-sm">แจ้งเตือนล่วงหน้าก่อนถึงเขตงาน</p></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 text-left"><Route size={24} className="text-yellow-300 flex-shrink-0" /><p className="text-white text-sm">วางแผนเส้นทางที่ปลอดภัย</p></div>
          </div>
          <button onClick={() => setPublicView("map")} className="mt-8 w-full max-w-xs bg-white text-blue-900 font-bold py-4 rounded-xl text-lg hover:bg-blue-50 transition-all active:scale-[0.98] shadow-lg">เริ่มใช้งาน</button>
        </div>
        <div className="p-6 text-center"><p className="text-blue-300 text-xs">การดำเนินการต่อแสดงว่าคุณยินยอมให้แชร์ตำแหน่งเพื่อการแจ้งเตือน</p></div>
      </div>
    );
  }

  if (publicView === "detail" && selectedZone) {
    const z = selectedZone;
    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={() => setPublicView("map")} className="flex items-center gap-1 text-blue-700 mb-4"><ChevronLeft size={20} /> กลับไปแผนที่</button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`p-5 ${z.riskLevel === "High" ? "bg-red-50" : z.riskLevel === "Medium" ? "bg-yellow-50" : "bg-blue-50"}`}>
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-bold text-lg">{z.projectName}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${riskBg[z.riskLevel]}`}>{z.riskLevel === "High" ? "เสี่ยงสูง" : "ปานกลาง"}</span>
            </div>
            <p className="text-sm text-gray-600">ทางหลวงหมายเลข {z.highway} • {z.contractor}</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-500">ตำแหน่ง</p><p className="font-semibold text-sm">กม. {z.startKm} - {z.endKm}</p></div>
              <div><p className="text-xs text-gray-500">ระยะทางจากคุณ</p><p className="font-semibold text-sm">~{(Math.random() * 5 + 1).toFixed(1)} กม.</p></div>
              <div><p className="text-xs text-gray-500">เวลาทำงาน</p><p className="font-semibold text-sm">{z.schedule.hours}</p></div>
              <div><p className="text-xs text-gray-500">ความเร็วจำกัด</p><p className="font-semibold text-sm">{z.impact.speedLimit} กม./ชม.</p></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">ผลกระทบ</p>
              <p className="text-sm font-semibold text-red-600">{z.impact.lanesClosed} ปิด</p>
              <div className="mt-2 bg-blue-100 rounded-lg p-3"><p className="text-xs text-blue-800"><AlertTriangle size={14} className="inline mr-1" />คำแนะนำ: ลดความเร็วเหลือ {z.impact.speedLimit} กม./ชม.</p></div>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-blue-50 rounded-xl h-32 relative overflow-hidden border border-gray-200">
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(200,200,200,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,200,200,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="absolute inset-0 flex items-center justify-center"><MapPin size={32} className="text-red-500 drop-shadow-lg" /><div className="ml-2 text-sm font-semibold text-gray-700">เขตงานก่อสร้าง</div></div>
            </div>
            <button onClick={() => { setPublicView("route"); }} className="w-full bg-blue-700 text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-all flex items-center justify-center gap-2"><Route size={18} /> วางแผนเส้นทางเลี่ยง</button>
          </div>
        </div>
      </div>
    );
  }

  if (publicView === "route") {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={() => setPublicView("map")} className="flex items-center gap-1 text-blue-700 mb-4"><ChevronLeft size={20} /> กลับไปแผนที่</button>
        <h2 className="text-lg font-bold text-gray-900 mb-1">วางแผนเส้นทาง</h2>
        <p className="text-xs text-gray-500 mb-4">ตรวจสอบเส้นทางของคุณสำหรับเขตงานก่อสร้าง</p>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div><label className="text-xs font-medium text-gray-600 mb-1 block">จุดเริ่มต้น</label><div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3"><Navigation size={16} className="text-green-500 flex-shrink-0" /><input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="ตำแหน่งปัจจุบัน" className="bg-transparent w-full text-sm outline-none" /></div></div>
          <div><label className="text-xs font-medium text-gray-600 mb-1 block">ปลายทาง</label><div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3"><MapPin size={16} className="text-red-500 flex-shrink-0" /><input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="เช่น กรุงเทพฯ" className="bg-transparent w-full text-sm outline-none" /></div></div>
          <button onClick={() => addNotification(`ตรวจสอบเส้นทาง: พบ ${activeZones.length} เขตงานก่อสร้าง เวลาล่าช้า ${activeZones.length * 5} นาที`)} className="w-full bg-blue-700 text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-all">ตรวจสอบเส้นทาง</button>
          <hr className="border-gray-100" />
          <div><h3 className="text-sm font-semibold text-gray-700 mb-2">เขตงานก่อสร้างบนเส้นทาง</h3>
            {activeZones.length === 0 ? <p className="text-xs text-gray-400">ไม่พบการปิดกั้น เส้นทางปลอดโปร่ง!</p> : (
              <div className="space-y-2">{activeZones.map((z) => (<div key={z.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"><MapPin size={16} className={riskColors[z.riskLevel]} /><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{z.projectName}</p><p className="text-[10px] text-gray-400">ทางหลวง {z.highway} • กม. {z.startKm}</p></div><span className="text-[10px] text-gray-500">{z.impact.lanesClosed}</span></div>))}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {showAlert && alertData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 bg-black/30 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideDown">
            <div className="bg-red-500 p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><AlertTriangle size={24} className="text-white" /></div>
              <div className="text-white"><p className="font-bold text-sm">คำเตือน</p><p className="text-xs text-red-100">มีงานก่อสร้างข้างหน้า</p></div>
              <button onClick={dismissAlert} className="ml-auto text-white/70 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-800 font-medium">1 กม. ข้างหน้า: {alertData.projectName} ทางหลวงหมายเลข {alertData.highway}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Clock size={14} /> {alertData.impact.lanesClosed} ปิด</div>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Navigation size={14} /> จำกัด {alertData.impact.speedLimit} กม./ชม.</div>
              <p className="text-xs text-red-600 font-semibold">กรุณาลดความเร็วและขับขี่ด้วยความระมัดระวัง</p>
              <button onClick={dismissAlert} className="w-full bg-gray-100 py-2.5 rounded-xl text-sm text-gray-700 font-medium hover:bg-gray-200 transition-all">ปิด</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-blue-50" style={{ minHeight: "100vh" }}>
        {/* Simulated GPS road */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }} viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#94a3b8" stopOpacity="0.6" /><stop offset="50%" stopColor="#64748b" /><stop offset="100%" stopColor="#94a3b8" stopOpacity="0.6" /></linearGradient>
          </defs>
          {/* Road */}
          <path d="M 30 0 C 30 50, 360 80, 360 140 C 360 200, 40 230, 40 290 C 40 350, 350 380, 350 450 C 350 520, 30 550, 30 620 C 30 660, 200 680, 200 720" fill="none" stroke="url(#roadGrad)" strokeWidth="18" strokeLinecap="round" />
          {/* Road dashes */}
          <path d="M 30 0 C 30 50, 360 80, 360 140 C 360 200, 40 230, 40 290 C 40 350, 350 380, 350 450 C 350 520, 30 550, 30 620 C 30 660, 200 680, 200 720" fill="none" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="12 12" strokeLinecap="round" />
          {/* Traveled path (green) */}
          <path d={`M 30 0 C 30 50, 360 80, 360 140 C 360 200, 40 230, 40 290 C 40 350, 350 380, 350 450 C 350 520, 30 550, 30 ${300 + carPosition * 3.2}`} fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </svg>

        {/* Car on GPS path */}
        <div className="absolute z-10 transition-all duration-1000 ease-linear" style={{ top: `${300 + carPosition * 3.2 * (700 / 100) * (window.innerWidth > 400 ? 1 : 0.8)}px`, left: "50%", transform: "translate(-50%, -50%)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><circle cx="12" cy="12" r="10" fill="#3b82f6" fillOpacity="0.2" /><circle cx="12" cy="12" r="4" fill="#1e40af" /></svg>
          <p className="text-[9px] font-bold text-blue-700 text-center mt-0.5 bg-white/80 rounded-full px-1">คุณอยู่ที่นี่</p>
        </div>

        {/* Map pins positioned along the road */}
        {activeZones.map((z, i) => {
          const posX = 30 + (i * 25) % 80;
          const posY = 100 + i * 120;
          return (
            <button key={z.id} onClick={() => { setSelectedZone(z); setPublicView("detail"); }} className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2" style={{ top: `${posY}px`, left: `${posX}%` }}>
              <MapPin size={22} className={`${riskColors[z.riskLevel]} drop-shadow-lg hover:scale-125 transition-transform`} />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-[9px] font-bold text-gray-700 px-1.5 py-0.5 rounded-full shadow whitespace-nowrap">🚧 ทางหลวง {z.highway}</span>
            </button>
          );
        })}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-3 flex items-center justify-between bg-gradient-to-b from-white/95 to-transparent pb-6">
          <div>
            <h1 className="text-sm font-bold text-gray-900">DOH SafeZone</h1>
            <p className="text-[10px] text-gray-500">แผนที่เรียลไทม์</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1 text-[10px] text-red-500 font-medium"><LogOut size={14} /> ออก</button>
        </div>

        {/* Speed indicator */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur rounded-xl p-2 shadow-sm">
          <p className="text-xs font-bold text-gray-700 text-center">🚗</p>
          <p className="text-[10px] text-gray-500">45 กม./ชม.</p>
        </div>

        {/* Legend */}
        <div className="absolute top-20 right-4 z-20 bg-white/90 backdrop-blur rounded-xl p-2.5 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-[10px]"><div className="w-3 h-3 rounded-full bg-red-500" /> เสี่ยงสูง</div>
          <div className="flex items-center gap-2 text-[10px]"><div className="w-3 h-3 rounded-full bg-yellow-500" /> ปานกลาง</div>
          <div className="flex items-center gap-2 text-[10px]"><div className="w-3 h-3 rounded-full bg-blue-400" /> เสี่ยงต่ำ</div>
        </div>

        {/* Bottom controls */}
        <div className="fixed bottom-6 left-0 right-0 z-20 px-4">
          <button onClick={handleDrivingSimulation} className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
            <Navigation size={20} /> จำลองการขับขี่
          </button>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setPublicView("route")} className="flex-1 bg-white/90 backdrop-blur rounded-xl py-2.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-white transition-all flex items-center justify-center gap-1"><Route size={14} /> เส้นทาง</button>
            <button onClick={() => addNotification("ไม่มีการแจ้งเตือนใหม่!")} className="flex-1 bg-white/90 backdrop-blur rounded-xl py-2.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-white transition-all flex items-center justify-center gap-1"><Bell size={14} /> แจ้งเตือน</button>
          </div>
        </div>

        {/* FAB - Report Issue (positioned above bottom controls) */}
        <button onClick={() => setShowFeedbackSheet(true)} className="fixed bottom-36 right-4 z-30 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-4 py-3 shadow-lg transition-all active:scale-[0.95] flex items-center gap-2">
          <AlertOctagon size={20} />
          <span className="text-xs font-bold">แจ้งปัญหา</span>
        </button>
      </div>

      {/* Feedback toast */}
      {showFeedbackToast && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slideDown"><div className="bg-green-600 text-white rounded-xl p-4 shadow-lg text-sm text-center font-medium">ขอบคุณ! รายงานของคุณถูกส่งให้เจ้าหน้าที่แล้ว 🙏</div></div>
      )}

      {/* Feedback Bottom Sheet */}
      {showFeedbackSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fadeIn" onClick={() => setShowFeedbackSheet(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slideDown pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-lg">แจ้งปัญหาบนทางหลวง</h3>
              <button onClick={() => setShowFeedbackSheet(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="text-sm font-semibold text-gray-700 mb-2 block">ประเภทปัญหา (จำเป็น)</label>
                <div className="space-y-1.5">
                  {Object.entries(issueTypeLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setFeedbackIssueType(key)} className={`w-full text-left p-3 rounded-xl border transition-all ${feedbackIssueType === key ? "bg-orange-50 border-orange-400 text-orange-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}><span className="text-sm">{label}</span></button>
                  ))}
                </div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 mb-2 block">ตำแหน่ง (ระบุอัตโนมัติ)</label>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm font-medium">{feedbackLocation || "ทางหลวงหมายเลข 32 ใกล้ กม. 46"}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">📍 14.1234, 100.1234</span>
                    <button onClick={() => setFeedbackLocation("ทางหลวงหมายเลข " + Math.floor(Math.random() * 50 + 1) + " ใกล้ กม. " + Math.floor(Math.random() * 100))} className="text-xs text-blue-600 font-medium">📍 แก้ไขตำแหน่ง</button>
                  </div>
                  <div className="bg-gradient-to-br from-gray-200 to-blue-100 h-20 mt-2 rounded-lg relative overflow-hidden"><div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(180,180,180,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(180,180,180,0.3) 1px, transparent 1px)", backgroundSize: "10px 10px" }} /><div className="absolute inset-0 flex items-center justify-center"><MapPin size={20} className="text-red-500" /></div></div>
                </div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 mb-2 block">📸 แนบรูปประกอบ (ถ้ามี)</label><p className="text-[10px] text-gray-400 mb-2">รูปถ่ายช่วยให้เจ้าหน้าที่ดำเนินการได้รวดเร็วขึ้น</p>
                <div className="flex flex-wrap gap-2">
                  {feedbackPhotos.map((p, i) => (<div key={i} className="relative"><img src={p.url} alt="feedback" className="w-20 h-20 rounded-lg object-cover" /><button onClick={() => setFeedbackPhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"><X size={10} /></button></div>))}
                  {feedbackPhotos.length < 2 && (<button onClick={handleFeedbackPhotoUpload} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all"><Camera size={22} /><span className="text-[8px] mt-0.5">ถ่ายภาพ</span></button>)}
                </div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 mb-2 block">คำอธิบายเพิ่มเติม (ถ้ามี)</label>
                <textarea value={feedbackDesc} onChange={(e) => setFeedbackDesc(e.target.value)} placeholder="อธิบายเพิ่มเติม เช่น รถพลิกคว่ำ 1 คัน อยู่ด้านซ้ายมือ" maxLength={200} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2} />
                <p className="text-[10px] text-gray-400 text-right">{feedbackDesc.length}/200</p>
              </div>
              <button onClick={handleSubmitFeedback} disabled={!feedbackIssueType} className={`w-full py-4 rounded-xl font-bold text-base transition-all ${feedbackIssueType ? "bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>ส่งรายงาน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
