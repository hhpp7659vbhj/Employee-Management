# 🏢 ZOOGLE Enterprise India (EMS)

> A full-fledged, engaging, and interactive Employee Management System built with **Java exclusively for the backend** and **HTML5, CSS3, Tailwind CSS & JavaScript for the frontend**.
> Tailored for an **Indian Tech Enterprise** featuring authentic Indian staff records (Pooja Sharma, Dheeraj Raj, Rahul Roy, etc.), a **Cinematic Video Hero Opening**, **Smart QR Code Office Attendance Scanner**, bold **Maroon & Earthy Brown** visual identity, dual-interface authentication, and persistent database storage.

---

## 🌟 Highlights of the New Updates

### 1. 🇮🇳 Indian Enterprise Profile & Names
- **All staff records and leadership updated to authentic Indian names:**
  - **Rajeshwar Verma** — Chief Executive Admin (`admin` / `admin123`)
  - **Dheeraj Raj** — Staff Software Engineer, Engineering & Tech (`dheeraj.raj` / `zoogle123`)
  - **Pooja Sharma** — Lead UI/UX Architect, Product & Design (`pooja.sharma` / `zoogle123`)
  - **Rahul Roy** — Head of Brand Marketing & Growth (`rahul.roy` / `zoogle123`)
  - **Ananya Iyer** — VP of Engineering & Tech (`ananya.iyer` / `zoogle123`)
  - **Rohan Deshmukh** — Lead Financial Controller, Finance & Strategy (`rohan.deshmukh` / `zoogle123`)
  - **Priya Nair** — Director of People & Culture / HR (`priya.nair` / `zoogle123`)
  - **Arjun Mehta** — Senior Cloud DevOps Engineer (`arjun.mehta` / `zoogle123`)
  - **Kavita Sundaram** — Operations Lead (`kavita.sundaram` / `zoogle123`)
- Locations across **Bangalore (Whitefield Tech Bay)**, **Mumbai (BKC)**, **Hyderabad (Hitec City)**, and **Gurugram (DLF Cyber City)**.
- Compensation calculated in **Indian Rupees (₹ INR)** with HRA, TDS withholding, and EPF deductions.

---

### 2. 📷 Smart QR Code Attendance Scanner (Strict Verification)
- **Authentic Turnstile QR Scanning**:
  - Eliminates unverified check-ins: Employees must scan the official **Zoogle Gate A Entrance QR Code** (`ZOOGLE-OFFICE-GATE-A:BLR-HUB-2026`).
  - **Strict Validation**:
    - If the employee clicks the scan button without a QR code in the camera frame, the system **rejects the attempt** with an alert: `⚠️ No QR Code Detected! Please hold your camera steadily in front of the official Zoogle Entrance QR Code.`
    - Attendance is marked **only and only when** the authentic Zoogle turnstile QR code is detected and verified.
  - **Live Camera / Scanner Viewfinder**:
    - Animated sweeping green laser beam (`#scanner-laser-beam`).
    - Dynamic optical reticle that turns glowing emerald when a valid gate beacon is detected.
    - Web Audio API scan confirmation chime and error buzz.
    - **Snapshot Upload Option**: Supports uploading a saved screenshot or image of the Gate QR badge for devices without front cameras.
  - **Working Hours Window**:
    - Active during standard office working hours (**08:00 AM – 08:00 PM IST**).
    - Status pill indicates: `🟢 Shift Active (08:00 - 20:00)`.
  - **Office Entrance QR Beacon Display**:
    - Admins and employees can project, copy the token, or print the official **Zoogle Gate A QR Code Beacon** anytime.

---

### 3. 🎨 Coordinated Visual Cohesion & Dark Luxury Palette
- **Unified Aesthetic**:
  - The login portal, administration dashboard, and employee workspace now seamlessly match the opening video hero screen.
  - **Palette**: Deep navy/obsidian (`#06111C` / `hsl(201 100% 13%)`), `.liquid-glass` cards with backdrop blur and inner shine, velvet maroon (`#7A192A`) primary buttons, and burnished gold (`#D4AF37` / `#E6C280`) accents.
  - **Cinematic Typography**: All view headings styled with Google Font **Instrument Serif** for elegance.
- **Personalized Employee Greeting**:
  - Employee workspace header displays: **`Hello, Pooja 👋`** (or employee's first name) with designation: `Lead UI/UX Architect • Product & Design`.
  - My Desk features an executive personalized banner with staff ID and campus location.
- **Fixed `undefined` Names**:
  - Explicit `fullName` serialization in backend `Employee` model and client-side resolvers (`getEmpFullName` and `getEmpFirstName`) ensure employee names are never displayed as `undefined`.

---

### 4. 🏖️ 10 Comprehensive Corporate Leave Categories
The leave application portal now offers 10 Indian corporate leave options:
1. **Casual Leave (CL)** — Personal & urgent affairs (7 Days remaining)
2. **Sick & Medical Leave (SL)** — Health & hospitalization (8 Days remaining)
3. **Privilege / Annual Earned Leave (PL/EL)** — Vacation & leisure (14 Days)
4. **Work From Home / Remote Day (WFH)**
5. **Maternity / Paternity Parental Leave**
6. **Compensatory Off (Comp-Off)** — Against weekend shifts
7. **Bereavement & Compassionate Leave**
8. **Festival & Optional Religious Holiday**
9. **Marriage & Wedding Celebration Leave**
10. **Sabbatical & Higher Studies Leave**

---

### 3. 🎬 Cinematic Video Hero Opening
- **Fullscreen Looping Video Background**:
  - High-resolution streaming background video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4`
- **Cinematic Typography & Fonts**:
  - Display: Google Font **Instrument Serif** (`--font-display: 'Instrument Serif', serif`)
  - Body: Google Font **Inter** (`--font-body: 'Inter', sans-serif`)
  - H1 Headline: *"Where <em class="text-[#A1A1AA]">dreams</em> rise <em class="text-[#A1A1AA]">through the silence.</em>"*
- **Liquid Glass Effect (`.liquid-glass`)**:
  - Glassmorphic navigation and pill CTA buttons (`Begin Journey`) with luminosity blending, backdrop-filter blur, and inner reflection highlights.
- **Fade-Rise Staggered Animations**:
  - Keyframe transitions for headline, subtext, and call-to-action buttons.
  - Seamless entry into the Zoogle EMS Dual-Interface login screen upon clicking **Begin Journey**.
  - Persistent **🎬 Video Hero** button to replay the cinematic opening at any time.

---

## 🚀 Quick Launch Instructions

### Option 1: Double-Click or Command Prompt
Double-click `run.bat` or run:
```bat
run.bat
```

### Option 2: PowerShell
Run the included PowerShell launch script:
```powershell
.\run.ps1
```

### Option 3: Manual Compilation & Run
```bash
# 1. Compile Java sources
javac -d bin src/com/zoogle/ems/model/*.java src/com/zoogle/ems/service/*.java src/com/zoogle/ems/db/*.java src/com/zoogle/ems/http/*.java src/com/zoogle/ems/handler/*.java src/com/zoogle/ems/Server.java

# 2. Run Java server
java -cp bin com.zoogle.ems.Server
```

Open your browser and visit:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🔑 Login Credentials

| Role | Username | Password | Notes |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Master executive console (Rajeshwar Verma) |
| **Employee (Software Eng)** | `dheeraj.raj` | `zoogle123` | Staff Software Engineer, Bangalore |
| **Employee (UI/UX Lead)** | `pooja.sharma` | `zoogle123` | Lead UI/UX Architect, Bangalore |
| **Employee (Marketing Head)**| `rahul.roy` | `zoogle123` | Head of Brand Marketing, Gurugram |
| **Employee (VP Eng)** | `ananya.iyer` | `zoogle123` | VP of Engineering, Chennai |
| **Employee (Finance Lead)** | `rohan.deshmukh` | `zoogle123` | Lead Financial Controller, Mumbai |
| **Employee (HR Director)** | `priya.nair` | `zoogle123` | Director of People & Culture, Bangalore |

*(Single-click demo buttons on the login screen automatically populate these credentials).*

---

## 🗂️ Project Architecture

```
EMployee_Mangement/
├── bin/                             # Compiled Java class files
├── data/
│   └── database.json                # Thread-safe atomic JSON persistence engine
├── schema.sql                       # Relational SQL schema DDL
├── seeds.sql                        # Indian enterprise SQL seed DML
├── run.bat                          # One-click Windows batch launcher
├── run.ps1                          # PowerShell startup script
├── README.md                        # Documentation
├── src/
│   └── com/zoogle/ems/
│       ├── Server.java              # Multi-threaded ServerSocket backend
│       ├── model/                   # Domain entities (User, Employee, Attendance, etc.)
│       ├── db/                      # Database engine with Indian initial records
│       ├── service/                 # Fast zero-dependency JsonUtil
│       ├── http/                    # HttpRequest & HttpResponse parser
│       └── handler/                 # ApiHandler & StaticFileHandler
└── static/
    ├── index.html                   # Cinematic Video Hero + Dual Login + Dashboards
    ├── css/
    │   └── style.css                # Bold Maroon & Brown styles, liquid-glass & QR reticles
    └── js/
        └── app.js                   # Client logic, QR scanner, audio chime & canvas charts
```

---

*Zoogle Technologies India Pvt. Ltd. • Whitefield Technology Bay, Bangalore, Karnataka.*
