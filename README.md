# Meeting Scheduler API Documentation

This document provides an overview of the routes available in the Meeting Scheduler API, how they interact with the database schemas, and the features they implement.

---

## **Authentication Routes**

### **Register a New User**
- **Route**: `POST /api/auth/register`
- **Description**: Registers a new user by creating a record in the `User` schema.
- **Schema Interaction**:
  - Checks if the email already exists in the `User` collection.
  - Creates a new user with hashed password using the `User` schema.
- **Response**: Returns a JWT token in an HTTP-only cookie.

---

### **Login User**
- **Route**: `POST /api/auth/login`
- **Description**: Authenticates a user and issues a JWT token.
- **Schema Interaction**:
  - Finds the user by email in the `User` schema.
  - Verifies the password using the `comparePassword` method in the `User` schema.
- **Response**: Returns a JWT token in an HTTP-only cookie.

---

### **Logout User**
- **Route**: `POST /api/auth/logout`
- **Description**: Logs out the user by clearing the JWT cookie.
- **Schema Interaction**: None.
- **Response**: Clears the JWT cookie.

---

### **Get User Profile**
- **Route**: `GET /api/auth/profile`
- **Description**: Retrieves the authenticated user's profile.
- **Schema Interaction**:
  - Fetches the user details from the `User` schema using the user ID from the JWT token.
- **Response**: Returns the user's name and email.

---

## **User Routes**

### **Search Users**
- **Route**: `GET /api/users/search`
- **Description**: Searches for users by name or email.
- **Schema Interaction**:
  - Queries the `User` schema using a regex search on the `name` and `email` fields.
  - Excludes the current user from the results.
- **Response**: Returns a list of matching users.

---

## **Meeting Routes**

### **Create a New Meeting**
- **Route**: `POST /api/meetings`
- **Description**: Creates a new meeting and validates conflicts.
- **Schema Interaction**:
  - Creates a new meeting in the `Meeting` schema.
  - Validates attendee emails against the `User` schema.
  - Checks for scheduling conflicts using the `hasConflict` method in the `Meeting` schema.
- **Response**: Returns the created meeting.

---

### **Get All Meetings**
- **Route**: `GET /api/meetings`
- **Description**: Retrieves all meetings where the user is an organizer or attendee.
- **Schema Interaction**:
  - Queries the `Meeting` schema for meetings where the user is the organizer or an attendee.
  - Populates the `organizer` and `attendees` fields with user details from the `User` schema.
- **Response**: Returns a list of meetings.

---

### **Get Meeting by ID**
- **Route**: `GET /api/meetings/:id`
- **Description**: Retrieves a specific meeting by its ID.
- **Schema Interaction**:
  - Fetches the meeting from the `Meeting` schema by its ID.
  - Populates the `organizer` and `attendees` fields with user details from the `User` schema.
- **Response**: Returns the meeting details.

---

### **Update Meeting**
- **Route**: `PUT /api/meetings/:id`
- **Description**: Updates a meeting's details.
- **Schema Interaction**:
  - Updates the meeting in the `Meeting` schema.
  - Validates attendee emails against the `User` schema.
  - Checks for scheduling conflicts using the `hasConflict` method in the `Meeting` schema.
- **Response**: Returns the updated meeting.

---

### **Delete Meeting**
- **Route**: `DELETE /api/meetings/:id`
- **Description**: Deletes a meeting.
- **Schema Interaction**:
  - Deletes the meeting from the `Meeting` schema by its ID.
- **Response**: Confirms the deletion.

---

### **Respond to Meeting Invitation**
- **Route**: `PUT /api/meetings/:id/respond`
- **Description**: Updates the user's attendance status for a meeting.
- **Schema Interaction**:
  - Updates the `attendees` array in the `Meeting` schema with the user's response.
  - Checks for scheduling conflicts if the user accepts the invitation.
- **Response**: Returns the updated meeting.

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

---

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

## **Health Check Route**

### **Check Server Health**
- **Route**: `GET /api/health`
- **Description**: Verifies that the server is running.
- **Schema Interaction**: None.
- **Response**: Returns a status message.

---
