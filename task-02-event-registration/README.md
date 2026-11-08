# Event Registration System

A full-stack Event Registration System built using Node.js, Express.js, MongoDB, and vanilla JavaScript. The application allows users to discover events, register for available events, and manage their registrations. Organizers can create and manage events, while administrators can oversee all events and registration activity.

## Features

### Authentication and Authorization
- User registration and login.
- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based access control.
- Three roles: User, Organizer, and Admin.

### User Features
- Browse upcoming events.
- Search events and filter by category or date.
- View event details and available seats.
- Register for events.
- View personal registrations.
- Cancel registrations.

### Organizer Features
- Create new events.
- View and manage their own events.
- Update event details.
- Cancel events.
- View event attendees.
- View event registration statistics.

### Admin Features
- View and manage events created by all organizers.
- Update or cancel events.
- View attendee lists.
- View event registration statistics.

### Registration Management
- Prevent duplicate active registrations.
- Enforce event capacity limits.
- Track confirmed and cancelled registrations.
- Reactivate a previous registration when a user registers again after cancellation.
- Update available seats when registrations are cancelled.

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs

### Frontend
- HTML5
- CSS3
- JavaScript

### Development Tools
- npm
- Nodemon
- Postman

## Project Structure

```text
task-02-event-registration/
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   └── registrationController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── models/
│   │   │   ├── Event.js
│   │   │   ├── Registration.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   └── registrationRoutes.js
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js and npm installed.
- MongoDB Atlas account or an accessible MongoDB instance.
- Git (optional).

### 1. Clone the Repository

```bash
git clone https://github.com/Ri-ya-dutta/backend-tasks.git
cd backend-tasks/task-02-event-registration
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server/` directory.

Use `.env.example` as a reference:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Replace the placeholder values with your own MongoDB connection string and a secure JWT secret.

Do not commit your `.env` file or expose your credentials.

### 4. Start the Backend

For development:

```bash
npm run dev
```

For normal startup:

```bash
npm start
```

The backend runs at:

`http://localhost:5001`

### 5. Run the Frontend

Open `client/index.html` in a browser.

Ensure the backend is running before using the application.

## API Documentation

Base URL:

`http://localhost:5001/api`

Protected endpoints require a JWT access token in the request header:

`Authorization: Bearer <token>`

### Authentication APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Log in | Public |
| GET | `/auth/profile` | Get logged-in user profile | Authenticated |

### Event APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/events` | Get upcoming events | Public |
| GET | `/events/:id` | Get event details | Public |
| GET | `/events/my-events` | Get managed events | Organizer/Admin |
| POST | `/events` | Create an event | Organizer/Admin |
| PUT | `/events/:id` | Update an event | Organizer/Admin |
| PATCH | `/events/:id/cancel` | Cancel an event | Organizer/Admin |

The event listing endpoint supports search, category filtering, date filtering, sorting, and pagination.

### Registration APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/registrations/my-registrations` | Get personal registrations | Authenticated |
| POST | `/registrations/:eventId` | Register for an event | Authenticated |
| DELETE | `/registrations/:eventId` | Cancel a registration | Authenticated |
| GET | `/registrations/event/:eventId` | Get event attendees | Organizer/Admin |
| GET | `/registrations/event/:eventId/statistics` | Get event statistics | Organizer/Admin |

Organizers can view attendee lists and statistics only for their own events. Admins can access these details for all events.

## Testing

The backend APIs can be tested using Postman.

Recommended testing sequence:

1. Register a user and log in.
2. Copy the returned JWT token.
3. Test the authenticated profile endpoint.
4. Create an Organizer account and assign the Organizer role for testing.
5. Create an event as an Organizer.
6. Retrieve and search for upcoming events.
7. Register as a User.
8. Test duplicate registration and event capacity restrictions.
9. Cancel a registration and verify seat availability.
10. Test attendee lists and event statistics as an Organizer.
11. Test event management and access permissions as an Admin.

## Security and Validation

- Passwords are hashed before storage.
- JWT authentication protects private routes.
- Role-based authorization restricts privileged operations.
- Public registration does not allow users to assign themselves Organizer or Admin roles.
- Event capacity is enforced during registration.
- Duplicate active registrations are prevented.
- Event ownership is checked before organizer-level management operations.

## Future Improvements

- Email notifications for event registration and cancellation.
- Password reset functionality.
- Event image uploads.
- Advanced event filtering.
- Automated backend tests.
- Deployment of the frontend and backend.

## Author

Developed as part of the CodeAlpha Backend Development Internship.