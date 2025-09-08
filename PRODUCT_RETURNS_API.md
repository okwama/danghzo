# Product Returns API Documentation

## Overview
The Product Returns API allows sales representatives to create, manage, and track product returns with clients.

## Database Schema
```sql
CREATE TABLE `product_returns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `salesrepId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('pending','approved','rejected','processed') DEFAULT 'pending',
  `imageUrl` varchar(500) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
);
```

## API Endpoints

### 1. Create Product Return
**POST** `/product-returns`

**Request Body:**
```json
{
  "salesrepId": 1,
  "productId": 5,
  "qty": 10,
  "clientId": 3,
  "date": "2024-01-15",
  "imageUrl": "https://example.com/return-photo.jpg",
  "reason": "Damaged goods",
  "notes": "Customer reported damaged packaging"
}
```

**Response:**
```json
{
  "id": 1,
  "salesrepId": 1,
  "productId": 5,
  "qty": 10,
  "clientId": 3,
  "date": "2024-01-15",
  "status": "pending",
  "imageUrl": "https://example.com/return-photo.jpg",
  "reason": "Damaged goods",
  "notes": "Customer reported damaged packaging",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get All Product Returns
**GET** `/product-returns`

**Response:**
```json
[
  {
    "id": 1,
    "salesrepId": 1,
    "productId": 5,
    "qty": 10,
    "clientId": 3,
    "date": "2024-01-15",
    "status": "pending",
    "imageUrl": "https://example.com/return-photo.jpg",
    "reason": "Damaged goods",
    "notes": "Customer reported damaged packaging",
    "salesrep": { "id": 1, "name": "John Doe" },
    "product": { "id": 5, "name": "Product A" },
    "client": { "id": 3, "name": "Client XYZ" },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3. Get Product Return by ID
**GET** `/product-returns/:id`

**Response:**
```json
{
  "id": 1,
  "salesrepId": 1,
  "productId": 5,
  "qty": 10,
  "clientId": 3,
  "date": "2024-01-15",
  "status": "pending",
  "imageUrl": "https://example.com/return-photo.jpg",
  "reason": "Damaged goods",
  "notes": "Customer reported damaged packaging",
  "salesrep": { "id": 1, "name": "John Doe" },
  "product": { "id": 5, "name": "Product A" },
  "client": { "id": 3, "name": "Client XYZ" },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Product Return
**PATCH** `/product-returns/:id`

**Request Body:**
```json
{
  "qty": 8,
  "reason": "Updated reason",
  "notes": "Updated notes"
}
```

### 5. Update Return Status
**PATCH** `/product-returns/:id/status`

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Return approved by manager"
}
```

### 6. Get Returns by Sales Rep
**GET** `/product-returns/salesrep/:salesrepId`

### 7. Get Returns by Client
**GET** `/product-returns/client/:clientId`

### 8. Get Returns by Product
**GET** `/product-returns/product/:productId`

### 9. Get Returns by Status
**GET** `/product-returns/status/:status`

**Valid statuses:** `pending`, `approved`, `rejected`, `processed`

### 10. Get Returns by Date Range
**GET** `/product-returns/date-range?startDate=2024-01-01&endDate=2024-01-31`

### 11. Get Return Statistics
**GET** `/product-returns/stats`

**Response:**
```json
{
  "total": 50,
  "pending": 15,
  "approved": 20,
  "rejected": 5,
  "processed": 10
}
```

### 12. Delete Product Return
**DELETE** `/product-returns/:id`

## Status Flow
1. **pending** - Initial status when return is created
2. **approved** - Return has been approved by management
3. **rejected** - Return has been rejected
4. **processed** - Return has been processed and completed

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Responses
- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid JWT token
- **404 Not Found** - Product return not found
- **500 Internal Server Error** - Server error

## Usage Examples

### Create a Return
```bash
curl -X POST http://localhost:3000/product-returns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "salesrepId": 1,
    "productId": 5,
    "qty": 10,
    "clientId": 3,
    "date": "2024-01-15",
    "reason": "Damaged goods"
  }'
```

### Update Status
```bash
curl -X PATCH http://localhost:3000/product-returns/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "approved",
    "notes": "Approved by manager"
  }'
```
