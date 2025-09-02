# Authentication System

## Overview
This ministry management system uses NextAuth.js v5 with credentials provider for secure user authentication.

## Features
- ✅ Email/password authentication
- ✅ Secure password hashing with bcryptjs
- ✅ Session management
- ✅ Role-based access control support
- ✅ Form validation
- ✅ Error handling
- ✅ Responsive design

## Setup

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
AUTH_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Database
Ensure your database has the User model with password field:
```prisma
model User {
  id            String          @id @default(cuid())
  name          String?
  email         String?         @unique
  password      String?
  // ... other fields
}
```

## Usage

### Login
- Navigate to `/signin`
- Enter email and password
- Successful login redirects to `/dashboard`

### Creating Users
Use the signup API endpoint:
```bash
POST /api/auth/signup
{
  "name": "User Name",
  "email": "user@example.com", 
  "password": "password123",
  "confirmPassword": "password123"
}
```

## Files
- `app/components/login/loginForm.tsx` - Login form component
- `app/authentication/auth.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
- `app/api/auth/signup/route.ts` - User registration API

## Security
- Passwords are hashed using bcryptjs
- Environment variables for secrets
- Input validation and sanitization
- Error handling without exposing sensitive information
