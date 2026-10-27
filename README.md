# ClubSphere — College Event Management Platform

ClubSphere is a full-stack college event management platform built using the **MERN stack**. It provides a centralized platform for students to discover events, register for participation, access registration QR codes, and receive event-related notifications.

The application provides separate dashboards for **Students, Organizers, and Administrators**, with functionality tailored to each role.

## ✨ Features

### 👨‍🎓 Student Dashboard
- Explore available college events.
- View event details.
- Register for events.
- Access registered event details and QR codes.
- Receive event-related notifications.
- View unread notification counts.

### 🧑‍💼 Organizer Dashboard
- Access organizer-specific functionality.
- Manage college events using available event management features.
- Review event registrations where supported.
- Support QR-based attendance verification where implemented.

### 🛡️ Admin Dashboard
- Access administrative functionality.
- Manage platform-related information using available admin features.
- Support centralized event and user management where implemented.

### 🔔 Notifications and Reminders
- Notification dropdown with unread counts.
- Event-related notifications.
- Scheduled backend event reminder job.

### 📱 QR Code Workflow
- QR codes associated with student event registrations.
- QR code preview on the student dashboard.
- QR-based check-in functionality where configured.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development server and build tool |
| Node.js | Backend runtime |
| Express.js | Backend API and routing |
| MongoDB Atlas | Database |
| Mongoose | MongoDB object modeling |
| Axios | HTTP requests between frontend and backend |
| JWT and cookies | Authentication, as configured |

## 📁 Project Structure

```text
ClubSphere/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── package.json
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Node.js and npm
- A MongoDB Atlas account or another MongoDB instance
- Git

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ClubSphere-Restart-Package
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory.

```env
PORT=5005
CLIENT_URL=http://localhost:5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
NODE_ENV=development
```

Replace the placeholder values with your own configuration. Never commit your actual `.env` file, database credentials, or JWT secret to GitHub.

### 5. Start the backend

From the `server` directory, run:

```bash
node server.js
```

The backend should run at:

`http://localhost:5005`

### 6. Start the frontend

Open a second terminal window and run:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite. If configured for port 5002, the frontend will be available at:

`http://localhost:5002`

### 7. Check API health

Visit:

`http://localhost:5005/api/health`

The endpoint reports whether the API is running and whether MongoDB is connected.

## 🔐 Demo Accounts

The following credentials are intended for local project demonstration only.

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | `1234567890` |
| Organizer | organizer@gmail.com | `12345678` |

**Important:** These accounts must already exist in the database and have the correct roles assigned. If they have not been seeded or created, the credentials will not work automatically.

For a public GitHub repository, avoid publishing reusable passwords. Prefer creating temporary demo accounts or sharing credentials privately with evaluators.

## 🔌 API Overview

The backend exposes routes for the following areas:

| Route | Purpose |
|---|---|
| `/api/health` | API and database health |
| `/api/auth` | Authentication |
| `/api/events` | Event-related operations |
| `/api/registrations` | Event registrations |
| `/api/notifications` | Notifications |

Refer to the backend route files for the available endpoints and supported operations.

## 🎯 Project Objective

ClubSphere aims to simplify college event discovery, registration, and coordination through a centralized platform with role-specific dashboards and event-related workflows.

---

## 🎥 Video Demonstration

[Watch the ClubSphere Project Demo](https://drive.google.com/file/d/1qel7HHJ7DaCkvy8kpCgWItSAxZJ4yPDI/view?usp=sharing)

## 👩‍💻 Author

**Pavitra Patel**

College Event Management Platform — Full-Stack Web Development Project.
