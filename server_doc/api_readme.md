# Woosh API Documentation

A comprehensive REST API for the Woosh sales management application, built with NestJS and TypeScript.

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Common Response Formats](#common-response-formats)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users-endpoints)
  - [Clients](#clients-endpoints)
  - [Products](#products-endpoints)
  - [Orders](#orders-endpoints)
  - [Journey Plans](#journey-plans-endpoints)
  - [Clock In/Out](#clock-in-out-endpoints)
  - [Targets](#targets-endpoints)
  - [Analytics](#analytics-endpoints)
  - [Reports](#reports-endpoints)
  - [Notices](#notices-endpoints)
  - [Payments](#payments-endpoints)
  - [Leave Management](#leave-management-endpoints)
  - [Tasks](#tasks-endpoints)
  - [Routes](#routes-endpoints)
  - [Uploads](#uploads-endpoints)
  - [Excel Import](#excel-import-endpoints)
  - [Version](#version-endpoints)
- [Data Models](#data-models)
- [Examples](#examples)

## Overview

The Woosh API is a RESTful service that provides endpoints for managing sales operations, including user authentication, client management, product catalog, order processing, journey planning, and analytics.

### Key Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different access levels for users
- **Geographic Filtering**: Country and region-based data filtering
- **Real-time Tracking**: Clock in/out and location tracking
- **File Uploads**: Support for images and documents
- **Analytics**: Comprehensive reporting and analytics
- **Mobile-first**: Optimized for mobile app integration

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

All endpoints are prefixed with `/api`.

## Authentication

The API uses JWT (JSON Web Token) for authentication. After successful login, include the JWT token in the Authorization header for all protected endpoints.

### Authentication Header

```http
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

JWT tokens expire after 9 hours. You'll need to re-authenticate when the token expires.

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## API Endpoints

### Authentication Endpoints

#### POST /auth/login
Authenticate a user with phone number and password.

**Request Body:**
```json
{
  "phoneNumber": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+254123456789",
    "role": "USER",
    "countryId": 1,
    "country": "Kenya"
  }
}
```

#### GET /auth/profile
Get the current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+254123456789",
  "role": "USER",
  "countryId": 1,
  "country": "Kenya"
}
```

#### POST /auth/logout
Logout the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Users Endpoints

All user endpoints require authentication.

#### GET /users
Get all active users.

**Headers:** `Authorization: Bearer <token>`

#### GET /users/:id
Get a specific user by ID.

#### GET /users/profile
Get the current user's detailed profile.

#### POST /users
Create a new user.

#### PATCH /users/:id
Update user information.

#### DELETE /users/:id
Soft delete a user.

### Clients Endpoints

All client endpoints require authentication and are filtered by user's country.

#### GET /clients
Get all active clients for the user's country.

**Headers:** `Authorization: Bearer <token>`

#### GET /clients/basic
Get basic client information (optimized for mobile).

#### GET /clients/search
Search clients with filters.

**Query Parameters:**
- `name` (string): Client name
- `region` (string): Region name
- `contact` (string): Contact information
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

#### GET /clients/:id
Get a specific client by ID.

#### GET /clients/:id/basic
Get basic client information by ID.

#### POST /clients
Create a new client.

**Request Body:**
```json
{
  "name": "Client Name",
  "address": "Client Address",
  "latitude": -1.2921,
  "longitude": 36.8219,
  "balance": 0.00,
  "email": "client@example.com",
  "regionId": 1,
  "region": "Nairobi",
  "routeId": 1,
  "routeName": "Route A",
  "contact": "+254123456789",
  "taxPin": "P051234567A",
  "location": "Nairobi, Kenya",
  "clientType": 1,
  "outletAccount": 1,
  "countryId": 1
}
```

#### PATCH /clients/:id
Update client information.

#### GET /clients/country/:countryId
Get clients by country.

#### GET /clients/region/:regionId
Get clients by region.

#### GET /clients/route/:routeId
Get clients by route.

#### GET /clients/location/nearby
Find clients by location.

**Query Parameters:**
- `latitude` (number): Latitude coordinate
- `longitude` (number): Longitude coordinate
- `radius` (number): Search radius in kilometers (default: 10)

#### GET /clients/stats/overview
Get client statistics.

**Query Parameters:**
- `regionId` (number, optional): Filter by region

### Products Endpoints

#### GET /products
Get all products (public endpoint).

#### GET /products/:id
Get a specific product by ID.

#### GET /products/country/:countryId
Get products filtered by country.

**Headers:** `Authorization: Bearer <token>`

### Orders Endpoints

All order endpoints require authentication.

#### GET /orders
Get all orders for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Order status filter
- `clientId` (number): Filter by client ID
- `startDate` (string): Start date filter (ISO format)
- `endDate` (string): End date filter (ISO format)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

#### GET /orders/:id
Get a specific order by ID.

#### POST /orders
Create a new order.

**Request Body:**
```json
{
  "clientId": 1,
  "orderDate": "2024-01-15T10:00:00Z",
  "expectedDeliveryDate": "2024-01-20T10:00:00Z",
  "notes": "Special delivery instructions",
  "orderItems": [
    {
      "productId": 1,
      "quantity": 10,
      "unitPrice": 25.50,
      "taxAmount": 2.55,
      "totalPrice": 255.00
    }
  ]
}
```

#### PATCH /orders/:id
Update an existing order.

#### DELETE /orders/:id
Delete an order.

### Journey Plans Endpoints

All journey plan endpoints require authentication.

#### GET /journey-plans
Get all journey plans for the authenticated user.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Status filter
- `timezone` (string): Timezone (default: "Africa/Nairobi")
- `date` (string): Specific date filter

#### GET /journey-plans/by-date
Get journey plans by date range.

**Query Parameters:**
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)
- `status` (string): Status filter
- `timezone` (string): Timezone

#### GET /journey-plans/:id
Get a specific journey plan by ID.

#### POST /journey-plans
Create a new journey plan.

#### PUT /journey-plans/:id
Update a journey plan.

#### DELETE /journey-plans/:id
Delete a journey plan.

#### POST /journey-plans/:id/checkout
Check out from a journey plan.

**Request Body:**
```json
{
  "checkoutTime": "2024-01-15T17:00:00Z",
  "checkoutLatitude": -1.2921,
  "checkoutLongitude": 36.8219
}
```

### Clock In/Out Endpoints

All clock in/out endpoints require authentication.

#### POST /clock-in-out/clock-in
Clock in to start a work session.

**Request Body:**
```json
{
  "userId": 1,
  "clockInTime": "2024-01-15T08:00:00Z",
  "latitude": -1.2921,
  "longitude": 36.8219,
  "location": "Nairobi Office"
}
```

#### POST /clock-in-out/clock-out
Clock out to end a work session.

**Request Body:**
```json
{
  "userId": 1,
  "clockOutTime": "2024-01-15T17:00:00Z",
  "latitude": -1.2921,
  "longitude": 36.8219,
  "location": "Client Location"
}
```

#### GET /clock-in-out/status/:userId
Get current clock status for a user.

#### GET /clock-in-out/today/:userId
Get today's clock sessions for a user.

#### GET /clock-in-out/history/:userId
Get clock history for a user.

**Query Parameters:**
- `startDate` (string): Start date filter
- `endDate` (string): End date filter

#### POST /clock-in-out/force-clockout/:userId
Force clock out a user (admin function).

#### GET /clock-in-out/active-sessions-count
Get count of active sessions.

### Targets Endpoints

All target endpoints require authentication.

#### GET /targets/monthly-visits/:userId
Get monthly visit targets for a user.

#### GET /targets/dashboard/:userId
Get dashboard data for a user.

**Query Parameters:**
- `period` (string): Time period (default: "current_month")

#### GET /targets/visit-statistics/:userId
Get visit statistics for a user.

#### GET /targets/check-journey-data/:userId
Check journey data for a user.

### Analytics Endpoints

All analytics endpoints require authentication.

#### GET /analytics
Get analytics data with query filters.

#### GET /analytics/:id
Get specific analytics record.

#### POST /analytics
Create analytics record.

#### PUT /analytics/:id
Update analytics record.

#### DELETE /analytics/:id
Delete analytics record.

#### GET /analytics/daily-login-hours/:userId
Get daily login hours for a user.

#### GET /analytics/daily-journey-visits/:userId
Get daily journey visits for a user.

### Reports Endpoints

All report endpoints require authentication.

#### POST /reports
Submit a new report.

**Request Body:**
```json
{
  "type": "client_visit",
  "journeyPlanId": 1,
  "userId": 1,
  "clientId": 1,
  "data": {
    "visitDuration": 30,
    "notes": "Successful client meeting"
  }
}
```

#### GET /reports
Get all reports.

#### GET /reports/journey-plan/:journeyPlanId
Get reports for a specific journey plan.

### Notices Endpoints

All notice endpoints require authentication.

#### GET /notices
Get all notices.

**Query Parameters:**
- `countryId` (number, optional): Filter by country

#### GET /notices/admin
Get all notices (admin view).

#### GET /notices/:id
Get a specific notice by ID.

#### POST /notices
Create a new notice.

#### PATCH /notices/:id
Update a notice.

#### DELETE /notices/:id
Delete a notice.

### Payments Endpoints

All payment endpoints require authentication and use the `/outlets` prefix.

#### GET /outlets/:clientId/payments
Get all payments for a specific client.

#### POST /outlets/:clientId/payments
Upload a new payment with invoice image.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `amount` (number): Payment amount
- `method` (string): Payment method
- `image` (file): Invoice image file

#### GET /outlets/payments/salesrep/:salesrepId
Get all payments for a specific sales representative.

### Leave Management Endpoints

All leave endpoints require authentication.

#### GET /leave/types/all
Get all available leave types.

#### GET /leave/balance/user
Get leave balance for the authenticated user.

#### GET /leave
Get leave requests.

**Query Parameters:**
- `userId` (number, optional): Filter by user ID

#### GET /leave/:id
Get a specific leave request by ID.

#### POST /leave
Create a new leave request.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `userId` (number): User ID
- `leaveType` (string): Type of leave
- `startDate` (string): Start date
- `endDate` (string): End date
- `reason` (string): Reason for leave
- `attachment` (file, optional): Supporting document

#### PUT /leave/:id
Update a leave request.

#### DELETE /leave/:id
Delete a leave request.

### Tasks Endpoints

All task endpoints require authentication.

#### GET /tasks
Get all tasks.

**Query Parameters:**
- `userId` (number, optional): Filter by user ID
- `status` (string, optional): Filter by status

#### GET /tasks/:id
Get a specific task by ID.

#### POST /tasks
Create a new task.

#### PUT /tasks/:id
Update a task.

#### PATCH /tasks/:id/status
Update task status only.

**Request Body:**
```json
{
  "status": "completed"
}
```

#### POST /tasks/:id/complete
Mark a task as complete.

#### DELETE /tasks/:id
Delete a task.

### Routes Endpoints

All route endpoints require authentication.

#### GET /routes
Get all routes for the user's country.

#### GET /routes/active
Get all active routes for the user's country.

#### GET /routes/:id
Get a specific route by ID.

#### GET /routes/region/:regionId
Get routes by region.

#### GET /routes/country/:countryId
Get routes by country.

#### GET /routes/leader/:leaderId
Get routes by team leader.

### Uploads Endpoints

All upload endpoints require authentication.

#### GET /uploads
Get all uploads.

#### GET /uploads/:id
Get a specific upload by ID.

#### POST /uploads/upload
Upload a file.

**Content-Type:** `multipart/form-data`

#### POST /uploads
Create upload record.

#### PUT /uploads/:id
Update upload information.

#### DELETE /uploads/:id
Delete an upload.

### Excel Import Endpoints

All excel import endpoints require authentication.

#### GET /excel-import
Get all import records.

#### GET /excel-import/:id
Get a specific import record.

#### POST /excel-import/upload
Upload and process an Excel file.

**Content-Type:** `multipart/form-data`

#### POST /excel-import
Create import record.

#### PUT /excel-import/:id
Update import record.

#### DELETE /excel-import/:id
Delete import record.

### Version Endpoints

#### GET /version
Get current API version (public endpoint).

#### POST /version
Create a new version record.

### Health Check Endpoints

#### GET /health/products
Check database connectivity and product service health.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Data Models

### User (SalesRep)
```typescript
{
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  countryId: number;
  country: string;
  region_id: number;
  region: string;
  route_id: number;
  route: string;
  role: string;
  status: number;
  visits_targets: number;
  new_clients: number;
  vapes_targets: number;
  pouches_targets: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Client
```typescript
{
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  balance: number;
  email: string;
  region_id: number;
  region: string;
  route_id: number;
  route_name: string;
  contact: string;
  tax_pin: string;
  location: string;
  status: number;
  client_type: number;
  outlet_account: number;
  countryId: number;
  added_by: number;
  created_at: Date;
}
```

### Product
```typescript
{
  id: number;
  name: string;
  category_id: number;
  category: string;
  unit_cost: number;
  description: string;
  currentStock: number;
  clientId: number;
  image: string;
  unit_cost_ngn: number;
  unit_cost_tzs: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order
```typescript
{
  id: number;
  soNumber: string;
  clientId: number;
  orderDate: Date;
  expectedDeliveryDate: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  netPrice: number;
  notes: string;
  status: string;
  salesrep: number;
  orderItems: OrderItem[];
}
```

### OrderItem
```typescript
{
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  totalPrice: number;
  taxType: string;
  netPrice: number;
  shippedQuantity: number;
}
```

## Examples

### Complete Authentication Flow

1. **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneNumber": "+254123456789",
  "password": "securepassword123"
}
```

2. **Use Token for Subsequent Requests**
```http
GET /api/clients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Creating an Order

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": 1,
  "orderDate": "2024-01-15T10:00:00Z",
  "expectedDeliveryDate": "2024-01-20T10:00:00Z",
  "notes": "Urgent delivery required",
  "orderItems": [
    {
      "productId": 1,
      "quantity": 10,
      "unitPrice": 25.50
    },
    {
      "productId": 2,
      "quantity": 5,
      "unitPrice": 15.00
    }
  ]
}
```

### Uploading Payment with Invoice

```http
POST /api/outlets/123/payments
Authorization: Bearer <token>
Content-Type: multipart/form-data

amount: 1500.00
method: cash
image: [invoice-image.jpg]
```

### Searching Clients

```http
GET /api/clients/search?name=John&region=Nairobi&page=1&limit=10
Authorization: Bearer <token>
```

### Clock In

```http
POST /api/clock-in-out/clock-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "clockInTime": "2024-01-15T08:00:00Z",
  "latitude": -1.2921,
  "longitude": 36.8219,
  "location": "Nairobi Office"
}
```

## Rate Limiting

Currently, there are no rate limits implemented, but it's recommended to implement them for production use.

## CORS Configuration

The API supports CORS and is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:8080`
- `capacitor://localhost` (for mobile apps)

## File Upload Support

The API supports file uploads for:
- Payment invoices (images)
- Leave attachments (documents)
- General file uploads
- Excel imports

Supported formats: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX

Maximum file size: 10MB per file

## Database

The API uses MySQL database with the `citlogis_ws` schema. All operations are performed directly against the database with TypeORM as the ORM.

## Environment Configuration

Required environment variables:

```env
# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=citlogis_ws

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=9h

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application
PORT=3000
NODE_ENV=production
```

## Support

For API support and questions, contact the development team or refer to the source code documentation.

---

*Last updated: January 2024*
*API Version: 1.0.0*