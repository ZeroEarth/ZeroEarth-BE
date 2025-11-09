# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start application**: `npm start` (runs `node src/app.js`)
- **Docker development**: `docker-compose up --build` (recommended for full stack with PostgreSQL)
- **Health check**: Visit `/health` endpoint to verify API status

## Architecture Overview

This is a Node.js Express API for a community management platform called "Chow" that manages farmers, camp leads, manufacturers, and offset verification processes.

### Core Structure
- **MVC Pattern**: Controllers → Services → Repositories → Database
- **API Versioning**: Routes organized under `/api/v1/`
- **Authentication**: JWT-based with role-based access control (farmer, camp_lead, manufacturer, auditor, admin)
- **Database**: PostgreSQL with predefined schema in `dbschema.sql`

### Key Components
- **Authentication**: JWT middleware with role-based authorization
- **File Upload**: Azure Blob Storage integration for file management
- **Cron Jobs**: Daily community message automation (12:00 AM IST)
- **Validation**: Joi schema validation for request data

### Route Structure
- `/api/v1/auth` - Authentication endpoints (login, registration)
- `/api/v1/community` - Community management (requires authentication)
- `/api/v1/manufacturers` - Manufacturer operations (requires authentication) 
- `/api/v1/admin` - Admin-specific endpoints (requires authentication)
- `/api/v1/generate-upload-url` - File upload URL generation

### Database Design
Key entities: `users`, `farmers`, `camp_leads`, `manufacturers`, `communities`, `cattle`, `batches`, `messages`
- Users have roles that reference specific entity tables via `ref_id`
- Communities are managed by camp leads and associated with manufacturers
- Supports cattle management with feed tracking and batch operations

### Environment Configuration
Requires `.env` file with:
- PostgreSQL connection details
- JWT secret
- Azure Storage credentials
- Feed quantity/timing configurations
- Default password and salt rounds

### Error Handling
- Global error middleware with standardized JSON responses
- 404 handler for unmatched routes
- Custom error utilities in `src/utils/customError.js`