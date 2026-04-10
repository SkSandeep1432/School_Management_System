# School Management System

A full-stack school administration web application built with **Angular 17** (frontend) and **Spring Boot 3** (backend), using **MySQL** as the database.

---

## 🔐 Default Admin Credentials

| Field    | Value                    |
|----------|--------------------------|
| Username | `sandeeprcb18@gmail.com` |
| Password | `Sandeep@123`            |
| Role     | `ADMIN`                  |

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Angular 17 (Standalone Components)  |
| Backend   | Spring Boot 3, Spring Security 6    |
| Auth      | JWT (HS512)                         |
| Database  | MySQL 8                             |
| PDF       | iText (Report Card generation)      |
| Email     | JavaMail (SMTP - async background)  |

---

## 👥 User Roles

- **Admin** — Manages classes, sections, subjects, teachers, students, exams, and sends report cards
- **Teacher** — Marks attendance, enters/updates marks, replies to parent complaints
- **Parent** — Registers with child's roll number, views report cards, attendance, and submits complaints

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8
- Maven

### Backend Setup
```bash
cd backend
# Configure DB credentials in src/main/resources/application.properties
mvn clean package -DskipTests
java -jar target/school-admin-0.0.1-SNAPSHOT.jar
```
Backend runs on: `http://localhost:8080`

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```
Frontend runs on: `http://localhost:4200`

### Database Setup
Create the database before starting:
```sql
CREATE DATABASE school_admin_db;
```
Tables are auto-created by Hibernate (`ddl-auto=update`).

---

## 📁 Project Structure

```
schoolmanagement/
├── backend/                  # Spring Boot application
│   └── src/main/java/com/school/admin/
│       ├── controller/       # REST API controllers
│       ├── service/          # Business logic
│       ├── entity/           # JPA entities
│       ├── repository/       # Spring Data repos
│       ├── dto/              # Request / Response DTOs
│       ├── security/         # JWT filter & user details
│       ├── config/           # Security, CORS, Data seeding
│       ├── exception/        # Global exception handler
│       └── util/             # PDF generator, Grade calculator
└── frontend/                 # Angular 17 application
    └── src/app/
        ├── features/         # Admin / Teacher / Parent modules
        ├── core/             # Services, Guards, Interceptors
        └── shared/           # Navbar component
```

---

## 🔑 API Base URL

```
http://localhost:8080/api
```

### Key Endpoints
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/auth/login` | All |
| POST | `/auth/register/parent` | Public |
| GET | `/admin/students` | Admin |
| POST | `/admin/teachers` | Admin |
| POST | `/teacher/marks` | Teacher |
| POST | `/teacher/attendance` | Teacher |
| GET | `/parent/child` | Parent |
| GET | `/parent/child/reports` | Parent |

---

## 📧 Report Cards

Report cards are generated as PDFs and emailed to parents asynchronously in the background — no timeout issues for large batches.
