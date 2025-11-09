# Technical Architecture Document
## Chow Backend API - ZeroEarth Community Management Platform

### Overview
The Chow Backend API is a Node.js Express application designed for community management in the carbon offset verification ecosystem. It manages farmers, camp leads, manufacturers, and offset verification processes through a comprehensive REST API.

---

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │────│   Express API    │────│   PostgreSQL    │
│                 │    │   (Node.js)      │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │  Azure Blob      │
                       │  Storage         │
                       └──────────────────┘
```

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL with pg driver
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Azure Blob Storage
- **Validation**: Joi schema validation
- **Scheduled Tasks**: node-cron
- **Password Hashing**: bcrypt
- **Export Functionality**: ExcelJS
- **Request Logging**: Morgan

---

## Application Structure

### MVC Architecture Pattern
```
src/
├── app.js                 # Application entry point
├── config/                # Configuration files
├── controllers/           # Request handlers
├── middlewares/           # Authentication, validation, authorization
├── repositories/          # Data access layer
├── routes/               # API route definitions
├── services/             # Business logic layer
├── utils/                # Utility functions
├── validations/          # Joi schemas
└── seed_data/            # Database seed files
```

### Layer Responsibilities

#### 1. **Controllers Layer**
- Handle HTTP requests and responses
- Input validation coordination
- Error handling and response formatting
- Files: `authController.js`, `adminController.js`, `communityMgtController.js`, etc.

#### 2. **Services Layer**
- Business logic implementation
- Transaction management
- Data processing and transformation
- Integration with external services (Azure Blob Storage)
- Files: `authService.js`, `adminService.js`, `communityMgtService.js`, etc.

#### 3. **Repository Layer**
- Database queries and operations
- Data persistence logic
- Query optimization
- Files: `authRepository.js`, `adminRepository.js`, etc.

#### 4. **Middleware Layer**
- Authentication (`authMiddleware.js`)
- Authorization with role-based access (`authorizeMiddleware.js`)
- Community access validation (`communityAccessMiddleware.js`)
- Input validation (`validationMiddleware.js`)

---

## Database Architecture

### Core Entities

#### User Management
- **users**: Central user table with role-based design
- **farmers**: Farmer-specific information
- **camp_leads**: Camp lead details and community assignments
- **manufacturers**: Manufacturing entity data
- **admins**: Administrative user data

#### Community Management
- **communities**: Community groupings managed by camp leads
- **messages**: Communication system between stakeholders
- **feed_receipt_confirmations**: Feed delivery confirmations
- **daily_feed_confirmations**: Daily feeding confirmations

#### Carbon Offset System
- **fractional_offsets**: Detailed carbon offset tracking records
- **offsets**: Main offset records
- **potential_offsets**: Geographic potential offset data
- **camp_lead_visits**: Verification visits by camp leads

#### Manufacturing & Distribution
- **batches**: Feed batch production records
- **batch_acknowledgements**: Batch receipt confirmations
- **feed_distribution**: Feed distribution tracking

### Database Relationships
```
manufacturers (1) ──── (n) camp_leads
camp_leads (1) ──── (n) communities  
communities (1) ──── (n) farmers
farmers (1) ──── (n) fractional_offsets
batches (1) ──── (n) feed_distribution
```

### Key Design Patterns
- **Reference ID Pattern**: Users table uses `ref_id` to point to role-specific tables
- **Audit Trail**: `created_at` timestamps on all entities
- **Enumerated Types**: PostgreSQL ENUMs for roles, message types, etc.

---

## API Architecture

### Versioning Strategy
- API versioned under `/api/v1/` prefix
- RESTful resource-based endpoints
- Consistent response formatting

### Route Organization
```
/api/v1/
├── auth/                      # Authentication endpoints
├── community/                 # Community management (protected)
├── manufacturers/             # Manufacturer operations (protected)
├── admin/                     # Administrative functions (protected)
└── generate-upload-url        # File upload URL generation
```

### Authentication & Authorization Flow
```
1. Client sends login credentials
2. Server validates against database
3. JWT token generated and returned
4. Subsequent requests include JWT in Authorization header
5. authMiddleware validates token and extracts user info
6. authorizeMiddleware checks role permissions
7. communityAccessMiddleware validates community access (where applicable)
```

### Role-Based Access Control
- **farmer**: Limited to own data and community interactions
- **camp_lead**: Community management, farmer onboarding, feed distribution
- **manufacturer**: Batch creation and management
- **auditor**: Offset verification and validation
- **admin**: Full system access, user management, reporting

---

## Key Features & Components

### 1. Authentication System
- JWT-based authentication with configurable expiration
- Role-based authorization with granular permissions
- Mobile number as primary identifier
- Secure password hashing with bcrypt
- Terms and conditions acceptance tracking

### 2. Community Management
- Farmer onboarding and profile management
- Camp lead assignment and community creation
- Feed distribution tracking and confirmation
- Real-time messaging system between stakeholders

### 3. Manufacturing & Batch Management
- Feed batch production tracking
- Quality assurance and batch verification
- Distribution chain management
- Acknowledgment and confirmation workflows

### 4. Carbon Offset Verification
- Fractional offset calculation and tracking
- GPS-based verification with location validation
- Audit trail for all verification activities
- Export capabilities for regulatory reporting

### 5. Administrative Dashboard
- User management across all roles
- Analytics and reporting dashboards
- Data export functionality (Excel format)
- System monitoring and health checks

### 6. File Management
- Azure Blob Storage integration
- Secure file upload URL generation
- Image handling for verification processes
- Scalable storage solution

### 7. Automated Processes
- Daily cron jobs for community message automation
- Scheduled at 12:00 AM IST using node-cron
- Automated data processing and notifications

---

## Security Architecture

### Authentication Security
- JWT tokens with secure secret keys
- Token-based stateless authentication
- Role-based access control enforcement

### Data Security
- Input validation using Joi schemas
- SQL injection prevention through parameterized queries
- Password hashing with bcrypt salt rounds

### API Security
- CORS configuration for cross-origin requests
- Request size limits (50MB for file uploads)
- Morgan logging for request monitoring
- Global error handling with sanitized responses

---

## Performance & Scalability

### Database Optimization
- Connection pooling with pg Pool
- Indexed columns for frequently queried fields
- Efficient query patterns in repositories

### Application Performance
- Stateless architecture enabling horizontal scaling
- Efficient data transfer with JSON responses
- Bulk operations for data export functionality

### File Storage
- Cloud-based Azure Blob Storage for scalability
- Efficient file upload mechanism with presigned URLs

---

## Environment Configuration

### Required Environment Variables
```
# Database Configuration
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DATABASE

# JWT Configuration  
JWT_SECRET

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, AZURE_STORAGE_CONTAINER_NAME

# Application Configuration
PORT, DEFAULT_PASSWORD, SALT_ROUNDS

# Feed Configuration
FEED_QUANTITY_MORNING, FEED_QUANTITY_EVENING, FEED_TIMING_MORNING, FEED_TIMING_EVENING
```

### Deployment Configuration
- Docker containerization support
- Docker Compose for development environment
- Health check endpoint at `/health`
- Configurable server port (default from environment)

---

## Error Handling & Logging

### Error Architecture
- Global error handling middleware
- Custom error utility for consistent error responses
- HTTP status code standardization
- Sanitized error responses to prevent information leakage

### Logging Strategy
- Morgan middleware for HTTP request logging
- Console logging for cron job monitoring
- Error logging with context information
- Development-friendly log formatting

---

## Integration Points

### External Services
- **Azure Blob Storage**: File upload and storage
- **PostgreSQL Database**: Primary data persistence
- **JWT Service**: Token generation and validation

### Internal Integrations
- Service-to-service communication through dependency injection
- Repository pattern for data access abstraction
- Middleware pipeline for request processing

---

## Development & Deployment

### Development Setup
```bash
npm install
docker-compose up --build  # Recommended with PostgreSQL
npm start                  # Direct Node.js execution
```

### API Testing
- Health check: `GET /health`
- All endpoints require proper authentication except `/auth/login`
- Comprehensive validation on all input data

### Database Management
- Schema definition in `dbschema.sql`
- Seed data available in `src/seed_data/`
- Migration strategy through SQL scripts

---

## Monitoring & Maintenance

### Health Monitoring
- Application health endpoint with timestamp
- Database connection monitoring through connection pool
- Cron job execution logging

### Data Management
- Regular database backups recommended
- Audit trail through created_at timestamps
- Data export capabilities for compliance

### Performance Monitoring
- Request logging through Morgan
- Error tracking and reporting
- Resource usage monitoring recommended for production

---

This architecture provides a robust, scalable foundation for the carbon offset verification platform, with clear separation of concerns, comprehensive security measures, and efficient data management capabilities.