# Woosh API Quick Reference

A quick reference guide for the most commonly used Woosh API endpoints.

## Base URL
```
https://your-domain.com/api
```

## Authentication
```http
Authorization: Bearer <jwt-token>
```

## Quick Start
1. Login: `POST /auth/login`
2. Get profile: `GET /auth/profile`
3. Use token in all subsequent requests

## Most Used Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | Login with phone & password | ❌ |
| `GET` | `/auth/profile` | Get current user profile | ✅ |
| `POST` | `/auth/logout` | Logout current user | ✅ |

### 👥 Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users` | Get all users | ✅ |
| `GET` | `/users/profile` | Get detailed profile | ✅ |
| `GET` | `/users/:id` | Get user by ID | ✅ |

### 🏢 Clients
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/clients` | Get all clients | ✅ |
| `GET` | `/clients/search` | Search clients | ✅ |
| `GET` | `/clients/:id` | Get client by ID | ✅ |
| `POST` | `/clients` | Create new client | ✅ |
| `PATCH` | `/clients/:id` | Update client | ✅ |
| `GET` | `/clients/location/nearby` | Find nearby clients | ✅ |
| `GET` | `/clients/stats/overview` | Get client statistics | ✅ |

### 📦 Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/products` | Get all products | ❌ |
| `GET` | `/products/:id` | Get product by ID | ❌ |
| `GET` | `/products/country/:countryId` | Get products by country | ✅ |

### 📋 Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/orders` | Get user's orders | ✅ |
| `GET` | `/orders/:id` | Get order by ID | ✅ |
| `POST` | `/orders` | Create new order | ✅ |
| `PATCH` | `/orders/:id` | Update order | ✅ |

### 🗺️ Journey Plans
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/journey-plans` | Get journey plans | ✅ |
| `GET` | `/journey-plans/by-date` | Get plans by date range | ✅ |
| `POST` | `/journey-plans` | Create journey plan | ✅ |
| `POST` | `/journey-plans/:id/checkout` | Checkout from plan | ✅ |

### ⏰ Clock In/Out
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/clock-in-out/clock-in` | Clock in | ✅ |
| `POST` | `/clock-in-out/clock-out` | Clock out | ✅ |
| `GET` | `/clock-in-out/status/:userId` | Get clock status | ✅ |
| `GET` | `/clock-in-out/today/:userId` | Get today's sessions | ✅ |
| `GET` | `/clock-in-out/history/:userId` | Get clock history | ✅ |

### 💰 Payments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/outlets/:clientId/payments` | Get client payments | ✅ |
| `POST` | `/outlets/:clientId/payments` | Upload payment + invoice | ✅ |
| `GET` | `/outlets/payments/salesrep/:salesrepId` | Get sales rep payments | ✅ |

### 🎯 Targets & Analytics
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/targets/dashboard/:userId` | Get user dashboard | ✅ |
| `GET` | `/targets/monthly-visits/:userId` | Get monthly visits | ✅ |
| `GET` | `/analytics/daily-login-hours/:userId` | Get daily login hours | ✅ |

### 📝 Reports & Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/reports` | Submit report | ✅ |
| `GET` | `/reports/journey-plan/:id` | Get reports by journey plan | ✅ |
| `GET` | `/tasks` | Get tasks | ✅ |
| `POST` | `/tasks/:id/complete` | Complete task | ✅ |

### 🏖️ Leave Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/leave/types/all` | Get leave types | ✅ |
| `GET` | `/leave/balance/user` | Get leave balance | ✅ |
| `POST` | `/leave` | Submit leave request | ✅ |

## Common Request Examples

### Login
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+254123456789", "password": "password123"}'
```

### Get Clients
```bash
curl -X GET https://your-domain.com/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Search Clients
```bash
curl -X GET "https://your-domain.com/api/clients/search?name=John&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Order
```bash
curl -X POST https://your-domain.com/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "orderItems": [
      {
        "productId": 1,
        "quantity": 10,
        "unitPrice": 25.50
      }
    ]
  }'
```

### Clock In
```bash
curl -X POST https://your-domain.com/api/clock-in-out/clock-in \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "clockInTime": "2024-01-15T08:00:00Z",
    "latitude": -1.2921,
    "longitude": 36.8219,
    "location": "Office"
  }'
```

### Upload Payment
```bash
curl -X POST https://your-domain.com/api/outlets/1/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "amount=1500.00" \
  -F "method=cash" \
  -F "image=@invoice.jpg"
```

### Find Nearby Clients
```bash
curl -X GET "https://your-domain.com/api/clients/location/nearby?latitude=-1.2921&longitude=36.8219&radius=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
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

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Common Query Parameters

### Pagination
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

### Date Filters
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)
- `date` (string): Specific date (ISO format)

### Location Filters
- `latitude` (number): Latitude coordinate
- `longitude` (number): Longitude coordinate
- `radius` (number): Search radius in km

### Geographic Filters
- `countryId` (number): Filter by country
- `regionId` (number): Filter by region
- `routeId` (number): Filter by route

## Status Codes
- `200` ✅ Success
- `201` ✅ Created
- `400` ❌ Bad Request
- `401` ❌ Unauthorized (login required)
- `403` ❌ Forbidden (insufficient permissions)
- `404` ❌ Not Found
- `500` ❌ Server Error

## Data Validation Rules

### Phone Numbers
- Format: `+[country_code][number]`
- Pattern: Numbers, spaces, hyphens, parentheses, plus signs only
- Example: `+254123456789`

### Coordinates
- Latitude: `-90` to `90`
- Longitude: `-180` to `180`
- Precision: Up to 6 decimal places

### Dates
- Format: ISO 8601 (`2024-01-15T10:00:00Z`)
- Timezone: UTC recommended

### File Uploads
- Max size: 10MB
- Supported formats: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX
- Use `multipart/form-data` content type

## Environment Variables

### Required
```env
DB_HOST=your-db-host
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=citlogis_ws
JWT_SECRET=your-jwt-secret
```

### Optional
```env
PORT=3000
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Testing Tools

### Postman Collection
Import `Woosh_API.postman_collection.json` into Postman for easy testing.

### Health Check
```bash
curl https://your-domain.com/api/health/products
```

## Support

- 📖 Full Documentation: `API_DOCUMENTATION.md`
- 🔧 Integration Guide: `INTEGRATION_GUIDE.md`
- 📮 Postman Collection: `Woosh_API.postman_collection.json`

---

*Quick Reference Version: 1.0.0*