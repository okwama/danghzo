# Journey Plan Reports Summary

This document provides a brief summary of each report type available in the Journey Plan system and their respective database tables.

## Overview

The Journey Plan system supports **3 main report types** that can be submitted during a journey/visit:

1. **Feedback Report** (Customer Feedback)
2. **Product Availability Report** (Product Stock/Inventory)
3. **Visibility Activity Report** (Product Display/Visibility)

---

## 1. Feedback Report

### Purpose
Collects customer feedback and comments during a visit.

### Database Table: `FeedbackReport`

**Key Columns:**
- `id` (Primary Key) - Auto-increment
- `reportId` (INT, nullable) - References Journey Plan ID
- `clientId` (INT) - References the client visited
- `userId` (INT) - References the sales rep who created the report
- `comment` (VARCHAR/TEXT, nullable) - Customer feedback text
- `createdAt` (DATETIME) - Timestamp of report creation

**Relationships:**
- Foreign key to `Clients` table via `clientId`
- Foreign key to `SalesRep` table via `userId`
- Links to `JourneyPlan` via `reportId`

**Business Rules:**
- **One feedback report per client per day** (unique constraint on `clientId` + `DATE(createdAt)`)
- If multiple reports submitted for same client on same day, the latest one updates the existing record
- Associated with a specific Journey Plan (`reportId`)

---

## 2. Product Availability Report

### Purpose
Tracks product stock levels, availability, and inventory information for clients.

### Database Table: `ProductReport`

**Key Columns:**
- `id` (Primary Key) - Auto-increment
- `reportId` (INT, nullable) - References Journey Plan ID
- `clientId` (INT) - References the client visited
- `userId` (INT) - References the sales rep who created the report
- `productId` (INT, nullable) - References the product (if applicable)
- `productName` (VARCHAR, nullable) - Name of the product
- `quantity` (INT, nullable) - Stock/quantity available
- `comment` (VARCHAR/TEXT, nullable) - Additional notes about the product
- `createdAt` (DATETIME) - Timestamp of report creation

**Relationships:**
- Foreign key to `Clients` table via `clientId`
- Foreign key to `SalesRep` table via `userId`
- Links to `JourneyPlan` via `reportId`
- Optional link to product catalog via `productId`

**Business Rules:**
- **Multiple product reports allowed per client per day** (no unique constraint)
- Supports **bulk insertion** via stored procedure `BulkInsertProductReports` for multiple products at once
- Each product gets its own record in the table
- Can report on multiple products in a single visit

**Performance Optimization:**
- Stored procedure available for bulk operations
- Indexed on `reportId`, `clientId`, `userId`, `createdAt` for fast queries

---

## 3. Visibility Activity Report

### Purpose
Documents product display and visibility at client locations, typically includes photographic evidence.

### Database Table: `VisibilityReport`

**Key Columns:**
- `id` (Primary Key) - Auto-increment
- `reportId` (INT, nullable) - References Journey Plan ID
- `clientId` (INT) - References the client visited
- `userId` (INT) - References the sales rep who created the report
- `comment` (VARCHAR/TEXT, nullable) - Description of visibility/display
- `imageUrl` (VARCHAR, nullable) - URL to visibility photo/image
- `createdAt` (DATETIME) - Timestamp of report creation

**Relationships:**
- Foreign key to `Clients` table via `clientId`
- Foreign key to `SalesRep` table via `userId`
- Links to `JourneyPlan` via `reportId`

**Business Rules:**
- **One visibility report per client per day** (unique constraint on `clientId` + `DATE(createdAt)`)
- If multiple reports submitted for same client on same day, the latest one updates the existing record
- Typically includes image/photo of product display
- Associated with a specific Journey Plan (`reportId`)

---

## Common Features Across All Reports

### Shared Relationships
All three report tables share:
- Link to **Journey Plan** via `reportId` field
- Link to **Client** via `clientId` (foreign key to `Clients` table)
- Link to **Sales Representative** via `userId` (foreign key to `SalesRep` table)

### Query Patterns
All reports support:
- **Filtering by Journey Plan** - Get all reports for a specific journey plan
- **Filtering by Date** - Get reports for a specific date or date range
- **Filtering by User** - Get reports created by a specific sales rep
- **Filtering by Client** - Get reports for a specific client
- **Date-based grouping** - Reports grouped by date for visit tracking

### Performance Indexes
All three tables have indexes on:
- `reportId` - For journey plan queries
- `clientId` - For client-based queries
- `userId` - For user-based queries
- `createdAt` - For date-based queries
- Composite indexes on `(reportId, createdAt)` - For optimized journey plan date queries

---

## Journey Plan Completion Status

A journey plan visit is considered **complete** when all 3 report types have been submitted:
- ✅ Feedback Report exists
- ✅ Product Availability Report(s) exist
- ✅ Visibility Activity Report exists

**Completion Percentage:** `(totalReports / 3) * 100`

---

## API Endpoints

### Report Submission
- `POST /reports` - Submit any report type
  - Body includes: `type` (FEEDBACK | PRODUCT_AVAILABILITY | VISIBILITY_ACTIVITY), `journeyPlanId`, `clientId`, `details`

### Report Retrieval
- `GET /reports/journey-plan/:journeyPlanId` - Get all reports for a journey plan
- `GET /reports/journey-plan/:journeyPlanId/today` - Get today's reports for a journey plan
- `GET /reports/visits/:date` - Get visits grouped by date and client
- `GET /reports/visits/weekly` - Get weekly visits for a user
- `GET /reports/counts` - Get report counts (dashboard statistics)

---

## Notes

⚠️ **Important:** These report tables (`FeedbackReport`, `ProductReport`, `VisibilityReport`) are **NOT** present in the `mydb.sql` file, as that file appears to be for a different database schema (air charters system). The report tables are part of the Journey Plans/Sales Rep management system and are likely managed by TypeORM migrations or a separate database schema.

