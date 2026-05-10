export const initialZones = [
  {
    id: "CZ-001",
    projectName: "ซ่อมผิวจราจร ทางหลวงหมายเลข 32",
    highway: "32",
    startKm: "45+200",
    endKm: "47+800",
    workType: "Surface Repair",
    status: "Active",
    riskLevel: "Medium",
    contractor: "บริษัท ก่อสร้างทางหลวงไทย จำกัด",
    contractorId: "CT-001",
    schedule: { start: "2026-05-15", end: "2026-05-20", hours: "22:00-05:00" },
    impact: { lanesClosed: "1 เลนซ้าย", speedLimit: 60 },
    alertRadius: 1,
    lat: 14.1234,
    lng: 100.1234,
    photos: [],
    completionPhotos: [],
    completionNote: "",
    safetyChecklist: { warningSigns: true, nighttimeLighting: true, trafficCones: true, speedLimitSigns: true },
    submittedAt: "2026-05-09T10:30:00",
    approvedAt: "2026-05-10T08:00:00",
    kpiScore: 92,
    lastUpdated: "2026-05-09T10:30:00",
    rejectReason: "",
    updates: []
  },
  {
    id: "CZ-002",
    projectName: "ขยายสะพาน ทางหลวงหมายเลข 1",
    highway: "1",
    startKm: "12+000",
    endKm: "14+500",
    workType: "Bridge",
    status: "Pending Approval",
    riskLevel: "High",
    contractor: "บริษัท ซ่อมสร้าง 99 จำกัด",
    contractorId: "CT-002",
    schedule: { start: "2026-06-01", end: "2026-08-30", hours: "06:00-18:00" },
    impact: { lanesClosed: "2 เลน", speedLimit: 40 },
    alertRadius: 3,
    lat: 13.7563,
    lng: 100.5018,
    photos: [],
    completionPhotos: [],
    completionNote: "",
    safetyChecklist: { warningSigns: true, nighttimeLighting: false, trafficCones: true, speedLimitSigns: true },
    submittedAt: "2026-05-08T14:20:00",
    approvedAt: null,
    kpiScore: null,
    lastUpdated: "2026-05-08T14:20:00",
    rejectReason: "",
    updates: []
  },
  {
    id: "CZ-003",
    projectName: "ติดตั้งท่อ ทางหลวงหมายเลข 9",
    highway: "9",
    startKm: "78+300",
    endKm: "80+100",
    workType: "Pipeline",
    status: "Active",
    riskLevel: "Low",
    contractor: "บริษัท ก่อสร้างทางหลวงไทย จำกัด",
    contractorId: "CT-001",
    schedule: { start: "2026-05-10", end: "2026-05-25", hours: "09:00-17:00" },
    impact: { lanesClosed: "ไหล่ทาง", speedLimit: 80 },
    alertRadius: 0.5,
    lat: 13.6500,
    lng: 100.6500,
    photos: [],
    completionPhotos: [],
    completionNote: "",
    safetyChecklist: { warningSigns: true, nighttimeLighting: true, trafficCones: true, speedLimitSigns: true },
    submittedAt: "2026-05-07T09:00:00",
    approvedAt: "2026-05-08T11:00:00",
    kpiScore: 94,
    lastUpdated: "2026-05-07T09:00:00",
    rejectReason: "",
    updates: []
  },
  {
    id: "CZ-004",
    projectName: "ปรับผิวทาง ทางหลวงหมายเลข 22",
    highway: "22",
    startKm: "30+000",
    endKm: "33+500",
    workType: "Surface Repair",
    status: "Pending Approval",
    riskLevel: "Medium",
    contractor: "ห้างหุ้นส่วน ก่อสร้างสยาม",
    contractorId: "CT-003",
    schedule: { start: "2026-05-20", end: "2026-06-10", hours: "20:00-06:00" },
    impact: { lanesClosed: "1 เลนขวา", speedLimit: 60 },
    alertRadius: 1,
    lat: 14.2500,
    lng: 100.8500,
    photos: [],
    completionPhotos: [],
    completionNote: "",
    safetyChecklist: { warningSigns: true, nighttimeLighting: true, trafficCones: false, speedLimitSigns: true },
    submittedAt: "2026-05-09T16:45:00",
    approvedAt: null,
    kpiScore: null,
    lastUpdated: "2026-05-09T16:45:00",
    rejectReason: "",
    updates: []
  },
  {
    id: "CZ-005",
    projectName: "ซ่อมทางด่วน ทางหลวงหมายเลข 7",
    highway: "7",
    startKm: "55+000",
    endKm: "57+200",
    workType: "Surface Repair",
    status: "Active",
    riskLevel: "Medium",
    contractor: "บริษัท ก่อสร้างทางหลวงไทย จำกัด",
    contractorId: "CT-001",
    schedule: { start: "2026-06-05", end: "2026-06-20", hours: "22:00-05:00" },
    impact: { lanesClosed: "1 เลน", speedLimit: 60 },
    alertRadius: 1,
    lat: 13.5000,
    lng: 100.9000,
    photos: [],
    completionPhotos: [],
    completionNote: "",
    safetyChecklist: { warningSigns: true, nighttimeLighting: true, trafficCones: true, speedLimitSigns: true },
    submittedAt: "2026-05-10T08:00:00",
    approvedAt: "2026-05-10T09:00:00",
    kpiScore: 90,
    lastUpdated: "2026-05-10T08:00:00",
    rejectReason: "",
    updates: []
  },
  {
    id: "CZ-006",
    projectName: "งานท่อลอด ทางหลวงหมายเลข 11",
    highway: "11",
    startKm: "90+000",
    endKm: "91+500",
    workType: "Pipeline",
    status: "Active",
    riskLevel: "Low",
    contractor: "บริษัท ซ่อมสร้าง 99 จำกัด",
    contractorId: "CT-002",
    schedule: { start: "2026-06-10", end: "2026-06-25", hours: "09:00-17:00" },
    impact: { lanesClosed: "ไหล่ทาง", speedLimit: 70 },
    alertRadius: 0.5,
    lat: 14.5000,
    lng: 100.3000,
    photos: [],
    completionPhotos: [],
    completionNote: "",
    safetyChecklist: { warningSigns: true, nighttimeLighting: true, trafficCones: true, speedLimitSigns: true },
    submittedAt: "2026-05-11T10:00:00",
    approvedAt: "2026-05-11T11:00:00",
    kpiScore: 88,
    lastUpdated: "2026-05-11T10:00:00",
    rejectReason: "",
    updates: []
  }
];

export const contractors = [
  {
    id: "CT-001",
    name: "บริษัท ก่อสร้างทางหลวงไทย จำกัด",
    activeProjects: 3,
    kpi: {
      onTimeReporting: 92, photoCompliance: 87, onTimeCompletion: 92,
      publicComplaints: 5, dataCompleteness: 98, overallScore: 91,
      adminNote: "ผลงานโดยรวมดี แต่มีร้องเรียนจากประชาชนควรติดตาม"
    },
    monthlyTrend: [85, 88, 87, 90, 91, 92]
  },
  {
    id: "CT-002",
    name: "บริษัท ซ่อมสร้าง 99 จำกัด",
    activeProjects: 2,
    kpi: {
      onTimeReporting: 65, photoCompliance: 70, onTimeCompletion: 68,
      publicComplaints: 3, dataCompleteness: 79, overallScore: 67,
      adminNote: "ต้องปรับปรุงเรื่องการแจ้งล่วงหน้าก่อนเริ่มงานและการอัปโหลดรูป"
    },
    monthlyTrend: [72, 70, 68, 67, 65, 67]
  },
  {
    id: "CT-003",
    name: "ห้างหุ้นส่วน ก่อสร้างสยาม",
    activeProjects: 1,
    kpi: {
      onTimeReporting: 50, photoCompliance: 45, onTimeCompletion: 55,
      publicComplaints: 8, dataCompleteness: 60, overallScore: 54,
      adminNote: "ผลงานต่ำกว่าเกณฑ์ทุกด้าน ต้องเรียกประชุมด่วน"
    },
    monthlyTrend: [60, 58, 55, 53, 52, 54]
  }
];

export const sampleFeedback = [
  {
    id: "FB-2026-0047",
    issueType: "no_sign",
    location: "ทางหลวงหมายเลข 32 ใกล้ กม. 46+500",
    lat: 14.1250, lng: 100.1250,
    submittedAt: "2026-05-15T22:32:00",
    photoUrl: "https://images.unsplash.com/photo-1590674899484-13f8e9f6c21f?w=400&h=300&fit=crop",
    description: "มีการปิดเลนซ้ายแต่ไม่มีกรวยหรือป้ายเตือนก่อนถึงจุด",
    status: "Pending Review"
  }
];

export const issueTypeLabels = {
  accident: "🚨 พบอุบัติเหตุ",
  no_sign: "⚠️ ไม่มีป้ายเตือน / ป้ายไม่ชัดเจน",
  data_mismatch: "📍 ข้อมูลในแอปไม่ตรงกับสภาพจริง",
  heavy_traffic: "🚗 รถติดหนัก / ช่องจราจรไม่เพียงพอ",
  other: "💬 อื่นๆ"
};

export const contractorKpiData = {
  name: "บริษัท ก่อสร้างทางหลวงไทย จำกัด",
  onTimeReporting: 92, photoCompliance: 87, dataAccuracy: 94, overallScore: 91,
  publicComplaints: 3, safetyChecklistCompletion: 96, avgResponseTime: "4.2 ชม.",
  monthlyTrend: [85, 88, 87, 90, 91, 92]
};
