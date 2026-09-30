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

## 2. Quick Start Commands

### Backend (Django)
```bash
cd smart_anganwadi/backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations core
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend (React + Vite)
```bash
cd smart_anganwadi/frontend
npm install
npm run dev
```

Visit the app at: `http://localhost:5173/`

---

## 3. Demo Login Credentials (1-Click Buttons on Login Page)

| Role | Username | Password | Center Assignment / Child |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Global district access |
| **Anganwadi Worker** | `worker_priya` | `worker123` | Asha Kiran Anganwadi Kendra #12 |
| **Supervisor** | `supervisor_anita` | `supervisor123` | Kendra #12 & Kendra #45 |
| **Parent** | `parent_rajesh` | `parent123` | Child: Aarav Verma (CHD-101) |

For complete documentation, see [smart_anganwadi/README.md](smart_anganwadi/README.md).
