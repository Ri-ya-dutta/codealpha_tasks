# Task 4 – Job Board Platform

A RESTful Job Board API built using **Node.js, Express.js, MongoDB, and Mongoose**. The platform supports employers posting jobs, candidates searching and applying for jobs, resume uploads, application tracking, notifications, and administrator management.

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (authentication)
- bcryptjs (password hashing)
- Multer (resume uploads)
- CORS
- dotenv

## Features

### Authentication
- Employer and candidate registration.
- Login using email and password.
- JWT-based authentication.
- Role-based authorization for employers, candidates, and admins.
- Protected user profile endpoint.

### Job Management
- Employers can create, update, and delete their own job listings.
- Public job listing and job details.
- Search and filter jobs by keyword, location, job type, experience level, and salary.

### Resume Management
- Candidates can upload PDF, DOC, and DOCX resumes.
- File type and 5 MB size validation.
- Candidates can view their uploaded resumes.

### Application Management
- Candidates can apply for open jobs using an uploaded resume.
- Candidates can track their applications.
- Employers can view applications for their own job listings.
- Employers can update application statuses.
- Duplicate applications for the same job are prevented.

### Notifications
- Employers receive in-app notifications when candidates apply.
- Candidates receive notifications when application statuses change.
- Users can view and mark their notifications as read.

### Admin Management
- View platform statistics, including users, employers, candidates, jobs, and applications.
- View registered users and their roles.
- Admin-only routes protected by role-based authorization.

## Project Structure

```text
task-04-job-board/
├── README.md
└── server/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   ├── scripts/
    │   ├── uploads/
    │   ├── app.js
    │   └── server.js
    ├── .env.example
    ├── package.json
    └── package-lock.json
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

### 2. Navigate to the server folder

```bash
cd task-04-job-board/server
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file using `.env.example` as a reference.

```env
PORT=5004
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

### 5. Start the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API runs at:

```text
http://localhost:5004
```

Health check:

```text
GET /health
```

## API Endpoints

All protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

### Authentication – `/api/auth`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public |
| GET | `/me` | Authenticated |

### Jobs – `/api/jobs`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Public |
| GET | `/:id` | Public |
| POST | `/` | Employer |
| PUT | `/:id` | Owning employer |
| DELETE | `/:id` | Owning employer |

Supported search query parameters include `keyword`, `location`, `jobType`, `experienceLevel`, `minSalary`, and `maxSalary`.

### Resumes – `/api/resumes`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/upload` | Candidate |
| GET | `/my` | Candidate |

Resume upload uses `multipart/form-data` with the field name `resume`.

### Applications – `/api/applications`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Candidate |
| GET | `/my` | Candidate |
| GET | `/job/:jobId` | Owning employer |
| PATCH | `/:id/status` | Owning employer |

Application status options: `pending`, `reviewing`, `shortlisted`, `rejected`, and `accepted`.

### Notifications – `/api/notifications`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Authenticated |
| PATCH | `/:id/read` | Notification recipient |

### Admin – `/api/admin`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/stats` | Admin |
| GET | `/users` | Admin |

## Admin Account Setup

Admin registration is not available through public registration.

To initialize an admin account, configure `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` temporarily in `.env`, then run:

```bash
node src/scripts/createAdmin.js
```

Remove these temporary variables after the account is created. The admin account remains stored in MongoDB.

## Testing

The API was tested using **Postman and Thunder Client**.

Testing covered:

- Employer and candidate registration and login.
- Protected routes and role-based authorization.
- Job creation, listing, searching, updating, and deletion.
- Resume upload and retrieval.
- Job applications and duplicate application prevention.
- Employer application tracking.
- Application status updates.
- Employer and candidate notifications.
- Notification read status.
- Admin statistics and user listing.
- Unauthorized access to admin routes.

## Security and Validation

- Passwords are hashed using bcryptjs.
- JWT protects authenticated routes.
- Role-based access controls restrict sensitive operations.
- Employers can manage only their own jobs and applications.
- Resume uploads are restricted by file type and size.
- Passwords are excluded from user API responses.
- Environment variables are used for configuration and secrets.

## Notes

- MongoDB Atlas is used for database storage.
- Resume files are stored locally in the server's uploads directory during development.
- The uploads directory and `.env` file should not be committed to GitHub.
- A persistent or cloud-based file storage service is recommended for production deployment.

---

**Developed as part of the CodeAlpha Backend Development Internship.**