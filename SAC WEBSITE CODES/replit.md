# Referral System Application

## Overview

This is a full-stack referral program application built for an air conditioning service company. The system allows users to create accounts, refer others, track their referrals, manage bank details for payouts, and includes an admin dashboard for managing the entire referral program. The application is built with a React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy using session-based auth
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **Password Security**: Node.js crypto module with scrypt hashing
- **API Design**: RESTful endpoints with JSON responses
- **Development Server**: tsx for TypeScript execution

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: @neondatabase/serverless with connection pooling

## Key Components

### Database Schema
- **Users Table**: Stores user information including referral codes and admin status
- **Bank Details Table**: User banking information for payouts
- **Referrals Table**: Tracks referral relationships and status
- **Payouts Table**: Records of payout transactions

### Authentication System
- Session-based authentication using Passport.js
- Secure password hashing with scrypt and salt
- Protected routes with middleware validation
- Admin role-based access control

### Referral System
- Unique referral codes for each user
- Tracking of referral status (pending, completed, cancelled)
- Configurable reward amounts (default ₹400)
- Referral link generation with query parameters

### Admin Dashboard
- Overview statistics and metrics
- Referral management with status updates
- Payout processing and tracking
- User management capabilities

### UI Components
- Responsive design with mobile-first approach
- Consistent component library using shadcn/ui
- Form validation with real-time feedback
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

1. **User Registration**: New users register with optional referral codes
2. **Referral Creation**: Users can refer others via email/name input
3. **Referral Tracking**: System tracks referral status and completion
4. **Bank Details**: Users provide banking information for payouts
5. **Payout Processing**: Admins process payouts for completed referrals
6. **Admin Management**: Admins monitor and manage the entire system

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI components (Radix UI primitives, Lucide icons)
- Form handling (React Hook Form, Zod validation)
- Routing (Wouter)
- Styling (Tailwind CSS, class-variance-authority)

### Backend Dependencies
- Express.js server framework
- Passport.js authentication
- Drizzle ORM for database operations
- Session management (express-session, connect-pg-simple)
- Development tools (tsx, esbuild)

### Database
- PostgreSQL (Neon serverless hosting)
- Connection pooling and WebSocket support

## Deployment Strategy

The application is configured for deployment on Replit with autoscaling:

- **Development**: `npm run dev` runs both frontend and backend concurrently
- **Build Process**: Vite builds frontend assets, esbuild bundles backend
- **Production**: Node.js serves the bundled application
- **Port Configuration**: Backend runs on port 5000, mapped to external port 80
- **Environment**: Requires DATABASE_URL and SESSION_SECRET environment variables

### Build Configuration
- Frontend builds to `dist/public` directory
- Backend builds to `dist/index.js`
- Static file serving for production
- Development includes HMR and error overlays

## Changelog
- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.