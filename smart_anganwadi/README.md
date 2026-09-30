# Smart Anganwadi Management System (SAMS)
### Poshan Abhiyaan & Early Childhood Care and Development Platform

Smart Anganwadi Management System (SAMS) is a production-ready, full-stack digital solution built for the Integrated Child Development Services (ICDS) ecosystem. It modernizes community healthcare, child nutritional growth monitoring, attendance, universal immunization tracking, maternal health records, hot-cooked meal distribution, and early childhood education across Anganwadi Kendras.

---

## 1. Project Overview
Anganwadi centers serve as the frontline for maternal and child healthcare in India. Traditionally, Anganwadi workers maintain dozens of physical paper registers for attendance, growth charts, immunization logs, food rations, and pregnant women checkups. 

**SAMS** replaces manual paper registers with an automated, role-guarded web platform providing:
- **Centralized Child Registry** with automated growth trajectory tracking and WHO BMI categorization.
- **Fast 1-Click Daily Attendance Register** with duplicate check protection.
- **Universal Immunization Programme (UIP) Tracker** with automated overdue dose surveillance alerts.
- **Comprehensive Maternal & Prenatal Module** with EDD countdown, blood pressure, hemoglobin, and TT dose logs.
- **Supplementary Nutrition Programme (SNP) & Food Inventory** with automated low-stock indent alerts.
- **District Supervisory & Admin Dashboards** with multi-center comparisons and CSV reporting.
- **Parent Portal** allowing parents to track their child's attendance, vaccines, growth milestones, and daily meal plans.

---

## 2. Features

### Role-Based Access Control (4 Distinct Roles)
1. **Administrator**:
   - District-wide oversight and live mission control analytics.
   - Anganwadi center registration and worker/supervisor assignments.
   - User account lifecycle management (Workers, Supervisors, Parents).
   - District compliance reports with 1-click CSV exports.
2. **Anganwadi Worker**:
   - Fast morning attendance roll-call with bulk "Mark All Present" and individual status toggles.
   - Child enrollment and comprehensive health profiles.
   - Interactive Growth & Nutrition calculator (auto-computes BMI and suggests WHO classification).
   - Immunization dose administration and overdue follow-up flags.
   - Prenatal care checkups (BP, Weight, Hb) and maternal TT vaccinations.
   - Daily hot-cooked meal menu planning and food commodity stock updates.
   - Early Childhood Care & Education (ECCE) activity evaluation.
3. **Supervisor**:
   - Multi-center surveillance comparing enrollment, daily attendance rates, and malnutrition prevalence.
   - Consolidated risk mitigation alerts (missed vaccines, SAM children, hospital referrals, low stock).
   - Auditing center records and generating district-level CSV summaries.
4. **Parent / Guardian**:
   - Dedicated child health portal.
   - Real-time attendance percentage and monthly attendance history.
   - Longitudinal growth chart showing height & weight milestones.
   - Complete vaccination timeline with upcoming due dates.
   - Today's Anganwadi center food menu and early childhood learning activities.

---

## 3. Technology Stack

### Backend
- **Python 3.14**
- **Django 6.0**
- **Django REST Framework (DRF) 3.17**
- **SQLite 3** (Development database using Django ORM)
- **djangorestframework-simplejwt** (Secure JSON Web Token authentication)
- **django-cors-headers** (Cross-Origin Resource Sharing for React frontend)
- **Pillow 12.0** (Image processing for child photos and activity materials)

### Frontend
- **React 18**
- **Vite 6** (Blazing fast HMR and optimized production bundling)
- **React Router DOM v6** (Declarative role-based routing and route guards)
- **Axios** (Centralized API client with JWT injection and 401 interceptors)
- **Recharts** (Interactive SVG data visualizations: Line charts, Bar charts, Donut charts)
- **Lucide React** (Crisp modern iconography)
- **Custom Modern CSS Design System** (Accessible, high-contrast, mobile-friendly interface designed for Anganwadi workers)

---

## 4. Folder Structure

```
smart_anganwadi/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── .env.example
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py      # JWT, CORS, Media, Database & App settings
│   │   ├── urls.py          # Root URL dispatcher
│   │   └── wsgi.py
│   └── core/
│       ├── __init__.py
│       ├── apps.py
│       ├── models.py        # 16 Domain models + Custom User
│       ├── serializers.py   # DRF ModelSerializers & custom token claims
│       ├── permissions.py   # Granular role-based permission classes
│       ├── views.py         # ViewSets, analytical aggregations, alerts & CSV export
│       ├── urls.py          # DRF Router & endpoint mappings
│       ├── admin.py         # Feature-rich Django Admin configuration
│       └── management/
│           └── commands/
│               └── seed_data.py # Realistic Indian Anganwadi demo dataset
│
└── frontend/
    ├── package.json
    ├── vite.config.js       # Vite build & Django proxy configuration
    ├── index.html
    ├── .env.example
    └── src/
        ├── App.jsx          # Role-protected route trees
        ├── main.jsx         # App mounting with AuthProvider & BrowserRouter
        ├── index.css        # SAMS modern design system tokens & layout utilities
        ├── context/
        │   └── AuthContext.jsx # Auth state, login/logout, role verification
        ├── services/
        │   └── api.js       # Centralized Axios client & modular domain services
        ├── components/
        │   ├── Navbar.jsx   # Topbar with notifications, center tag & user menu
        │   ├── Sidebar.jsx  # Role-specific navigation drawer
        │   ├── StatCard.jsx # Reusable KPI metric card
        │   ├── AlertBanner.jsx # Priority health and inventory alert banners
        │   ├── Modal.jsx    # Accessible modal dialog
        │   ├── GrowthChart.jsx # Recharts weight/height trajectory graph
        │   ├── ProtectedRoute.jsx
        │   └── Layout.jsx
        └── pages/
            ├── Login.jsx    # 1-Click Demo Login Bar for all 4 roles
            ├── Register.jsx
            ├── ForgotPassword.jsx
            ├── AdminDashboard.jsx
            ├── WorkerDashboard.jsx
            ├── SupervisorDashboard.jsx
            ├── ParentDashboard.jsx
            ├── ChildrenList.jsx
            ├── ChildProfile.jsx
            ├── AttendancePage.jsx
            ├── GrowthMonitoring.jsx
            ├── ImmunizationTracker.jsx
            ├── HealthRecordsPage.jsx
            ├── PregnantWomenPage.jsx
            ├── FoodNutritionPage.jsx
            ├── LearningActivitiesPage.jsx
            ├── ReportsPage.jsx
            ├── UserManagement.jsx
            ├── CentersPage.jsx
            └── AlertsPage.jsx
```

---

## 5. Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd smart_anganwadi/backend
   ```
2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv env
   # Windows:
   env\Scripts\activate
   # Linux / macOS:
   source env/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 6. Frontend Installation

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd smart_anganwadi/frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 7. Database Migration

Run standard Django migrations to set up the database schema:
```bash
cd smart_anganwadi/backend
python manage.py makemigrations core
python manage.py migrate
```

---

## 8. Creating Superuser & Seeding Demo Data

### Step A: Seed Comprehensive Demo Data
Run the built-in management command to automatically populate 4 demo accounts, 2 centers, 10 child profiles, historical attendance, growth trajectories, vaccinations, health records, pregnant women, meal plans, food stock, and notifications:
```bash
python manage.py seed_data
```

### Step B: (Optional) Manual Superuser Creation
If you wish to create a custom administrative superuser:
```bash
python manage.py createsuperuser
```

---

## 9. Running Backend

Start the Django development server:
```bash
cd smart_anganwadi/backend
python manage.py runserver
```
The Django REST API will be running at: `http://127.0.0.1:8000/`  
Django Admin Portal: `http://127.0.0.1:8000/admin/`

---

## 10. Running Frontend

Start the Vite development server:
```bash
cd smart_anganwadi/frontend
npm run dev
```
The React application will be live at: `http://localhost:5173/`

---

## 11. API Endpoints Reference

### Authentication
- `POST /api/auth/login/` - Obtain JWT access and refresh tokens along with user profile and role.
- `POST /api/auth/register/` - Register a new user account.
- `POST /api/auth/refresh/` - Refresh expired access token.
- `GET  /api/auth/me/` - Retrieve profile of currently authenticated user.

### Analytics & Alerts
- `GET /api/dashboard/stats/` - Role-scoped KPI metrics (Present/Absent, At-Risk, Vaccines due, Low stock).
- `GET /api/dashboard/charts/` - Time-series attendance trend, growth distribution, gender ratio, center comparison.
- `GET /api/alerts/` - Real-time alerts for missed vaccinations, SAM malnutrition, and commodity shortages.
- `GET /api/reports/export-csv/?type=<children|attendance|growth|food_stock|pregnant_women>` - Instant CSV download.

### Domain Entities (Full CRUD)
- `/api/children/` & `/api/children/<id>/full_profile/`
- `/api/attendance/` & `POST /api/attendance/bulk_record/`
- `/api/growth/`
- `/api/immunizations/`
- `/api/health-records/`
- `/api/pregnant-women/` & `/api/pregnant-women/<id>/full_details/`
- `/api/pregnancy-health/`
- `/api/maternal-vaccinations/`
- `/api/food-menu/`
- `/api/food-stock/`
- `/api/learning-activities/`
- `/api/child-activities/`
- `/api/anganwadi-centers/`
- `/api/users/` (Admin only)
- `/api/notifications/`

---

## 12. Demo Login Credentials

The login page at `http://localhost:5173/login` includes **1-Click Quick Demo Login buttons** for immediate evaluation without manual typing:

| Role | Username | Password | Center Assignment / Child |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Global district access |
| **Anganwadi Worker** | `worker_priya` | `worker123` | Asha Kiran Anganwadi Kendra #12 |
| **Supervisor** | `supervisor_anita` | `supervisor123` | Kendra #12 & Kendra #45 |
| **Parent** | `parent_rajesh` | `parent123` | Child: Aarav Verma (CHD-101) |

---

## 13. Future Improvements
1. **Offline-First Synchronization (Service Worker / IndexedDB)**: SAMS is architected with a decoupled frontend API service layer ready for IndexedDB caching and background sync when connectivity drops in remote rural areas.
2. **SMS & WhatsApp Gateway Integration**: Automated SMS notifications to parents for upcoming vaccination drives and low attendance alerts.
3. **Multilingual Regional Voice Support**: Voice-assisted data entry for Anganwadi workers in regional languages (Hindi, Marathi, Tamil, Bengali, Telugu, Gujarati).
4. **PWA Mobile App**: Packaging the Vite bundle with a manifest and web worker for native-like offline mobile operation.
