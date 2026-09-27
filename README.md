# HR-and-Payroll-System# CI/CD webhook test
## Project Overview

The Smart HR & Payroll System is a centralized web-based platform designed to automate HR operations for medium-sized companies (200–500 employees). It replaces manual processes like spreadsheets with an efficient system for managing employee records, leave requests, and monthly payroll.

The project also incorporates DevOps practices including CI/CD, containerization, and automation to ensure efficient and reliable software delivery.

---

## Objectives

- Manage employee records and profiles efficiently
- Track leave applications and approvals
- Automate monthly payroll processing
- Generate payslips as PDF
- Provide role-based dashboards for Admin, HR, and Employees
- Automate deployment using Jenkins CI/CD
- Containerize the application using Docker

---

## Features

### Authentication
- Secure login with JWT
- Forgot Password via Email OTP
- Role-Based Access Control (RBAC)

### Employee Management
- View all employees with search
- Add new employees (creates login account automatically)
- Edit employee details

### Leave Management
- Apply for leave (Casual, Sick, Annual)
- View leave balance and history
- Approve/Reject leaves (HR/Admin)
- Email notifications on approval/rejection

### Payroll
- Run monthly payroll for all employees
- Auto-calculate salary (Basic + Allowances - Deductions)
- View and download payslips as PDF
- Payroll history

### Reports & Charts
- Dashboard with summary stats
- Employee growth chart
- Department-wise distribution
- Leave status breakdown

---

## User Roles

| Role | Permissions |
|:---|:---|
| **Admin** | Full system access, manage users, settings |
| **HR** | Manage employees, approve leaves, run payroll, view reports |
| **Employee** | View own profile, apply leave, download payslips |

---

## System Workflow
Login → Role-Based Dashboard →
├── HR/Admin: Manage Employees → Approve Leaves → Run Payroll → View Reports
└── Employee: Apply Leave → View Payslips → View Profile

---

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

### Database
- PostgreSQL (via Supabase)

### DevOps Tools
- Git
- GitHub
- Jenkins
- Docker

### Testing
- Postman

---

## DevOps Pipeline
Developer → GitHub Repository → Jenkins Build → Automated Testing → Docker Image → Deployment (Vercel)

---

## Live Demo

🌐 **Website:** [https://hr-and-payroll-system.vercel.app/](https://hr-and-payroll-system.vercel.app/)

### Test Credentials

| Role | Email | Password |
|:---|:---|:---|
| Admin | admin@hr.com | admin123 |
| HR | hr@hr.com | hr123 |
| Employee | employee@hr.com | employee123 |

---

## Installation (Local Setup)

### Clone Repository
```bash
git clone https://github.com/VaddeGeetha/HR-and-Payroll-System.git
cd HR-and-Payroll-System
```
### Backend Setup
```bash
cd hr-backend
npm install
node index.js
```
### Frontend Setup
```bash
# In root folder
npx live-server --port=3000
```

---

## Docker Deployment
### Build Docker Image
```bash
docker build -t hr-payroll-system .
Run Container
```
```bash
docker run -p 5000:5000 hr-payroll-system
```

---

## Testing
Manual Testing: Performed by QA Engineer

API Testing: Postman collection

---

## Future Enhancements
Prometheus + Grafana monitoring

Advanced analytics dashboard

Bank file generation for salary transfer

Two-Factor Authentication (2FA)

---

# Team Theta
1	V. Vennela - Product Owner

2	N. Rachana - Scrum Master + Frontend

3	V. Sujana - Frontend Developer

4	P. Varshini - Backend Developer

5	V. Geetha	- DevOps Engineer

6	P. Deepshika	- Database Engineer

7	R. Shireesha	- QA Engineer

---

Team Theta

Department of Computer Science and Engineering (Data Science)

DevOps Project

2026
