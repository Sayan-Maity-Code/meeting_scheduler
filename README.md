# Meeting Scheduler 

The Meeting Scheduler is a service designed to manage user authentication, user profiles, and meeting scheduling. Built with ReactJS, Node.js, Express, and MongoDB, it provides a seamless way to organize and manage meetings while ensuring no scheduling conflicts.

---

## **Features**

- **User Authentication**: Secure registration, login, and logout using JWT tokens.
- **User Profiles**: Retrieve and manage user profiles.
- **User Search**: Search for users by name or email.
- **Meeting Management**: Create, update, delete, and respond to meeting invitations.
- **Conflict Validation**: Prevents overlapping meetings for users.
- **Health Check**: Verifies the server's operational status.

---

## **How It Works**

The API interacts with MongoDB schemas for `User` and `Meeting` to store and retrieve data. It ensures secure authentication and provides endpoints to manage users and meetings effectively.

---

## **Installation**

To set up the project locally:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Sayan-Maity-Code/meeting_scheduler.git
   cd project
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and configure the following variables:

   ```
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   PORT=<your-preferred-port>
   ```

4. **Start the server**:

   ```bash
   npm run start
   ```

5. **Access the API**:
   The server will run at `http://localhost:<PORT>`.

---
## Screenshots
## First comes login page
![login page](https://github.com/Sayan-Maity-Code/meeting_scheduler/blob/main/Readme_img/login_page.png)
## If not singned up first then go to signup page
![Sign Up](https://github.com/Sayan-Maity-Code/meeting_scheduler/blob/main/Readme_img/signup_page.png)
## Profile
![Profile](https://github.com/Sayan-Maity-Code/meeting_scheduler/blob/main/Readme_img/profile.png)
## That's how the dashboard looks like at the initial stage before creating any meeting schedule
![Dashboard](https://github.com/Sayan-Maity-Code/meeting_scheduler/blob/main/Readme_img/Dashboard_meetsync.png)
## That's how it looks after creating a meeting
![Meeting Created](https://github.com/Sayan-Maity-Code/meeting_scheduler/blob/main/Readme_img/Create%20meeting%20.png)


## **API Endpoints**

### **Authentication Routes**

- **Register a New User**: `POST /api/auth/register`
- **Log In a User**: `POST /api/auth/login`
- **Log Out a User**: `POST /api/auth/logout`
- **Get User Profile**: `GET /api/auth/profile`

### **User Routes**

- **Search Users**: `GET /api/users/search`

### **Meeting Routes**

- **Create a New Meeting**: `POST /api/meetings`
- **Get All Meetings**: `GET /api/meetings`
- **Get Meeting by ID**: `GET /api/meetings/:id`
- **Update a Meeting**: `PUT /api/meetings/:id`
- **Delete a Meeting**: `DELETE /api/meetings/:id`
- **Respond to Meeting Invitation**: `PUT /api/meetings/:id/respond`

### **Health Check**

- **Check Server Health**: `GET /api/health`

---

## **Database Schemas**

### **User Schema**

- **Fields**:
  - `name`: User's full name.
  - `email`: User's email address.
  - `password`: Hashed password.
  - `createdAt`: Timestamp of account creation.
- **Methods**:
  - `comparePassword`: Compares a plaintext password with the hashed password.

### **Meeting Schema**

- **Fields**:
  - `title`: Title of the meeting.
  - `description`: Description of the meeting.
  - `startTime`: Start time of the meeting.
  - `endTime`: End time of the meeting.
  - `organizer`: Reference to the `User` schema for the meeting organizer.
  - `attendees`: Array of attendees with their status (`pending`, `accepted`, `declined`).
  - `location`: Location of the meeting.
  - `createdAt`: Timestamp of meeting creation.
- **Methods**:
  - `hasConflict`: Checks if the meeting conflicts with another meeting for a given user.

---

## **Usage Examples**

### **Register a New User**

```bash
curl -X POST http://localhost:<PORT>/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### **Create a New Meeting**

```bash
curl -X POST http://localhost:<PORT>/api/meetings \
-H "Content-Type: application/json" \
-d '{"title": "Team Meeting", "startTime": "2023-10-01T10:00:00Z", "endTime": "2023-10-01T11:00:00Z", "attendees": ["jane@example.com"]}'
```

---

## **Contributing**

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

---

## **License**

This project is licensed under the MIT License. See the `LICENSE` file for details.
