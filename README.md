# OpsLog

A modern incident reporting system for organizations. Built to solve internal workflow pain points such as IT issues, facility requests, and support escalations.

---

## Why this exists
Organizations commonly lack:
- Lightweight internal support tools
- On-prem friendly workflow systems
- Customizable internal ticket software

OpsLog solves that gap with a flexible, installable web app.

---

## Features
Main features include:
- Ticket Creation & Management
- File attachments (Images/PDFs)
- Comment threads
- Status Flow: `Open → In Progress → Closed`
- Dashboard & Ticket Overview UI

Core Functionality:
- User Authentication (JWT)
- Role-Based Access Control  
  - Employee (create tickets, add acomment, attach files)  
  - Technician (full employee access, view all tickets, update status)  
  - Admin (full access)

---

## Tech Stack

| Layer | Technology |
|------|------------|
Frontend | React + Tailwind CSS
Backend | Node.js + Express
Database | PostgreSQL + Knex (Migrations)
Auth | JWT (JSON Web Tokens)

---

## Setup Instructions

### 1️. Clone repo

```
git clone https://github.com/YOUR_USERNAME/opslog.git
cd opslog
```

### 2. Backend Setup

#### Setup:

```
cd backend
npm install
```

#### Create .env:

```
DATABASE_URL=postgres://user:pass@localhost:5432/opslog_dev
JWT_SECRET=your_secret
PORT=4000
```

#### Create database:

```
CREATE DATABASE opslog_dev;
```

#### Run migrations:

```
npx knex migrate:latest
```

#### Start server:

```
npm run dev
```

### 3. Frontend Setup

```
cd frontend
npm run dev
```
