**# URL Shortener API**



**A backend URL Shortener application built using \*\*Node.js, Express.js, and MongoDB\*\*.**



**The application accepts long URLs, generates unique short codes, stores URL mappings in MongoDB, and redirects users to their original destinations. It also tracks URL clicks and provides APIs to retrieve URL information.**



**## Features**



**- Create shortened URLs.**

**- Validate original URLs (HTTP and HTTPS only).**

**- Generate unique 8-character hexadecimal short codes.**

**- Store URL mappings in MongoDB Atlas.**

**- Redirect users to original URLs using HTTP 302.**

**- Track the number of clicks for each shortened URL.**

**- Retrieve details of an individual shortened URL.**

**- Retrieve all stored URLs.**

**- Paginate URL listings.**

**- Validate pagination parameters and limit maximum page size.**



**## Technology Stack**



**| Technology | Purpose |**

**|---|---|**

**| Node.js | JavaScript runtime |**

**| Express.js | REST API framework |**

**| MongoDB Atlas | Cloud database |**

**| Mongoose | MongoDB object modeling |**

**| dotenv | Environment variable management |**

**| Nodemon | Development server auto-restart |**



**## Project Structure**



**```text**

**task-01-url-shortener/**

**│**

**├── server/**

**│   ├── src/**

**│   │   ├── config/**

**│   │   │   └── db.js**

**│   │   │**

**│   │   ├── controllers/**

**│   │   │   └── urlController.js**

**│   │   │**

**│   │   ├── models/**

**│   │   │   └── Url.js**

**│   │   │**

**│   │   ├── routes/**

**│   │   │   └── urlRoutes.js**

**│   │   │**

**│   │   └── server.js**

**│   │**

**│   ├── .env.example**

**│   └── package.json**

**│**

**└── README.md**

**```**



**## Installation and Setup**



**### 1. Clone the repository**



**```bash**

**git clone https://github.com/Ri-ya-dutta/backend-tasks.git**

**```**



**### 2. Navigate to the project**



**```bash**

**cd backend-tasks/task-01-url-shortener/server**

**```**



**### 3. Install dependencies**



**```bash**

**npm install**

**```**



**### 4. Configure environment variables**



**Create a `.env` file in the `server` directory using `.env.example` as a reference.**



**Configure:**



**```env**

**PORT=5000**

**BASE\_URL=http://localhost:5000**

**MONGODB\_URI=your\_mongodb\_connection\_string**

**```**



**Replace the MongoDB URI with your own MongoDB Atlas connection string.**



**### 5. Start the development server**



**```bash**

**npm run dev**

**```**



**The server runs at:**



**`http://localhost:5000`**



**## API Documentation**



**### 1. Health Check**



**Check whether the API server is running.**



**| Method | Endpoint |**

**|---|---|**

**| GET | `/health` |**



**### 2. Create a Short URL**



**Creates a shortened URL and stores its mapping in MongoDB.**



**| Method | Endpoint |**

**|---|---|**

**| POST | `/api/urls` |**



**\*\*Request Body:\*\***



**```json**

**{**

&#x20; **"originalUrl": "https://www.google.com"**

**}**

**```**



**\*\*Success Response:\*\* `201 Created`**



**```json**

**{**

&#x20; **"success": true,**

&#x20; **"message": "Short URL created successfully",**

&#x20; **"data": {**

&#x20;   **"originalUrl": "https://www.google.com/",**

&#x20;   **"shortCode": "1fb19d1e",**

&#x20;   **"shortUrl": "http://localhost:5000/1fb19d1e"**

&#x20; **}**

**}**

**```**



**### 3. Redirect to Original URL**



**Redirects the user to the original URL and increments its click count.**



**| Method | Endpoint |**

**|---|---|**

**| GET | `/:shortCode` |**



**Example:**



**`http://localhost:5000/1fb19d1e`**



**Uses HTTP `302 Found` for redirection.**



**### 4. Get URL Details**



**Retrieves information about a particular shortened URL.**



**| Method | Endpoint |**

**|---|---|**

**| GET | `/api/urls/:shortCode` |**



**Example:**



**`GET /api/urls/1fb19d1e`**



**Returns the original URL, short code, click count, and creation timestamp.**



**### 5. Get All URLs**



**Retrieves all shortened URLs with pagination support.**



**| Method | Endpoint |**

**|---|---|**

**| GET | `/api/urls` |**



**\*\*Query Parameters:\*\***



**| Parameter | Description | Default |**

**|---|---|---|**

**| page | Page number | 1 |**

**| limit | Number of records per page | 10 |**



**Example:**



**`GET /api/urls?page=1\&limit=5`**



**Maximum permitted page size: 100 records.**



**## Error Handling**



**The API handles common errors, including:**



**- Missing original URL.**

**- Invalid URL format.**

**- Unsupported URL protocols.**

**- Unknown short codes.**

**- Invalid pagination parameters.**

**- Database and server errors.**



**## Database Model**



**The application uses a MongoDB collection named `urls`.**



**Each URL document contains:**



**| Field | Type | Description |**

**|---|---|---|**

**| originalUrl | String | Original long URL |**

**| shortCode | String | Unique generated code |**

**| clicks | Number | Number of redirects |**

**| createdAt | Date | Document creation time |**

**| updatedAt | Date | Last document update time |**



**Mongoose timestamps are enabled, and the short code has a unique index.**



**## Future Improvements**



**- User authentication and URL ownership.**

**- URL expiration and deletion.**

**- Custom short codes.**

**- Analytics and click statistics.**

**- Rate limiting.**

**- A simple frontend interface.**



**## Author**



**Developed as part of a backend development internship task.**



**\*\*Project:\*\* URL Shortener API**  

**\*\*Repository:\*\* \[Backend Tasks](https://github.com/Ri-ya-dutta/backend-tasks)**

