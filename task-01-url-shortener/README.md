# URL Shortener

A full-stack URL shortening application built using **Node.js, Express.js, MongoDB, HTML, CSS, and JavaScript**.

The application accepts long URLs, generates unique short codes, stores URL mappings in MongoDB, and redirects users to their original destinations. It also tracks URL clicks and provides REST APIs to retrieve URL information.

The project includes a simple, responsive frontend that allows users to shorten URLs, copy generated links, and view recently shortened URLs.

## Features

### Backend Features

- Create shortened URLs.
- Validate original URLs (HTTP and HTTPS only).
- Generate unique 8-character hexadecimal short codes.
- Store URL mappings in MongoDB Atlas.
- Redirect users to original URLs using HTTP 302.
- Track the number of clicks for each shortened URL.
- Retrieve details of an individual shortened URL.
- Retrieve all stored URLs.
- Support pagination for URL listings.
- Validate pagination parameters and limit the maximum page size to 100 records.
- Handle invalid requests and server errors.

### Frontend Features

- Simple and responsive user interface.
- Enter a long URL and generate a shortened URL.
- Display the generated short URL.
- Copy shortened URLs to the clipboard.
- Open shortened URLs to redirect to their original destinations.
- Display recently shortened URLs.
- Show click counts for stored URLs.
- Refresh URL history manually.
- Automatically refresh URL history after creating a new short URL.
- Display appropriate success and error messages.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| JavaScript | Frontend functionality and API communication |
| HTML5 | Frontend structure |
| CSS3 | Frontend styling |
| Fetch API | Communication between frontend and backend |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variable management |
| Nodemon | Development server auto-restart |

## Project Structure

```text
task-01-url-shortener/
│
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   └── urlController.js
│   │   │
│   │   ├── models/
│   │   │   └── Url.js
│   │   │
│   │   ├── routes/
│   │   │   └── urlRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Installation and Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB Atlas account
- Visual Studio Code
- Live Server extension (for running the frontend)

### 1. Clone the Repository

```bash
git clone https://github.com/Ri-ya-dutta/backend-tasks.git
```

### 2. Navigate to the Backend Directory

```bash
cd backend-tasks/task-01-url-shortener/server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory using `.env.example` as a reference.

Configure the following variables:

```env
PORT=5000
BASE_URL=http://localhost:5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the MongoDB URI with your own MongoDB Atlas connection string.

**Important:** Do not commit your `.env` file or expose your database credentials.

### 5. Start the Backend Server

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The backend server runs at:

`http://localhost:5000`

## API Documentation

The backend provides the following REST API endpoints.

### 1. Health Check

Checks whether the API server is running.

| Method | Endpoint |
|---|---|
| GET | `/health` |

### 2. Create a Short URL

Creates a shortened URL and stores its mapping in MongoDB.

| Method | Endpoint |
|---|---|
| POST | `/api/urls` |

**Request Body:**

```json
{
  "originalUrl": "https://www.google.com"
}
```

**Success Response: `201 Created`**

```json
{
  "success": true,
  "message": "Short URL created successfully",
  "data": {
    "originalUrl": "https://www.google.com/",
    "shortCode": "1fb19d1e",
    "shortUrl": "http://localhost:5000/1fb19d1e"
  }
}
```

### 3. Redirect to Original URL

Redirects the user to the original URL and increments its click count.

| Method | Endpoint |
|---|---|
| GET | `/:shortCode` |

**Example:**

```text
http://localhost:5000/1fb19d1e
```

Uses HTTP `302 Found` for redirection.

### 4. Get URL Details

Retrieves information about a particular shortened URL.

| Method | Endpoint |
|---|---|
| GET | `/api/urls/:shortCode` |

**Example:**

```text
GET /api/urls/1fb19d1e
```

Returns information including:

- Original URL
- Short code
- Click count
- Creation timestamp

### 5. Get All URLs

Retrieves all stored shortened URLs with pagination support.

| Method | Endpoint |
|---|---|
| GET | `/api/urls` |

**Query Parameters:**

| Parameter | Description | Default |
|---|---|---|
| `page` | Page number | 1 |
| `limit` | Number of records per page | 10 |

**Example:**

```text
GET /api/urls?page=1&limit=5
```

The maximum permitted page size is 100 records.

The response includes pagination information and the URL records for the requested page.

## Error Handling

The backend handles common errors, including:

- Missing original URL.
- Invalid URL format.
- Unsupported URL protocols.
- Unknown short codes.
- Invalid pagination parameters.
- Database connection failures.
- Server errors.

The frontend also displays appropriate error messages when URL creation fails or the backend cannot be reached.

## Database Model

The application uses a MongoDB collection named `urls`.

Each URL document contains the following fields:

| Field | Type | Description |
|---|---|---|
| `originalUrl` | String | Original long URL |
| `shortCode` | String | Unique generated short code |
| `clicks` | Number | Number of redirects |
| `createdAt` | Date | Document creation timestamp |
| `updatedAt` | Date | Last document update timestamp |

Mongoose timestamps are enabled, and the short code has a unique index to prevent duplicate short codes.

## Frontend Setup

The frontend is built using HTML, CSS, and vanilla JavaScript. It communicates with the Express.js backend using the Fetch API.

### Running the Frontend

1. Make sure the backend server is running at `http://localhost:5000`.

2. Open the project in Visual Studio Code.

3. Open the `client` folder.

4. Open `index.html` using the Live Server extension.

5. The frontend will be available at:

   `http://127.0.0.1:5500`

The frontend communicates with the backend API at:

`http://localhost:5000/api/urls`

**Note:** The backend server must remain running for URL shortening, redirection, and URL history features to work.

## Future Improvements

- User authentication and URL ownership.
- URL expiration and deletion.
- Custom short codes.
- Advanced URL analytics and visualization.
- Rate limiting.
- Deployment of the frontend and backend.

## Author

Developed as part of a backend development internship task.

**Project:** URL Shortener

**Repository:** [Backend Tasks](https://github.com/Ri-ya-dutta/backend-tasks)

**Developed as part of the CodeAlpha Backend Development Internship.**