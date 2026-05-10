# DOH SafeZone — Technical Specification Document

> **For:** AI Agent developing compatible UI/UX  
> **Project:** DOH SafeZone Highway Construction Reporting System  
> **Framework:** Astro 5 + React 19 + Tailwind CSS 3.4  
> **Last Updated:** 2026-05-10  

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Astro | ^5.7.0 |
| UI Library | React | ^19.1.0 |
| Styling | Tailwind CSS | 3.4.19 |
| Icons | Lucide React | ^0.487.0 |
| Package Manager | pnpm | — |
| Build | Astro build (static) | — |
| PostCSS | autoprefixer + postcss | — |

**Important:** This is a client-side ONLY prototype. There is NO backend, NO database, NO API. All state lives inside React `useState` hooks in the browser. All data mutations are done via `setZones` / `setFeedback` passed as props.

---

## 2. File Structure

```
doh-safezone-demo/
├── astro.config.mjs
├── tailwind.config.cjs
├── postcss.config.cjs
├── package.json
├── src/
│   ├── data/
│   │   └── initialData.js          ← ALL mock data (zones, contractors, feedback)
│   ├── components/
│   │   ├── DashboardApp.jsx         ← Root: login gate + state + role routing
│   │   ├── LoginView.jsx            ← Role selection + mock credentials
│   │   ├── ContractorView.jsx       ← ALL contractor screens (612 lines)
│   │   ├── AdminView.jsx            ← ALL admin screens (317 lines)
│   │   ├── PublicView.jsx           ← ALL public/citizen screens (292 lines)
│   │   └── SystemFlow.jsx           ← Architecture modal (admin only)
│   ├── layouts/
│   │   └── Layout.astro             ← Base HTML + global styles
│   ├── pages/
│   │   └── index.astro              ← Mounts DashboardApp with client:load
│   └── styles/
│       └── global.css               ← Tailwind directives
└── dist/                            ← Build output
```

---

## 3. Core Architecture

### 3.1 Component Tree
```
DashboardApp (root)
├── [not logged in] → LoginView
└── [logged in]
    ├── role="contractor" → ContractorView
    ├── role="admin"      → AdminView
    └── role="public"     → PublicView
```

### 3.2 State Ownership (ALL in DashboardApp)
| State Variable | Type | Passed To |
|---|---|---|
| `zones` | `Array<Zone>` | ContractorView, AdminView, PublicView |
| `feedback` | `Array<Feedback>` | AdminView (r/w), PublicView (r/w) |
| `loggedIn` | `boolean` | Internal routing |
| `userRole` | `"contractor" \| "admin" \| "public" \| null` | Internal routing |
| `notifications` | `Array<{id, msg}>` | Rendered as top banner |
| `showSystemFlow` | `boolean` | Shows SystemFlow modal |

### 3.3 State Mutations
- `setZones(updater)` — passed to ContractorView and AdminView
- `setFeedback(updater)` — passed to AdminView and PublicView
- `addNotification(msg)` — passed to all views, shows 4-second toast banner

### 3.4 Navigation
- **No bottom tab bar** — each role gets a dedicated view
- Role switching requires clicking `ออกจากระบบ` (logout) → re-login
- Login screen has 3 role buttons: Contractor, DOH Admin, Public User
- Mock credentials are pre-filled: `contractor_demo` / `admin_doh` / `commuter_demo`

---

## 4. Data Models

### 4.1 Zone Object (Construction Zone)
```javascript
{
  id: "CZ-001",                                     // String, unique ID
  projectName: "ซ่อมผิวจราจร ทางหลวงหมายเลข 32",      // String
  highway: "32",                                    // String, highway number
  startKm: "45+200",                                // String, format "NN+NNN"
  endKm: "47+800",                                  // String, format "NN+NNN"
  workType: "Surface Repair",                       // "Surface Repair" | "Bridge" | "Pipeline" | "Expansion"
  status: "Active",                                 // See Section 4.5
  riskLevel: "Medium",                              // "Low" | "Medium" | "High"
  contractor: "บริษัท ก่อสร้างทางหลวงไทย จำกัด",      // String, contractor name
  contractorId: "CT-001",                           // String, links to contractors[]
  schedule: { 
    start: "2026-05-15",                           // Date string
    end: "2026-05-20",                             // Date string
    hours: "22:00-05:00"                           // String, work hours range
  },
  impact: { 
    lanesClosed: "1 เลนซ้าย",                       // String, e.g. "1 เลนซ้าย", "2 เลน"
    speedLimit: 60                                 // Number, km/h
  },
  alertRadius: 1,                                   // Number, km (0.5 | 1 | 3)
  lat: 14.1234,                                     // Number, latitude
  lng: 100.1234,                                    // Number, longitude
  photos: [],                                       // Array<{url, timestamp}>
  completionPhotos: [],                             // Array<{url, timestamp, gps}>
  completionNote: "",                               // String, note from contractor on completion
  safetyChecklist: {
    warningSigns: true,                             // boolean
    nighttimeLighting: true,                        // boolean
    trafficCones: true,                             // boolean
    speedLimitSigns: true                           // boolean
  },
  submittedAt: "2026-05-09T10:30:00",              // ISO timestamp
  approvedAt: "2026-05-10T08:00:00",               // ISO timestamp or null
  kpiScore: 92,                                    // Number (0-100) or null if not yet scored
  lastUpdated: "2026-05-09T10:30:00",              // ISO timestamp, for 48hr update tracking
  rejectReason: "",                                 // String, set by admin when rejecting
  updates: []                                       // Array<{type, photos, note, timestamp}>
}
```

### 4.2 Contractor KPI Object
```javascript
{
  id: "CT-001",                                     // String
  name: "บริษัท ก่อสร้างทางหลวงไทย จำกัด",           // String
  activeProjects: 3,                                // Number (static display value)
  kpi: {
    onTimeReporting: 92,                            // 0-100
    photoCompliance: 87,                            // 0-100
    onTimeCompletion: 92,                           // 0-100
    publicComplaints: 5,                            // Number (lower is better)
    dataCompleteness: 98,                           // 0-100
    overallScore: 91,                               // 0-100
    adminNote: "ผลงานโดยรวมดี..."                    // String
  },
  monthlyTrend: [85, 88, 87, 90, 91, 92]           // Array of 6 numbers (0-100)
}
```

### 4.3 Feedback Object (Citizen Report)
```javascript
{
  id: "FB-2026-0047",                               // String
  issueType: "no_sign",                             // Key from issueTypeLabels
  location: "ทางหลวงหมายเลข 32 ใกล้ กม. 46+500",     // String
  lat: 14.1250,                                     // Number
  lng: 100.1250,                                    // Number
  submittedAt: "2026-05-15T22:32:00",              // ISO timestamp
  photoUrl: "https://...",                          // String or null
  description: "มีการปิดเลนซ้ายแต่ไม่มีกรวย...",      // String (max 200 chars)
  status: "Pending Review"                          // "Pending Review" | "Resolved"
}
```

### 4.4 Issue Type Labels
```javascript
issueTypeLabels = {
  accident: "🚨 พบอุบัติเหตุ",
  no_sign: "⚠️ ไม่มีป้ายเตือน / ป้ายไม่ชัดเจน",
  data_mismatch: "📍 ข้อมูลในแอปไม่ตรงกับสภาพจริง",
  heavy_traffic: "🚗 รถติดหนัก / ช่องจราจรไม่เพียงพอ",
  other: "💬 อื่นๆ"
}
```

### 4.5 Zone Status Lifecycle
```
                    ┌─── rejected (can re-submit) ←─── (admin rejects)
                    │
Pending Approval ───┤
                    │
                    └─── Active (approved)
                              │
                              ├── Report Problem (adds to updates[])
                              │
                              ├── 48hr Update (adds to updates[], resets lastUpdated)
                              │
                              ├── Mark as Complete (→ Pending Completion Review)
                              │         │
                              │         ├── Admin Approves → Completed (terminal)
                              │         └── Admin Rejects → Active (back)
                              │
                              └── Completed (terminal state)
```

**Status values and their Thai labels:**
| Status | Thai Label | Badge Color |
|---|---|---|
| `Pending Approval` | รออนุมัติ | Yellow |
| `Active` | กำลังดำเนินการ | Green |
| `Pending Completion Review` | รอยืนยันการปิดงาน | Purple |
| `Completed` | เสร็จสิ้น | Blue |
| `Rejected` | ปฏิเสธ | Red |
| `Paused` | หยุดชั่วคราว | Gray |

---

## 5. Global UI Conventions

### 5.1 Color Palette
- **Primary Blue:** `#1e40af` (blue-700) — DOH brand, buttons, headers, notifications  
- **Light Blue:** `#3b82f6` (blue-500) — interactive elements, links  
- **Green:** `#16a34a` (green-600) — success, active status, approve buttons  
- **Yellow:** `#eab308` (yellow-500) — caution, pending, medium risk  
- **Red:** `#dc2626` (red-600) — danger, high risk, reject, overdue  
- **Orange:** `#f97316` (orange-500) — citizen feedback FAB  
- **Purple:** `#7c3aed` — completion review status  
- **Gray Background:** `bg-gray-50` — main page background  

### 5.2 Tailwind Patterns
- **Cards:** `bg-white rounded-2xl border border-gray-100 shadow-sm`  
- **Buttons (primary):** `bg-blue-700 text-white py-4 rounded-xl font-bold hover:bg-blue-800 active:scale-[0.98] shadow-lg`  
- **Buttons (secondary):** `bg-gray-100 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200`  
- **Form inputs:** `w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-blue-500 outline-none`  
- **Bottom sheets:** `fixed inset-0 z-50 flex items-end bg-black/40` with `rounded-t-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slideDown`  
- **Toast notification:** `animate-slideDown bg-blue-700 text-white px-4 py-3 shadow-lg text-sm text-center`  
- **Page padding:** `p-4 max-w-lg mx-auto` (mobile-first, contained width)  

### 5.3 Interactive Feedback
- `active:scale-[0.98]` on all buttons  
- `hover:shadow-md transition-all` on cards/clickable surfaces  
- `hover:bg-XXX transition-all` on all interactive elements  

### 5.4 Language
All user-facing text is in **Thai**. Only system messages, API-like labels (workType, riskLevel), and code-level identifiers use English.

---

## 6. Login Screen (LoginView)

### Props
```javascript
{ onLogin: (role: "contractor" | "admin" | "public") => void }
```

### States
| State | Values | Description |
|---|---|---|
| `selectedRole` | `null` | initially no role selected |
| `showPass` | `boolean` | toggles password visibility |

### Layout
- Full-screen gradient: `from-blue-900 via-blue-800 to-blue-700`
- DOH SafeZone logo (Building2 icon) centered at top
- 3 role selection buttons with left-colored border:
  - Contractor: amber left border, HardHat icon
  - DOH Admin: blue left border, Shield icon
  - Public User: green left border, MapPin icon
- After selecting a role, shows mock credentials:
  - Username: `contractor_demo` / `admin_doh` / `commuter_demo`
  - Password: `••••••••` (toggle to `Demo@2026`)
- "Sign In" button appears after role selection

---

## 7. Contractor View (ContractorView)

### Props
```javascript
{ 
  zones: Array<Zone>, 
  setZones: Function, 
  kpiData: Object,         // contractorKpiData
  addNotification: Function,
  onLogout: Function 
}
```

### Local State
| Variable | Type | Description |
|---|---|---|
| `view` | `"dashboard" \| "createReport" \| "jobDetail"` | Current screen |
| `formStep` | `0-4` | Current step in 5-step report form |
| `selectedZone` | `Zone \| null` | Zone being viewed/edited |
| `isEditing` | `boolean` | Whether editing existing zone |
| `showDeleteConfirm` | `boolean` | Show delete confirmation modal |
| `form` | `Object` | All form field values |
| `dateError` | `string` | Date validation error message |
| `showCompletionSheet` | `boolean` | Show completion bottom sheet |
| `completionPhotos` | `Array` | Photos for completion evidence |
| `completionNote` | `string` | Note for completion |
| `completionChecked` | `boolean` | Confirmation checkbox |
| `showUpdateSheet` | `boolean` | Show 48hr update bottom sheet |
| `updatePhotos` | `Array` | Photos for 48hr update |
| `updateNote` | `string` | Note for 48hr update |

### Screens

#### 7.1 Dashboard (`view === "dashboard"`)
- Top bar: "ผู้รับเหมา" title, contractor name, `ออกจากระบบ` button (red)
- 4 stat cards: กำลังทำ / รออนุมัติ / รอตรวจ / เลยกำหนด  
  The 4th card counts overdue zones (not updated in 48+ hours), shown in red
- `สร้างรายงานใหม่` button (blue, full-width, Plus icon)
- Section: "โครงการของคุณ" — list of zone cards. Each card shows:
  - Project name, risk badge, highway number, KM range
  - Status badge
  - ⚠️ "ไม่ได้อัปเดต XX ชม." warning if overdue
  - ChevronRight indicator — tapping opens job detail

#### 7.2 Job Detail (`view === "jobDetail"`)
- Back button: `กลับไปหน้ารวม`
- Header card with gradient (red for Rejected, blue otherwise)
- If rejected: shows `เหตุผลที่ถูกปฏิเสธ: [reason]` in red
- Info sections: ทางหลวง, ระดับความเสี่ยง, ตำแหน่ง, ผู้รับเหมา, ตารางการทำงาน, ผลกระทบ, รัศมีการแจ้งเตือน
- Photos gallery (if any)
- Completion photos (if any)
- Update history (last 3 entries from `zone.updates[]`)
- Safety checklist display
- KPI score (if scored)

**Conditional buttons:**
| Condition | Button Shown |
|---|---|
| Overdue or Active | `อัปเดตรายงาน 48 ชม.` (blue) |
| Active or Paused | `แจ้งงานเสร็จสิ้น` (green) |
| Active (not overdue) | `รายงานปัญหา` (orange) |
| Pending Approval or Rejected | `แก้ไข` (yellow) + `ลบ` (red) |
| Pending Completion Review | Read-only "รอการยืนยันจากเจ้าหน้าที่" (purple) |

**Overdue warning:** Red alert box if `lastUpdated` is 48+ hours ago and status is Active.

#### 7.3 Create/Edit Report (`view === "createReport"`)
A 5-step wizard form. Steps navigable via Back/Continue buttons at bottom. Progress bar at top.

**Step 1 — ข้อมูลโครงการ (Project Info):**
- Project name (required, red asterisk)
- Highway number (required)
- Work type dropdown: ซ่อมผิวจราจร / ขยายถนน / ท่อลอด/วางท่อ / สะพาน
- Start KM / End KM (plain number input, `+` filtered out, auto-appended to `+000` on submit)
- Risk level selector (ต่ำ / ปานกลาง / สูง)

**Step 2 — แผนที่และ Geofence:**
- Mock map with grid pattern, pulsating geofence circle, red MapPin
- `ใช้ตำแหน่งปัจจุบัน` button — randomizes lat/lng slightly
- Alert radius selector: 0.5 km / 1 km / 3 km

**Step 3 — ตารางเวลาและผลกระทบ:**
- Start date / End date (two date inputs)
- **Date validation:** end date must be after start date, red error message if invalid
- Work hours: two `<input type="time">` fields — `เริ่ม` ถึง `สิ้นสุด`
- Closed lanes (text), Speed limit (number input)
- Yellow warning box about alert messages to commuters

**Step 4 — รูปถ่ายและความปลอดภัย:**
- Photo upload area (tap to add mock photos from Unsplash)
- Safety checklist: 4 toggleable items
  - Warning signs, Nighttime lighting, Traffic cones, Speed limit signs

**Step 5 — ตรวจสอบและส่ง:**
- Summary card showing all entered data
- Blue info box: "ข้อมูลนี้จะถูกบันทึกพร้อมเวลา..."
- Bottom button changes to `ส่งรายงาน` (new) or `บันทึกการแก้ไข` (editing) — triggers `handleSubmitReport()`

**Edit mode:** Pre-fills form from existing zone data. Strips `+NNN` from KM values for display. Only available for Pending Approval or Rejected zones.

#### 7.4 Completion Sheet (bottom sheet modal)
Triggered by `แจ้งงานเสร็จสิ้น` button.

- **Photo (required):** Upload photos of completed work area (max 3). GPS/timestamp stamped.
- **Note (optional):** Textarea for additional notes
- **Checkbox (required):** "ข้าพเจ้าขอรับรองว่างานก่อสร้างในพื้นที่นี้เสร็จสมบูรณ์แล้ว และสภาพพื้นที่ถนนพร้อมใช้งาน"
- **Confirm button:** Disabled until photo + checkbox both satisfied
- **Cancel button**

#### 7.5 48hr Update Sheet (bottom sheet modal)
Triggered by `อัปเดตรายงาน 48 ชม.` button.

- Shows current project name and highway
- Photo upload (max 3)
- Notes textarea
- Submit button, cancel button

#### 7.6 Delete Confirmation Modal
Simple centered modal: "คุณต้องการลบโครงการ...ใช่หรือไม่?"
- Cancel + Delete buttons

---

## 8. Admin View (AdminView)

### Props
```javascript
{ 
  zones: Array<Zone>, 
  setZones: Function, 
  kpiData: Object,
  addNotification: Function,
  feedback: Array<Feedback>, 
  setFeedback: Function,
  onLogout: Function 
}
```

### Local State
| Variable | Description |
|---|---|
| `adminView` | `"overview" \| "approvals" \| "kpi" \| "kpiDetail" \| "feedback"` |
| `selectedContractor` | Contractor object for KPI drill-down |
| `approvalTab` | `"new" \| "completion"` — which approval queue to show |
| `showRejectModal` | Show reject reason modal |
| `rejectZoneId` | Zone ID being rejected |
| `rejectReason` | Text of rejection reason |

### Screens

#### 8.1 Overview Dashboard (`adminView === "overview"`)
- Header: "DOH Admin" + "ระบบติดตามการก่อสร้างทั่วประเทศ" + `ออกจากระบบ` button
- 4 KPI cards: กำลังดำเนินการ / รอดำเนินการ / ความเสี่ยงสูง / การรายงานตรงเวลา (92%)
- 3 action buttons:
  - 🔶 Reports to process (pending + completion total)
  - 🔷 ติดตาม KPI ผู้รับเหมา (contractors count)
  - 🟠 รายงานจากประชาชน (pending feedback count)
- All zones list at bottom with status + risk badges

#### 8.2 Approval Queue (`adminView === "approvals"`)
- Tab bar: `การแจ้งงานใหม่` (count) | `รอยืนยันการปิดงาน` (count)
- New reports tab: list of Pending Approval zones
  - Each card: name, ID, contractor, highway, KM, work type, submission date, risk
  - Buttons: `อนุมัติ` (green) + `ปฏิเสธ` (red)
  - Clicking `ปฏิเสธ` opens **reject reason modal**
- Completion tab: list of Pending Completion Review zones
  - Shows completion photos thumbnails, completion note
  - Buttons: `อนุมัติปิดงาน` (green) + `ส่งกลับ` (red)

#### 8.3 Reject Reason Modal
- Title: "เหตุผลที่ปฏิเสธ"  
- Textarea for reject reason (e.g., "ข้อมูลไม่ครบถ้วน / รูปถ่ายไม่ชัดเจน")
- Cancel / ยืนยันปฏิเสธ buttons
- Reason stored in `zone.rejectReason`, visible on contractor's job detail
- Validation: cannot submit empty reason

#### 8.4 KPI List (`adminView === "kpi"`)
- Back button
- Title: "ติดตาม KPI — ประเมินผลผู้รับเหมา"
- Scrollable list of contractor cards:
  - Contractor name (bold)
  - Grade badge: 🟢 ดี (91/100) / 🟡 พอใช้ (67/100) / 🔴 ต้องปรับปรุง (54/100)
  - Active project count
  - `ดูรายละเอียด` link

#### 8.5 KPI Detail (`adminView === "kpiDetail"`)
- Header: contractor name + grade badge + total project count
- 6 colored KPI cards in 2-column grid:

| Card | Icon | Thai Label | Color Rules |
|---|---|---|---|
| 1 | 📋 | แจ้งล่วงหน้าก่อนเริ่มงาน | 🟢 ≥80, 🟡 ≥60, 🔴 <60 |
| 2 | 📸 | อัปโหลดรูปตรงเวลา | 🟢 ≥80, 🟡 ≥60, 🔴 <60 |
| 3 | ⏱️ | งานเสร็จตรงเวลาตามสัญญา | 🟢 ≥90, 🟡 ≥70, 🔴 <70 |
| 4 | 💬 | ร้องเรียนจากประชาชน | 🟢 ≤2, 🟡 ≤5, 🔴 >5 (reversed) |
| 5 | ✅ | ความครบถ้วนของข้อมูล | 🟢 ≥90, 🟡 ≥75, 🔴 <75 |
| 6 | 🏆 | คะแนนรวม | 🟢 ≥80, 🟡 ≥60, 🔴 <60 |

- Admin notes section with FileText icon
- Monthly trend bar chart (6 months, Thai labels: ม.ค.-มิ.ย.)

#### 8.6 Citizen Feedback Queue (`adminView === "feedback"`)
- Back button + pending count
- Title: "รายงานจากประชาชน"
- Feedback cards listing:
  - Issue type icon + Thai label
  - ID, location, submission time (Thai locale)
  - Description in quote block
  - Photo thumbnail (if available)
  - Status badge: รอตรวจสอบ (yellow) / ดำเนินการแล้ว (green)
  - `ดำเนินการแล้ว` button (green) on pending items → marks as Resolved

---

## 9. Public View (PublicView)

### Props
```javascript
{ 
  zones: Array<Zone>, 
  addNotification: Function,
  feedback: Array<Feedback>, 
  setFeedback: Function,
  onLogout: Function 
}
```

### Local State
| Variable | Description |
|---|---|
| `publicView` | `"onboarding" \| "map" \| "detail" \| "route"` |
| `selectedZone` | Currently viewed construction zone |
| `showAlert` | Show push notification alert |
| `alertData` | Zone data for the alert |
| `carPosition` | 0-100, animated via useEffect interval (1 sec) |
| `showFeedbackSheet` | Show feedback bottom sheet |
| `feedbackIssueType` | Selected issue type key |
| `feedbackLocation` | Auto-filled location string |
| `feedbackDesc` | Description text |
| `feedbackPhotos` | Uploaded photos (max 2) |
| `showFeedbackToast` | Show success toast |

### Screens

#### 9.1 Onboarding (`publicView === "onboarding"`)
- Blue gradient full-screen
- ShieldCheck icon
- "DOH SafeZone" title + "รู้ก่อน ระวังก่อน ถึงปลอดภัย" tagline
- 3 feature highlights: MapPin, Bell, Route with descriptions
- `เริ่มใช้งาน` button → navigates to map

#### 9.2 GPS Map (`publicView === "map"`, default after onboarding)
- Full-viewport blue-tinted map background
- **SVG road:** Curved path simulating a highway with:
  - Gray road base (18px wide)
  - White dashed center line
  - Green traveled-path overlay that grows with `carPosition` animation
- **Animated car position:** Blue dot labeled "คุณอยู่ที่นี่" moves along road
- **Construction pins:** Colored MapPin markers along the road for Active zones
  - Red = High, Yellow = Medium, Blue = Low
  - Labels: 🚧 ทางหลวง [N]
  - Tapping opens detail view
- **Top bar:** "DOH SafeZone — แผนที่เรียลไทม์" + `ออก` button
- **Speed indicator:** 🚗 45 กม./ชม. (mock)
- **Risk legend:** เสี่ยงสูง / ปานกลาง / เสี่ยงต่ำ (top-right)
- **Bottom controls (fixed):**
  - `จำลองการขับขี่` (blue, full-width) — triggers push notification alert
  - Row: `เส้นทาง` / `แจ้งเตือน`
- **FAB:** `⚠️ แจ้งปัญหา` (orange, bottom-right, above bottom controls)

#### 9.3 Push Notification Alert
- Overlay modal, slides down from top
- Red header with AlertTriangle icon
- Warning text: "1 กม. ข้างหน้า: [project name] ทางหลวงหมายเลข [N]"
- Details: lanes closed, speed limit
- "กรุณาลดความเร็วและขับขี่ด้วยความระมัดระวัง"
- Dismiss button (ปิด)
- Auto-dismisses after 5 seconds

#### 9.4 Construction Detail (`publicView === "detail"`)
- Back button: `กลับไปแผนที่`
- Risk-colored header card with project name, risk level badge
- Info grid: ตำแหน่ง, ระยะทาง, เวลาทำงาน, ความเร็วจำกัด
- Traffic impact section with action recommendation
- Mock map thumbnail
- `วางแผนเส้นทางเลี่ยง` button → navigates to route planner

#### 9.5 Route Planner (`publicView === "route"`)
- Back button
- Title: "วางแผนเส้นทาง"
- Origin / Destination text inputs
- `ตรวจสอบเส้นทาง` button — shows notification with zone count + estimated delay
- List of active zones on the route with risk-colored pins

#### 9.6 Citizen Feedback Sheet (bottom sheet)
- Title: "แจ้งปัญหาบนทางหลวง"
- **Issue type (required):** 5 radio-style buttons
- **Location (auto):** Pre-filled with mock location, GPS coordinates, mini map thumbnail, `แก้ไขตำแหน่ง` link
- **Photo (optional, max 2):** Upload area
- **Description (optional, max 200):** Textarea with character counter
- **Submit button (orange):** Disabled until issue type selected
- On submit: creates new `feedback` entry, shows green toast for 3 seconds

---

## 10. System Flow (SystemFlow.jsx)

### Trigger
Only visible on Admin role. "System Flow" button fixed at bottom-right corner.

### Content
Full-screen modal (dismiss on backdrop click):
- 4 architecture layers stacked vertically with arrow connectors:
  1. **Contractor Layer** (amber): Login, GPS, Geofence, Photos, Safety, Status
  2. **DOH Backend Layer** (blue): Verification, Approve/Reject, KPI, Analytics, Monitoring, Export
  3. **Public User Layer** (green): Map, Geofence Alerts, Push Notifications, Route, Feedback, Details
  4. **Integration Layer** (purple): LINE OA, Google Maps/Waze, Open Data, API Gateway
- Data Lifecycle timeline (8 steps, numbered circles with arrows)
- Footer: "DOH SafeZone — Real-time Highway Construction Reporting & Alert System"

---

## 11. Key Business Rules

### 11.1 48-Hour Update Requirement
- Contractors must update their report every 48 hours for Active projects
- `lastUpdated` timestamp is set at: submission, approval, update, report problem, completion
- `needUpdate(lastUpdated)` function checks if 48+ hours have elapsed
- Overdue zones show red warning badge on dashboard list and job detail
- `อัปเดตรายงาน 48 ชม.` button always available on Active projects (even if not yet overdue)

### 11.2 Edit/Delete Rules
- **Editable:** Pending Approval and Rejected zones
- **Deletable:** Pending Approval and Rejected zones (with confirmation)
- **Report Problem:** Active zones that are NOT overdue

### 11.3 Date Validation
- End date must be after start date
- Red error message: "วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น"
- Prevents form submission

### 11.4 Photo Upload (Mock)
- All photo "uploads" cycle through 3 hardcoded Unsplash URLs
- Each photo gets a mock timestamp
- Simulated GPS stamp on completion photos

### 11.5 Completion Requirements
- At least 1 photo required
- Confirmation checkbox must be checked
- Both conditions must be met for the submit button to enable

### 11.6 Admin Rejection
- Reason is required (non-empty), validated client-side
- Stored in `zone.rejectReason`, displayed on contractor's job detail

### 11.7 Feedback Submission
- Only issue type is required (all other fields optional)
- Anonymous — no login needed
- Creates entry in `feedback` array with ID `FB-2026-NNNN`
- Visible in admin's feedback queue

---

## 12. KPI Color-Coding Functions

### `gradeBadge(score)` — Admin KPI List
| Score | Label | Color |
|---|---|---|
| ≥ 80 | ดี | Green border + text |
| 60-79 | พอใช้ | Yellow border + text |
| < 60 | ต้องปรับปรุง | Red border + text |

### `kpiColor(val, [greenThreshold, yellowThreshold])` — KPI Cards
Returns `{color, bg, border}` classes for green/yellow/red

### `kpiColorReverse(val, [greenThreshold, yellowThreshold])` — For "complaints" (lower=better)
Returns `{color, bg, border}` — green if ≤ greenThreshold, yellow if ≤ yellowThreshold, red otherwise

---

## 13. How to Add a New Screen

1. Add a new value to the `view` / `adminView` / `publicView` state variable
2. Add a new `if (view === "newScreen") { return (...); }` block before the default return
3. Include a back button that sets the view back to the previous screen
4. Follow existing patterns:
   - Page container: `p-4 max-w-lg mx-auto`
   - Card: `bg-white rounded-2xl border border-gray-100 shadow-sm`
   - Modals: `fixed inset-0 z-50 flex items-end bg-black/40`
5. Use Thai for all user-facing labels
6. Use lucide-react icons (already imported where needed)

---

## 14. How to Add New Data Fields

1. Add the field to `initialZones` objects in `src/data/initialData.js`
2. Add to any `setZones()` calls that create/modify zones (ensure the new field is preserved with `...z`)
3. If the field needs to be displayed, add it to the relevant view's JSX

---

## 15. Running the Project

```bash
cd doh-safezone-demo
pnpm install
pnpm dev          # Development server with HMR
pnpm build        # Production build → dist/
pnpm preview      # Preview production build
```

The app mounts `DashboardApp` as a `<DashboardApp client:load />` Astro island, meaning it hydrates on page load and becomes fully interactive client-side.

---

## 16. Icon Inventory by Component

### DashboardApp
`HardHat`, `Shield`, `MapPin`

### LoginView
`HardHat`, `Shield`, `MapPin`, `ArrowRight`, `Building2`

### ContractorView
`Plus`, `MapPin`, `Calendar`, `Clock`, `Camera`, `CheckSquare`, `Square`, `ChevronRight`, `ChevronLeft`, `AlertTriangle`, `CheckCircle`, `X`, `Navigation`, `HardHat`, `LogOut`, `Edit3`, `Trash2`, `RefreshCw`, `AlertOctagon`

### AdminView
`Shield`, `CheckCircle`, `X`, `AlertTriangle`, `Clock`, `ChevronRight`, `ChevronLeft`, `BarChart3`, `FileText`, `MessageSquare`, `LogOut`

### PublicView
`MapPin`, `Bell`, `Route`, `Navigation`, `X`, `AlertTriangle`, `ChevronRight`, `ChevronLeft`, `Clock`, `ShieldCheck`, `Camera`, `CheckCircle`, `AlertOctagon`, `LogOut`

### SystemFlow
`X`, `HardHat`, `Shield`, `MapPin`, `ArrowRight`, `Cloud`

---

*End of specification. For any questions about implementation details, consult the source code directly at `doh-safezone-demo/src/components/`.*
