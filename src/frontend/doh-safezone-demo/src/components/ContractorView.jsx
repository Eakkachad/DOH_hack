import { useState } from "react";
import { Plus, MapPin, Calendar, Clock, Camera, CheckSquare, Square, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle, X, Navigation, HardHat, LogOut, Edit3, Trash2, RefreshCw, AlertOctagon } from "lucide-react";

const dummyPhotos = [
  "https://images.unsplash.com/photo-1541888946425-d81bbd40a9d1?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1590674899484-13f8e9f6c21f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop"
];

function needUpdate(lastUpdated) {
  const now = new Date();
  const last = new Date(lastUpdated);
  const hours = (now - last) / (1000 * 60 * 60);
  return hours >= 48;
}

function hoursSince(lastUpdated) {
  const now = new Date();
  const last = new Date(lastUpdated);
  return Math.floor((now - last) / (1000 * 60 * 60));
}

export default function ContractorView({ zones, setZones, kpiData, addNotification, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [formStep, setFormStep] = useState(0);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    projectName: "", highway: "", startKm: "", endKm: "", workType: "Surface Repair", riskLevel: "Medium",
    startDate: "", endDate: "", workHoursStart: "", workHoursEnd: "", lanesClosed: "", speedLimit: "",
    alertRadius: "1", lat: 14.0, lng: 100.5,
    photos: [],
    safetyChecklist: { warningSigns: false, nighttimeLighting: false, trafficCones: false, speedLimitSigns: false }
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dateError, setDateError] = useState("");

  const [showCompletionSheet, setShowCompletionSheet] = useState(false);
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [completionNote, setCompletionNote] = useState("");
  const [completionChecked, setCompletionChecked] = useState(false);
  const [completionPreview, setCompletionPreview] = useState(null);

  const [showUpdateSheet, setShowUpdateSheet] = useState(false);
  const [updatePhotos, setUpdatePhotos] = useState([]);
  const [updateNote, setUpdateNote] = useState("");

  const resetForm = () => {
    setForm({
      projectName: "", highway: "", startKm: "", endKm: "", workType: "Surface Repair", riskLevel: "Medium",
      startDate: "", endDate: "", workHoursStart: "", workHoursEnd: "", lanesClosed: "", speedLimit: "",
      alertRadius: "1", lat: 14.0, lng: 100.5,
      photos: [],
      safetyChecklist: { warningSigns: false, nighttimeLighting: false, trafficCones: false, speedLimitSigns: false }
    });
    setFormStep(0);
    setIsEditing(false);
    setDateError("");
  };

  const handleChecklistToggle = (item) => {
    setForm((prev) => ({ ...prev, safetyChecklist: { ...prev.safetyChecklist, [item]: !prev.safetyChecklist[item] } }));
  };

  const handlePhotoUpload = () => {
    const randomPhoto = dummyPhotos[form.photos.length % dummyPhotos.length];
    setForm((prev) => ({ ...prev, photos: [...prev.photos, { url: randomPhoto, timestamp: new Date().toLocaleString() }] }));
    setPhotoPreview(randomPhoto);
    setTimeout(() => setPhotoPreview(null), 1500);
  };

  const handleCompletionPhotoUpload = () => {
    if (completionPhotos.length >= 3) return;
    const randomPhoto = dummyPhotos[completionPhotos.length % dummyPhotos.length];
    setCompletionPhotos((prev) => [...prev, { url: randomPhoto, timestamp: new Date().toLocaleString(), gps: "14.1234, 100.1234" }]);
    setCompletionPreview(randomPhoto);
    setTimeout(() => setCompletionPreview(null), 1500);
  };

  const handleUpdatePhotoUpload = () => {
    if (updatePhotos.length >= 3) return;
    const randomPhoto = dummyPhotos[updatePhotos.length % dummyPhotos.length];
    setUpdatePhotos((prev) => [...prev, { url: randomPhoto, timestamp: new Date().toLocaleString() }]);
  };

  const validateDates = (d1, d2) => {
    if (d1 && d2 && d2 < d1) {
      setDateError("วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleSubmitReport = () => {
    if (!form.projectName) { addNotification("กรุณากรอกชื่อโครงการ"); return; }
    if (!form.highway) { addNotification("กรุณากรอกหมายเลขทางหลวง"); return; }
    if (form.startDate && form.endDate && form.endDate < form.startDate) { setDateError("วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น"); return; }

    const hoursStr = (form.workHoursStart && form.workHoursEnd) ? `${form.workHoursStart}-${form.workHoursEnd}` : "22:00-05:00";
    const kmStr = (s, e) => `${s.replace(/\+/g, "")}${(s && e) ? "+000" : ""}`;

    if (isEditing && selectedZone) {
      setZones((prev) => prev.map((z) => z.id === selectedZone.id ? {
        ...z,
        projectName: form.projectName,
        highway: form.highway,
        startKm: form.startKm + "+000",
        endKm: form.endKm + "+000",
        workType: form.workType,
        riskLevel: form.riskLevel,
        schedule: { start: form.startDate || z.schedule.start, end: form.endDate || z.schedule.end, hours: hoursStr },
        impact: { lanesClosed: form.lanesClosed || z.impact.lanesClosed, speedLimit: parseInt(form.speedLimit) || z.impact.speedLimit },
        alertRadius: parseFloat(form.alertRadius) || z.alertRadius,
        photos: form.photos.length > 0 ? form.photos : z.photos,
        safetyChecklist: form.safetyChecklist,
        lastUpdated: new Date().toISOString()
      } : z));
      addNotification("อัปเดตรายงานสำเร็จ");
    } else {
      const newZone = {
        id: `CZ-${String(zones.length + 3).padStart(3, "0")}`,
        projectName: form.projectName || `โครงการใหม่ ทางหลวง ${form.highway}`,
        highway: form.highway,
        startKm: form.startKm + "+000",
        endKm: form.endKm + "+000",
        workType: form.workType,
        status: "Pending Approval",
        riskLevel: form.riskLevel,
        contractor: "บริษัท ก่อสร้างทางหลวงไทย จำกัด",
        contractorId: "CT-001",
        schedule: { start: form.startDate || "2026-06-01", end: form.endDate || "2026-06-15", hours: hoursStr },
        impact: { lanesClosed: form.lanesClosed || "1 เลน", speedLimit: parseInt(form.speedLimit) || 60 },
        alertRadius: parseFloat(form.alertRadius) || 1,
        lat: form.lat, lng: form.lng,
        photos: form.photos,
        completionPhotos: [], completionNote: "",
        safetyChecklist: form.safetyChecklist,
        submittedAt: new Date().toISOString(),
        approvedAt: null, kpiScore: null,
        lastUpdated: new Date().toISOString(),
        rejectReason: "", updates: []
      };
      setZones((prev) => [...prev, newZone]);
      addNotification("ส่งรายงานสำเร็จ รอการอนุมัติจาก DOH");
    }
    setView("dashboard");
    resetForm();
  };

  const handleStartEdit = (zone) => {
    setSelectedZone(zone);
    setIsEditing(true);
    setForm({
      projectName: zone.projectName,
      highway: zone.highway,
      startKm: zone.startKm.replace(/\+\d+/, ""),
      endKm: zone.endKm.replace(/\+\d+/, ""),
      workType: zone.workType,
      riskLevel: zone.riskLevel,
      startDate: zone.schedule.start,
      endDate: zone.schedule.end,
      workHoursStart: zone.schedule.hours.split("-")[0] || "",
      workHoursEnd: zone.schedule.hours.split("-")[1] || "",
      lanesClosed: zone.impact.lanesClosed,
      speedLimit: String(zone.impact.speedLimit),
      alertRadius: String(zone.alertRadius),
      lat: zone.lat, lng: zone.lng,
      photos: [...zone.photos],
      safetyChecklist: { ...zone.safetyChecklist }
    });
    setView("createReport");
    setFormStep(0);
    setDateError("");
  };

  const handleDeleteZone = (zone) => {
    setZones((prev) => prev.filter((z) => z.id !== zone.id));
    addNotification("ลบโครงการเรียบร้อยแล้ว");
    setShowDeleteConfirm(false);
    setSelectedZone(null);
  };

  const handleReportProblem = (zone) => {
    const now = new Date().toISOString();
    setZones((prev) => prev.map((z) => z.id === zone.id ? {
      ...z,
      updates: [...(z.updates || []), { type: "problem", photos: [], note: "แจ้งปัญหาจากผู้รับเหมา", timestamp: now }],
      lastUpdated: now
    } : z));
    addNotification("แจ้งปัญหาแล้ว ข้อมูลถูกส่งไปยัง DOH");
  };

  const handleSubmitUpdate = () => {
    if (!selectedZone) return;
    const now = new Date().toISOString();
    setZones((prev) => prev.map((z) => z.id === selectedZone.id ? {
      ...z,
      updates: [...(z.updates || []), { type: "update", photos: updatePhotos, note: updateNote, timestamp: now }],
      lastUpdated: now
    } : z));
    addNotification("อัปเดตรายงาน 48 ชม. สำเร็จ");
    setShowUpdateSheet(false);
    setUpdatePhotos([]);
    setUpdateNote("");
  };

  const handleSubmitCompletion = () => {
    if (!selectedZone) return;
    setZones((prev) => prev.map((z) => z.id === selectedZone.id ? {
      ...z, status: "Pending Completion Review", completionPhotos, completionNote, lastUpdated: new Date().toISOString()
    } : z));
    addNotification("ส่งรายงานปิดงานแล้ว รอเจ้าหน้าที่ตรวจสอบ");
    setShowCompletionSheet(false);
    setCompletionPhotos([]);
    setCompletionNote("");
    setCompletionChecked(false);
    const updated = zones.map((z) => z.id === selectedZone.id ? {
      ...z, status: "Pending Completion Review", completionPhotos, completionNote
    } : z).find((z) => z.id === selectedZone.id);
    setSelectedZone(updated);
  };

  const statusBadge = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      "Pending Approval": "bg-yellow-100 text-yellow-800",
      Completed: "bg-blue-100 text-blue-800",
      Paused: "bg-gray-100 text-gray-800",
      "Pending Completion Review": "bg-purple-100 text-purple-800"
    };
    const labels = {
      Active: "กำลังดำเนินการ",
      "Pending Approval": "รออนุมัติ",
      Completed: "เสร็จสิ้น",
      Paused: "หยุดชั่วคราว",
      "Pending Completion Review": "รอยืนยันการปิดงาน"
    };
    const icons = { Active: CheckCircle, "Pending Approval": Clock, Completed: CheckCircle, Paused: X, "Pending Completion Review": Clock };
    const Icon = icons[status] || Clock;
    return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}><Icon size={12} />{labels[status]}</span>;
  };

  const riskBadge = (risk) => {
    const colors = { High: "bg-red-100 text-red-800", Medium: "bg-yellow-100 text-yellow-800", Low: "bg-green-100 text-green-800" };
    const icons = { High: AlertTriangle, Medium: AlertTriangle, Low: CheckCircle };
    const labels = { High: "สูง", Medium: "ปานกลาง", Low: "ต่ำ" };
    const Icon = icons[risk] || AlertTriangle;
    return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[risk] || "bg-gray-100 text-gray-800"}`}><Icon size={12} />{labels[risk]}</span>;
  };

  if (view === "jobDetail" && selectedZone) {
    const z = selectedZone;
    const canComplete = z.status === "Active" || z.status === "Paused";
    const isEditable = z.status === "Pending Approval";
    const isPendingCompletion = z.status === "Pending Completion Review";
    const hrsSince = hoursSince(z.lastUpdated);
    const overdue = needUpdate(z.lastUpdated) && z.status === "Active";

    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={() => setView("dashboard")} className="flex items-center gap-1 text-blue-700 mb-4">
          <ChevronLeft size={20} /> กลับไปหน้ารวม
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`bg-gradient-to-r ${z.status === "Rejected" ? "from-red-600 to-red-500" : "from-blue-700 to-blue-600"} p-5 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg">{z.projectName}</h2>
              {statusBadge(z.status)}
            </div>
            <p className="text-white/70 text-sm">ID: {z.id}</p>
            {z.rejectReason && <p className="text-red-200 text-xs mt-1 bg-white/10 rounded-lg px-2 py-1">เหตุผลที่ถูกปฏิเสธ: {z.rejectReason}</p>}
          </div>
          <div className="p-5 space-y-4">
            {overdue && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
                <div><p className="text-sm font-semibold text-red-700">ต้องอัปเดตรายงาน!</p><p className="text-xs text-red-600">ยังไม่ได้อัปเดตเป็นเวลา {hrsSince} ชม. (เกิน 48 ชม.)</p></div>
              </div>
            )}
            {!overdue && z.status === "Active" && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">อัปเดตล่าสุด: {hrsSince} ชม. ที่แล้ว (ภายใน 48 ชม.)</div>}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500">ทางหลวง</label><p className="font-semibold">หมายเลข {z.highway}</p></div>
              <div><label className="text-xs text-gray-500">ระดับความเสี่ยง</label><div>{riskBadge(z.riskLevel)}</div></div>
              <div className="col-span-2"><label className="text-xs text-gray-500">ตำแหน่ง</label><p className="font-semibold">กม. {z.startKm} - กม. {z.endKm}</p></div>
              <div className="col-span-2"><label className="text-xs text-gray-500">ผู้รับเหมา</label><p className="font-semibold">{z.contractor}</p></div>
            </div>
            <hr className="border-gray-100" />
            <div><label className="text-xs text-gray-500">ตารางการทำงาน</label><p className="text-sm"><Calendar size={14} className="inline mr-1 text-blue-600" />{z.schedule.start} ถึง {z.schedule.end}</p><p className="text-sm text-gray-600"><Clock size={14} className="inline mr-1" />{z.schedule.hours}</p></div>
            <div><label className="text-xs text-gray-500">ผลกระทบต่อการจราจร</label><p className="text-sm">{z.impact.lanesClosed} ปิด • จำกัด {z.impact.speedLimit} กม./ชม.</p></div>
            <div><label className="text-xs text-gray-500">รัศมีการแจ้งเตือน</label><p className="text-sm">{z.alertRadius} กม.</p></div>
            {z.photos.length > 0 && (
              <div><label className="text-xs text-gray-500">รูปถ่าย ({z.photos.length})</label><div className="flex gap-2 mt-1 overflow-x-auto">{z.photos.map((p, i) => <img key={i} src={p.url} alt={`Photo ${i + 1}`} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />)}</div></div>
            )}
            {z.completionPhotos && z.completionPhotos.length > 0 && (
              <div><label className="text-xs text-gray-500">รูปถ่ายปิดงาน ({z.completionPhotos.length})</label><div className="flex gap-2 mt-1 overflow-x-auto">{z.completionPhotos.map((p, i) => <img key={i} src={p.url} alt={`Completion ${i + 1}`} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />)}</div></div>
            )}
            {z.updates && z.updates.length > 0 && (
              <div><label className="text-xs text-gray-500">ประวัติการอัปเดต ({z.updates.length})</label>
                <div className="space-y-1 mt-1">
                  {z.updates.slice(-3).map((u, i) => (
                    <div key={i} className={`text-xs p-2 rounded-lg ${u.type === "problem" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                      {u.type === "problem" ? "⚠️ แจ้งปัญหา" : "📋 อัปเดตรายงาน"} — {new Date(u.timestamp).toLocaleString("th-TH")} {u.note ? `— "${u.note}"` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div><label className="text-xs text-gray-500">เช็กลิสต์ความปลอดภัย</label><div className="mt-1 space-y-1">{Object.entries(z.safetyChecklist).map(([key, val]) => (<div key={key} className="flex items-center gap-2 text-sm"><span className={val ? "text-green-600" : "text-red-400"}>{val ? <CheckSquare size={16} /> : <Square size={16} />}</span><span className="text-xs capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span></div>))}</div></div>
            {z.kpiScore && <div className="bg-blue-50 rounded-xl p-4"><label className="text-xs text-blue-700 font-semibold">คะแนน KPI</label><p className="text-2xl font-bold text-blue-700">{z.kpiScore}<span className="text-sm font-normal text-blue-500">/100</span></p></div>}

            <div className="space-y-2 pt-2">
              {(overdue || z.status === "Active") && (
                <button onClick={() => { setSelectedZone(z); setShowUpdateSheet(true); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <RefreshCw size={18} /> อัปเดตรายงาน 48 ชม.
                </button>
              )}
              {canComplete && (
                <button onClick={() => setShowCompletionSheet(true)} className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> แจ้งงานเสร็จสิ้น
                </button>
              )}
              {isPendingCompletion && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                  <Clock size={18} className="inline text-purple-600 mb-1" /><p className="text-sm font-semibold text-purple-700">รอการยืนยันจากเจ้าหน้าที่</p>
                </div>
              )}
              {isEditable && (
                <div className="flex gap-2">
                  <button onClick={() => handleStartEdit(z)} className="flex-1 bg-yellow-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-yellow-600 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                    <Edit3 size={16} /> แก้ไข
                  </button>
                  <button onClick={() => { setSelectedZone(z); setShowDeleteConfirm(true); }} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                    <Trash2 size={16} /> ลบ
                  </button>
                </div>
              )}
              {z.status === "Active" && !overdue && (
                <button onClick={() => handleReportProblem(z)} className="w-full bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                  <AlertOctagon size={16} /> รายงานปัญหา
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
              <h3 className="font-bold text-lg mb-2">ยืนยันการลบ</h3>
              <p className="text-sm text-gray-600 mb-4">คุณต้องการลบโครงการ "{selectedZone.projectName}" ใช่หรือไม่?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200">ยกเลิก</button>
                <button onClick={() => handleDeleteZone(selectedZone)} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700">ลบ</button>
              </div>
            </div>
          </div>
        )}

        {/* Update 48hr sheet */}
        {showUpdateSheet && selectedZone && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fadeIn" onClick={() => setShowUpdateSheet(false)}>
            <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slideDown" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="font-bold text-lg">อัปเดตรายงาน 48 ชม.</h3>
                <button onClick={() => setShowUpdateSheet(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">📍 {selectedZone.projectName} — ทางหลวง {selectedZone.highway}</p>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">📸 รูปถ่ายหน้างานปัจจุบัน</label>
                  <div className="flex flex-wrap gap-2">
                    {updatePhotos.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p.url} alt="update" className="w-20 h-20 rounded-lg object-cover" />
                        <button onClick={() => setUpdatePhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"><X size={10} /></button>
                      </div>
                    ))}
                    {updatePhotos.length < 3 && (
                      <button onClick={handleUpdatePhotoUpload} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all">
                        <Camera size={22} /><span className="text-[8px] mt-0.5">อัปโหลด</span>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">หมายเหตุ</label>
                  <textarea value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="รายงานความคืบหน้าหรือปัญหาที่พบ" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2} />
                </div>
                <button onClick={handleSubmitUpdate} className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all active:scale-[0.98]">ส่งอัปเดต</button>
                <button onClick={() => setShowUpdateSheet(false)} className="w-full py-2 text-sm text-gray-500">ยกเลิก</button>
              </div>
            </div>
          </div>
        )}

        {/* Completion sheet */}
        {showCompletionSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fadeIn" onClick={() => setShowCompletionSheet(false)}>
            <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slideDown" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="font-bold text-lg">ยืนยันการปิดงาน</h3>
                <button onClick={() => setShowCompletionSheet(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">📸 รูปถ่ายสภาพพื้นที่หลังเสร็จงาน (บังคับ)</label>
                  <div className="flex flex-wrap gap-2">
                    {completionPhotos.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p.url} alt="completion" className="w-20 h-20 rounded-lg object-cover" />
                        <button onClick={() => setCompletionPhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"><X size={10} /></button>
                      </div>
                    ))}
                    {completionPhotos.length < 3 && (
                      <button onClick={handleCompletionPhotoUpload} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-all">
                        <Camera size={22} /><span className="text-[8px] mt-0.5">ถ่ายภาพ</span>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                  <textarea value={completionNote} onChange={(e) => setCompletionNote(e.target.value)} placeholder="เช่น งานเสร็จก่อนกำหนด / เหลือวัสดุบางส่วน" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2} />
                </div>
                <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <button onClick={() => setCompletionChecked(!completionChecked)} className={`mt-0.5 flex-shrink-0 ${completionChecked ? "text-green-600" : "text-gray-300"}`}>
                    {completionChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <span className="text-xs text-gray-600">ข้าพเจ้าขอรับรองว่างานก่อสร้างในพื้นที่นี้เสร็จสมบูรณ์แล้ว และสภาพพื้นที่ถนนพร้อมใช้งาน</span>
                </label>
                <button onClick={handleSubmitCompletion} disabled={completionPhotos.length === 0 || !completionChecked}
                  className={`w-full py-4 rounded-xl font-bold text-base transition-all ${completionPhotos.length > 0 && completionChecked ? "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>ยืนยันปิดงาน</button>
                <button onClick={() => setShowCompletionSheet(false)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">ยกเลิก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === "createReport") {
    const step = formStep;
    const stepsLabels = ["ข้อมูลโครงการ", "แผนที่และ Geofence", "ตารางเวลา", "รูปถ่ายและปลอดภัย", "ตรวจสอบและส่ง"];
    const totalSteps = 5;

    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { if (step > 0) setFormStep(step - 1); else { setView("dashboard"); resetForm(); } }} className="flex items-center gap-1 text-blue-700"><ChevronLeft size={20} /> กลับ</button>
          <span className="text-sm text-gray-500">ขั้นตอนที่ {step + 1} จาก {totalSteps}</span>
        </div>
        <div className="flex gap-1 mb-4">{stepsLabels.map((_, i) => (<div key={i} className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-blue-600" : "bg-gray-200"}`} />))}</div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">ข้อมูลโครงการ</h3>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">ชื่อโครงการ <span className="text-red-400">*</span></label><input type="text" value={form.projectName} onChange={(e) => setForm((p) => ({ ...p, projectName: e.target.value }))} placeholder="เช่น ซ่อมผิวจราจร ทางหลวงหมายเลข 32" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">ทางหลวงหมายเลข <span className="text-red-400">*</span></label><input type="text" value={form.highway} onChange={(e) => setForm((p) => ({ ...p, highway: e.target.value }))} placeholder="เช่น 32" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">ประเภทงาน</label><select value={form.workType} onChange={(e) => setForm((p) => ({ ...p, workType: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none bg-white"><option value="Surface Repair">ซ่อมผิวจราจร</option><option value="Expansion">ขยายถนน</option><option value="Pipeline">ท่อลอด/วางท่อ</option><option value="Bridge">สะพาน</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">กิโลเมตรเริ่มต้น</label><input type="text" value={form.startKm} onChange={(e) => setForm((p) => ({ ...p, startKm: e.target.value.replace(/[+]/g, "") }))} placeholder="45" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">กิโลเมตรสิ้นสุด</label><input type="text" value={form.endKm} onChange={(e) => setForm((p) => ({ ...p, endKm: e.target.value.replace(/[+]/g, "") }))} placeholder="47" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">ระดับความเสี่ยง</label><div className="flex gap-2">{["Low", "Medium", "High"].map((r) => (<button key={r} onClick={() => setForm((p) => ({ ...p, riskLevel: r }))} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${form.riskLevel === r ? (r === "High" ? "bg-red-50 border-red-300 text-red-700" : r === "Medium" ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "bg-green-50 border-green-300 text-green-700") : "border-gray-200 text-gray-500 bg-white"}`}>{r === "Low" ? "ต่ำ" : r === "Medium" ? "ปานกลาง" : "สูง"}</button>))}</div></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">แผนที่และ Geofence</h3>
              <div className="bg-gradient-to-br from-gray-100 to-blue-50 rounded-xl h-48 relative overflow-hidden border border-gray-200">
                <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(200,200,200,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,200,200,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center animate-pulse"><div className="w-2 h-2 bg-blue-600 rounded-full" /></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <MapPin size={28} className="text-red-500 drop-shadow-lg" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-lg px-2 py-1 text-xs text-gray-600"><Navigation size={12} className="inline mr-1" />{form.lat.toFixed(4)}, {form.lng.toFixed(4)}</div>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all" onClick={() => { setForm((p) => ({ ...p, lat: 14.1234 + Math.random() * 0.1, lng: 100.1234 + Math.random() * 0.1 })); addNotification("ปักหมุดตำแหน่งสำเร็จ!") }}><Navigation size={16} className="inline mr-2" />ใช้ตำแหน่งปัจจุบัน</button>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">รัศมีการแจ้งเตือน (กม.)</label><div className="flex gap-2">{["0.5", "1", "3"].map((r) => (<button key={r} onClick={() => setForm((p) => ({ ...p, alertRadius: r }))} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${form.alertRadius === r ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-200 text-gray-500"}`}>{r} กม.</button>))}</div></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">ตารางเวลาและผลกระทบ</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">วันที่เริ่ม</label><input type="date" value={form.startDate} onChange={(e) => { setForm((p) => ({ ...p, startDate: e.target.value })); validateDates(e.target.value, form.endDate); }} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">วันที่สิ้นสุด</label><input type="date" value={form.endDate} onChange={(e) => { setForm((p) => ({ ...p, endDate: e.target.value })); validateDates(form.startDate, e.target.value); }} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              {dateError && <p className="text-xs text-red-500">{dateError}</p>}
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">เวลาทำงานประจำวัน</label><div className="flex gap-2 items-center"><input type="time" value={form.workHoursStart} onChange={(e) => setForm((p) => ({ ...p, workHoursStart: e.target.value }))} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /><span className="text-gray-400">ถึง</span><input type="time" value={form.workHoursEnd} onChange={(e) => setForm((p) => ({ ...p, workHoursEnd: e.target.value }))} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">ช่องจราจรที่ปิด</label><input type="text" value={form.lanesClosed} onChange={(e) => setForm((p) => ({ ...p, lanesClosed: e.target.value }))} placeholder="เช่น 1 เลนซ้าย" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">ความเร็วจำกัด (กม./ชม.)</label><input type="number" value={form.speedLimit} onChange={(e) => setForm((p) => ({ ...p, speedLimit: e.target.value }))} placeholder="60" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200"><div className="flex items-start gap-2"><AlertTriangle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" /><p className="text-sm text-yellow-800">ข้อความแจ้งเตือนจะถูกส่งให้ประชาชนที่เข้าใกล้เขตงานก่อสร้าง</p></div></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">รูปถ่ายและความปลอดภัย</h3>
              <div><label className="text-xs font-medium text-gray-600 mb-2 block">รูปถ่ายหน้างาน</label><div className="flex flex-wrap gap-2">{form.photos.map((p, i) => (<div key={i} className="relative"><img src={p.url} alt="site" className="w-16 h-16 rounded-lg object-cover" /><span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"><CheckCircle size={10} /></span></div>))}<button onClick={handlePhotoUpload} className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all"><Camera size={20} /><span className="text-[9px] mt-0.5">อัปโหลด</span></button></div>{photoPreview && <p className="text-xs text-green-600"><CheckCircle size={12} className="inline mr-1" />บันทึกรูปพร้อมเวลา</p>}</div>
              <hr className="border-gray-100" />
              <div><label className="text-xs font-medium text-gray-600 mb-2 block">เช็คลิสต์ความปลอดภัย</label><div className="space-y-2">{Object.entries(form.safetyChecklist).map(([key, val]) => (<button key={key} onClick={() => handleChecklistToggle(key)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${val ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}><span className={val ? "text-green-600" : "text-gray-300"}>{val ? <CheckSquare size={20} /> : <Square size={20} />}</span><span className="text-xs capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span></button>))}</div></div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">ตรวจสอบและส่ง</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">โครงการ</span><span className="font-medium">{form.projectName || "ไม่ได้ระบุ"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">ทางหลวง</span><span className="font-medium">หมายเลข {form.highway || "-"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">ตำแหน่ง</span><span className="font-medium">กม.{form.startKm}{form.endKm ? `-${form.endKm}` : ""}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">เวลา</span><span className="font-medium">{form.startDate || "-"} ถึง {form.endDate || "-"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">ระดับความเสี่ยง</span><span>{riskBadge(form.riskLevel)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">รูปถ่าย</span><span className="font-medium">{form.photos.length} รูป</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">เช็กลิสต์</span><span className="font-medium">{Object.values(form.safetyChecklist).filter(Boolean).length}/4 เสร็จ</span></div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-xs text-blue-700"><CheckCircle size={14} className="inline mr-1" />ข้อมูลนี้จะถูกบันทึกพร้อมเวลาและใช้ในการประเมิน KPI ผู้รับเหมา</p></div>
            </div>
          )}

          <div className="mt-5">
            <button onClick={() => { if (step < 4) setFormStep(step + 1); else handleSubmitReport(); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all">
              {step === 4 ? (isEditing ? "บันทึกการแก้ไข" : "ส่งรายงาน") : "ดำเนินการต่อ"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const myZones = zones.filter((z) => z.contractorId === "CT-001");
  const activeCount = myZones.filter((z) => z.status === "Active").length;
  const pendingCount = myZones.filter((z) => z.status === "Pending Approval").length;
  const completionReviewCount = myZones.filter((z) => z.status === "Pending Completion Review").length;
  const overdueCount = myZones.filter((z) => needUpdate(z.lastUpdated) && z.status === "Active").length;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ผู้รับเหมา</h1>
          <p className="text-xs text-gray-500">{kpiData.name}</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium"><LogOut size={16} /> ออกจากระบบ</button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-bold text-blue-700">{activeCount}</p>
          <p className="text-[10px] text-gray-500">กำลังทำ</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-[10px] text-gray-500">รออนุมัติ</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-bold text-purple-600">{completionReviewCount}</p>
          <p className="text-[10px] text-gray-500">รอตรวจ</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-bold text-red-600">{overdueCount}</p>
          <p className="text-[10px] text-gray-500">เลยกำหนด</p>
        </div>
      </div>

      <button onClick={() => setView("createReport")} className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg mb-4 flex items-center justify-center gap-2">
        <Plus size={20} /> สร้างรายงานใหม่
      </button>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">โครงการของคุณ</h2>
        {myZones.map((z) => {
          const hrsSince = hoursSince(z.lastUpdated);
          const overdue = needUpdate(z.lastUpdated) && z.status === "Active";
          return (
            <button key={z.id} onClick={() => { setSelectedZone(z); setView("jobDetail"); }} className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left hover:shadow-md transition-all active:scale-[0.99]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{z.projectName}</h3>
                </div>
                {riskBadge(z.riskLevel)}
              </div>
              <p className="text-xs text-gray-500 mb-2">ทางหลวง {z.highway} • กม. {z.startKm}-{z.endKm}</p>
              {overdue && <div className="mb-2"><span className="bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">⚠️ ไม่ได้อัปเดต {hrsSince} ชม.</span></div>}
              <div className="flex items-center justify-between">
                {statusBadge(z.status)}
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </button>
          );
        })}
        {myZones.length === 0 && <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีโครงการ สร้างรายงานแรกเลย!</p>}
      </div>
    </div>
  );
}
