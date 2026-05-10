import { useState } from "react";
import { Shield, CheckCircle, X, AlertTriangle, Clock, ChevronRight, ChevronLeft, BarChart3, FileText, MessageSquare, LogOut } from "lucide-react";
import { contractors, issueTypeLabels } from "../data/initialData";

function gradeBadge(score) {
  let label, color, bg;
  if (score >= 80) { label = "ดี"; color = "text-green-700"; bg = "bg-green-100 border-green-300"; }
  else if (score >= 60) { label = "พอใช้"; color = "text-yellow-700"; bg = "bg-yellow-100 border-yellow-300"; }
  else { label = "ต้องปรับปรุง"; color = "text-red-700"; bg = "bg-red-100 border-red-300"; }
  return <span className={`px-3 py-1 rounded-full text-sm font-bold border ${bg} ${color}`}>{label} ({score}/100)</span>;
}

function kpiColor(val, thresholds) {
  if (val >= thresholds[0]) return { color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
  if (val >= thresholds[1]) return { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
  return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
}

function kpiColorReverse(val, thresholds) {
  if (val <= thresholds[0]) return { color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
  if (val <= thresholds[1]) return { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
  return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
}

export default function AdminView({ zones, setZones, addNotification, feedback, setFeedback, onLogout }) {
  const [adminView, setAdminView] = useState("overview");
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [approvalTab, setApprovalTab] = useState("new");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectZoneId, setRejectZoneId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingZones = zones.filter((z) => z.status === "Pending Approval");
  const activeZones = zones.filter((z) => z.status === "Active");
  const highRiskZones = zones.filter((z) => z.riskLevel === "High");
  const completionZones = zones.filter((z) => z.status === "Pending Completion Review");
  const pendingFeedback = feedback.filter((f) => f.status === "Pending Review");

  const handleApprove = (id) => {
    setZones((prev) => prev.map((z) => z.id === id ? { ...z, status: "Active", approvedAt: new Date().toISOString(), kpiScore: Math.floor(Math.random() * 15) + 85, lastUpdated: new Date().toISOString() } : z));
    addNotification("อนุมัติรายงานแล้ว ข้อมูลถูกส่งไปยังแพลตฟอร์มสาธารณะ");
  };

  const openReject = (id) => {
    setRejectZoneId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) { addNotification("กรุณากรอกเหตุผลในการปฏิเสธ"); return; }
    setZones((prev) => prev.map((z) => z.id === rejectZoneId ? { ...z, status: "Rejected", rejectReason, lastUpdated: new Date().toISOString() } : z));
    addNotification(`ปฏิเสธรายงาน พร้อมเหตุผล: ${rejectReason}`);
    setShowRejectModal(false);
    setRejectZoneId(null);
    setRejectReason("");
  };

  const handleApproveCompletion = (id) => {
    setZones((prev) => prev.map((z) => z.id === id ? { ...z, status: "Completed", lastUpdated: new Date().toISOString() } : z));
    addNotification("อนุมัติการปิดงานแล้ว สถานะเปลี่ยนเป็นเสร็จสิ้น");
  };

  const handleRejectCompletion = (id) => {
    setZones((prev) => prev.map((z) => z.id === id ? { ...z, status: "Active", lastUpdated: new Date().toISOString() } : z));
    addNotification("ปฏิเสธการปิดงาน ส่งกลับให้ผู้รับเหมาแก้ไข");
  };

  const handleFeedbackResolve = (fid) => {
    setFeedback((prev) => prev.map((f) => f.id === fid ? { ...f, status: "Resolved" } : f));
    addNotification("ปิดรายงานจากประชาชนแล้ว");
  };

  const statusBadge = (status) => {
    const colors = { Active: "bg-green-100 text-green-800", "Pending Approval": "bg-yellow-100 text-yellow-800", Rejected: "bg-red-100 text-red-800", Completed: "bg-blue-100 text-blue-800", Paused: "bg-gray-100 text-gray-800", "Pending Completion Review": "bg-purple-100 text-purple-800" };
    const icons = { Active: CheckCircle, "Pending Approval": Clock, Rejected: X, Completed: CheckCircle, Paused: X, "Pending Completion Review": Clock };
    const labels = { Active: "กำลังดำเนินการ", "Pending Approval": "รออนุมัติ", Rejected: "ปฏิเสธ", Completed: "เสร็จสิ้น", Paused: "หยุดชั่วคราว", "Pending Completion Review": "รอยืนยันการปิดงาน" };
    const Icon = icons[status] || Clock;
    return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}><Icon size={12} />{labels[status]}</span>;
  };

  const riskBadge = (risk) => {
    const colors = { High: "bg-red-100 text-red-800", Medium: "bg-yellow-100 text-yellow-800", Low: "bg-green-100 text-green-800" };
    const labels = { High: "สูง", Medium: "ปานกลาง", Low: "ต่ำ" };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[risk] || "bg-gray-100 text-gray-800"}`}>{labels[risk]}</span>;
  };

  const issueIcon = { accident: "🚨", no_sign: "⚠️", data_mismatch: "📍", heavy_traffic: "🚗", other: "💬" };

  if (adminView === "feedback") {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setAdminView("overview")} className="flex items-center gap-1 text-blue-700"><ChevronLeft size={20} /> กลับ</button>
          <span className="text-sm text-gray-500">{pendingFeedback.length} รายการรอ</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">รายงานจากประชาชน</h2>
        {feedback.length === 0 ? (
          <div className="text-center py-12"><CheckCircle size={48} className="mx-auto text-green-400 mb-3" /><p className="text-gray-500">ไม่มีรายงานจากประชาชน</p></div>
        ) : (
          <div className="space-y-3">
            {feedback.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{issueIcon[f.issueType] || "💬"}</span>
                    <div className="min-w-0"><h3 className="font-semibold text-sm truncate">{issueTypeLabels[f.issueType] || f.issueType}</h3><p className="text-xs text-gray-500">ID: {f.id}</p></div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${f.status === "Pending Review" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{f.status === "Pending Review" ? "รอตรวจสอบ" : "ดำเนินการแล้ว"}</span>
                </div>
                <div className="text-xs text-gray-600 mb-2 space-y-1">
                  <p>📍 {f.location}</p>
                  <p>🕐 {new Date(f.submittedAt).toLocaleString("th-TH")}</p>
                  {f.description && <p className="text-gray-700 mt-1 bg-gray-50 rounded-lg p-2">"{f.description}"</p>}
                </div>
                {f.photoUrl && <div className="mb-3"><img src={f.photoUrl} alt="feedback" className="w-full h-32 object-cover rounded-lg" /></div>}
                {f.status === "Pending Review" && (
                  <button onClick={() => handleFeedbackResolve(f.id)} className="w-full bg-green-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-1.5"><CheckCircle size={16} /> ดำเนินการแล้ว</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (adminView === "approvals") {
    const items = approvalTab === "new" ? pendingZones : completionZones;
    const title = approvalTab === "new" ? "รายงานที่รออนุมัติ" : "รอยืนยันการปิดงาน";

    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setAdminView("overview")} className="flex items-center gap-1 text-blue-700"><ChevronLeft size={20} /> กลับ</button>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button onClick={() => setApprovalTab("new")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${approvalTab === "new" ? "bg-white shadow text-blue-700" : "text-gray-500"}`}>การแจ้งงานใหม่ ({pendingZones.length})</button>
          <button onClick={() => setApprovalTab("completion")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${approvalTab === "completion" ? "bg-white shadow text-purple-700" : "text-gray-500"}`}>รอยืนยันการปิดงาน ({completionZones.length})</button>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
        {items.length === 0 ? (
          <div className="text-center py-12"><CheckCircle size={48} className="mx-auto text-green-400 mb-3" /><p className="text-gray-500">ไม่มีรายการที่ต้องดำเนินการ</p></div>
        ) : (
          <div className="space-y-3">
            {items.map((z) => (
              <div key={z.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div><h3 className="font-semibold text-sm">{z.projectName}</h3><p className="text-xs text-gray-500">ID: {z.id} • {z.contractor}</p></div>
                  {riskBadge(z.riskLevel)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <span>ทางหลวง {z.highway}</span><span>กม. {z.startKm}-{z.endKm}</span>
                  <span>{z.workType}</span><span>ส่งเมื่อ: {new Date(z.submittedAt).toLocaleDateString("th-TH")}</span>
                </div>
                {approvalTab === "completion" && z.completionPhotos && z.completionPhotos.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">{z.completionPhotos.map((p, i) => <img key={i} src={p.url} alt="completion" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />)}</div>
                )}
                {approvalTab === "completion" && z.completionNote && <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">หมายเหตุ: {z.completionNote}</p>}
                <div className="flex gap-2">
                  {approvalTab === "new" ? (<>
                    <button onClick={() => handleApprove(z.id)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"><CheckCircle size={16} /> อนุมัติ</button>
                    <button onClick={() => openReject(z.id)} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"><X size={16} /> ปฏิเสธ</button>
                  </>) : (<>
                    <button onClick={() => handleApproveCompletion(z.id)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"><CheckCircle size={16} /> อนุมัติปิดงาน</button>
                    <button onClick={() => handleRejectCompletion(z.id)} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"><X size={16} /> ส่งกลับ</button>
                  </>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
            <div className="bg-white rounded-2xl p-5 w-80 shadow-2xl">
              <h3 className="font-bold text-lg mb-1">เหตุผลที่ปฏิเสธ</h3>
              <p className="text-xs text-gray-500 mb-3">กรุณาระบุเหตุผลเพื่อแจ้งผู้รับเหมา</p>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="เช่น ข้อมูลไม่ครบถ้วน / รูปถ่ายไม่ชัดเจน" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3" rows={3} />
              <div className="flex gap-2">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200">ยกเลิก</button>
                <button onClick={confirmReject} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700">ยืนยันปฏิเสธ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (adminView === "kpiDetail" && selectedContractor) {
    const ct = selectedContractor;
    const ctZones = zones.filter((z) => z.contractorId === ct.id).length;
    const metrics = [
      { label: "แจ้งล่วงหน้าก่อนเริ่มงาน", icon: "📋", value: `22/24 ครั้ง (${ct.kpi.onTimeReporting}%)`, numVal: ct.kpi.onTimeReporting, thresholds: [80, 60] },
      { label: "อัปโหลดรูปตรงเวลา", icon: "📸", value: `20/24 ครั้ง (${ct.kpi.photoCompliance}%)`, numVal: ct.kpi.photoCompliance, thresholds: [80, 60] },
      { label: "งานเสร็จตรงเวลาตามสัญญา", icon: "⏱️", value: `11/12 โครงการ (${ct.kpi.onTimeCompletion}%)`, numVal: ct.kpi.onTimeCompletion, thresholds: [90, 70] },
      { label: "ร้องเรียนจากประชาชน", icon: "💬", value: `${ct.kpi.publicComplaints} ครั้ง`, numVal: ct.kpi.publicComplaints, thresholds: [2, 5], reverse: true },
      { label: "ความครบถ้วนของข้อมูล", icon: "✅", value: `${ct.kpi.dataCompleteness}%`, numVal: ct.kpi.dataCompleteness, thresholds: [90, 75] },
      { label: "คะแนนรวม", icon: "🏆", value: `${ct.kpi.overallScore}/100`, numVal: ct.kpi.overallScore, thresholds: [80, 60] }
    ];

    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={() => setAdminView("kpi")} className="flex items-center gap-1 text-blue-700 mb-4"><ChevronLeft size={20} /> กลับ</button>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-lg">{ct.name}</h2>
            {gradeBadge(ct.kpi.overallScore)}
          </div>
          <p className="text-xs text-gray-500">โครงการทั้งหมด: {ctZones} โครงการ</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {metrics.map((m) => {
            const style = m.reverse ? kpiColorReverse(m.numVal, m.thresholds) : kpiColor(m.numVal, m.thresholds);
            return (
              <div key={m.label} className={`${style.bg} ${style.border} border rounded-xl p-4`}>
                <p className="text-xl mb-1">{m.icon}</p>
                <p className={`text-lg font-bold ${style.color}`}>{m.value}</p>
                <p className="text-xs text-gray-600 mt-0.5">{m.label}</p>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-2"><FileText size={16} className="text-blue-500" />หมายเหตุจากเจ้าหน้าที่</div>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{ct.kpi.adminNote}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">แนวโน้มรายเดือน</h3>
          <div className="flex items-end gap-2 h-24">
            {ct.monthlyTrend.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-50 rounded-t h-20 relative"><div className="absolute bottom-0 w-full bg-blue-600 rounded-t transition-all" style={{ height: `${val}%` }} /></div>
                <span className="text-[10px] text-gray-400">{["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (adminView === "kpi") {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setAdminView("overview")} className="flex items-center gap-1 text-blue-700"><ChevronLeft size={20} /> กลับ</button>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">ติดตาม KPI</h2>
        <p className="text-xs text-gray-500 mb-4">ประเมินผลผู้รับเหมา</p>
        <div className="space-y-3">
          {contractors.map((ct) => {
            const ctZoneCount = zones.filter((z) => z.contractorId === ct.id && z.status === "Active").length;
            return (
              <button key={ct.id} onClick={() => { setSelectedContractor(ct); setAdminView("kpiDetail"); }} className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left hover:shadow-md transition-all active:scale-[0.99]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm">{ct.name}</h3>
                  {gradeBadge(ct.kpi.overallScore)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">กำลังดำเนินการ: {ctZoneCount} โครงการ</span>
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-1">ดูรายละเอียด <ChevronRight size={14} /></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">DOH Admin</h1>
          <p className="text-xs text-gray-500">ระบบติดตามการก่อสร้างทั่วประเทศ</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium"><LogOut size={16} /> ออกจากระบบ</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-2xl font-bold text-blue-700">{activeZones.length}</p><p className="text-xs text-gray-500">กำลังดำเนินการ</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-2xl font-bold text-yellow-600">{pendingZones.length}</p><p className="text-xs text-gray-500">รอดำเนินการ</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-2xl font-bold text-red-600">{highRiskZones.length}</p><p className="text-xs text-gray-500">ความเสี่ยงสูง</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-2xl font-bold text-green-600">92%</p><p className="text-xs text-gray-500">การรายงานตรงเวลา</p></div>
      </div>

      <div className="space-y-3 mb-4">
        <button onClick={() => setAdminView("approvals")} className="w-full flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center"><Clock size={20} className="text-yellow-600" /></div><div className="text-left"><p className="font-semibold text-sm text-gray-900">{pendingZones.length + completionZones.length} รายงานที่ต้องดำเนินการ</p><p className="text-xs text-gray-500">คลิกเพื่อตรวจสอบและอนุมัติ</p></div></div>
          <ChevronRight size={20} className="text-yellow-600" />
        </button>
        <button onClick={() => setAdminView("kpi")} className="w-full flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><BarChart3 size={20} className="text-blue-600" /></div><div className="text-left"><p className="font-semibold text-sm text-gray-900">ติดตาม KPI ผู้รับเหมา</p><p className="text-xs text-gray-500">{contractors.length} ผู้รับเหมา</p></div></div>
          <ChevronRight size={20} className="text-blue-600" />
        </button>
        <button onClick={() => setAdminView("feedback")} className="w-full flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><MessageSquare size={20} className="text-orange-600" /></div><div className="text-left"><p className="font-semibold text-sm text-gray-900">รายงานจากประชาชน</p><p className="text-xs text-gray-500">{pendingFeedback.length} รายการรอตรวจสอบ</p></div></div>
          <ChevronRight size={20} className="text-orange-600" />
        </button>
      </div>

      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">เขตงานก่อสร้างทั้งหมด</h2>
      <div className="space-y-2">
        {zones.map((z) => (
          <div key={z.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1"><h3 className="text-sm font-semibold">{z.projectName}</h3>{riskBadge(z.riskLevel)}</div>
            <p className="text-xs text-gray-500 mb-2">ทางหลวง {z.highway} • {z.contractor}</p>
            <div className="flex items-center justify-between">{statusBadge(z.status)}<span className="text-xs text-gray-400">กม. {z.startKm}-{z.endKm}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
