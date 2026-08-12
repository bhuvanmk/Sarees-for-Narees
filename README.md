# Sarees For Naaris - Authentication System

This is the production-ready, SaaS-standard authentication module for **Sarees For Naaris**, built with a Spring Boot backend, React frontend, and MySQL database. It features a premium minimalist UI with a Royal Saree & Gold-accented Glassmorphism authentication design.

## Features Scope
1. **User Registration:** Creates an unverified user and generates/logs a registration OTP.
2. **OTP Verification System:** Enforces OTP validation before activating accounts or allowing password resets.
3. **User Login / Logout:** Validates credentials and verifies account activation status. Generates access (JWT) and refresh tokens.
4. **Forgot & Reset Password Flows:** Multi-step OTP verification to securely reset password.
5. **Change Password (Authenticated):** Updates user password securely while logged in.
6. **JWT Token Rotation:** Automatic access token refresh using refresh tokens upon expiry.
7. **Session Management:** Secure logout invalidates refresh tokens on the server.
8. **Protected Dashboard Route:** Displays a personalized welcome message for the logged-in user.

---

## Technical Stack & Ports
- **Frontend:** React (Vite) + Vanilla CSS (Glassmorphism layout) -> `http://localhost:5173`
- **Backend:** Spring Boot (Spring Security + JWT + JPA) -> `http://localhost:8080`
- **Database:** MySQL -> `localhost:3306` (database: `my_ecommerce`)

---

## Asset Handling
The branding assets (`bg.jpeg` and `brand_logo.png`) have been copied directly to the frontend's `public/` directory:
- `frontend/public/bg.jpeg`
- `frontend/public/brand_logo.png`

They are referenced in code via absolute paths `/bg.jpeg` and `/brand_logo.png`. This setup ensures zero compile-time or build-time resolution issues and supports fast loading.

---

## Setup Instructions

### 1. Database Configuration
Run the schema migration SQL script to update your existing database:
```bash
# From the root of the project
mysql -u root -p970Teja@ my_ecommerce < schema.sql
```
*Note: This alters the `users` table to add `is_verified` (BOOLEAN) and updates `password` column length to `VARCHAR(255)` to accommodate BCrypt hashes, and creates `otp_verification`, `password_reset_tokens`, and `refresh_tokens` tables.*

### 2. Backend Setup
1. Copy `backend/.env.example` to `backend/.env` (or configure your shell environment variables).
2. Start the Spring Boot backend server:
```bash
cd backend
mvn spring-boot:run
```
*The backend server will run on `http://localhost:8080`.*

### 3. Frontend Setup
1. Install dependencies and start the React dev server:
```bash
cd frontend
npm install
npm run dev
```
*The React application will open on `http://localhost:5173`.*

---

## Verification & Testing Log
The OTP code is printed directly to the backend server terminal console logs for testing convenience. Locate the:
```text
==================================================
OTP CODE GENERATED FOR: user@example.com
PURPOSE: REGISTRATION
CODE: XXXXXX
==================================================
```
And enter this code on the OTP Verification screen to activate the registered account.
