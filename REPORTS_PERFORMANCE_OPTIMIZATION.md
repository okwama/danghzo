# Reports Performance Optimization

## 🚀 Overview

This document outlines the performance optimizations implemented for the reports system to address slow query issues.

## ❌ Previous Issues

1. **Slow Queries**: Reports queries were taking 36-69 seconds to execute
2. **No Pagination**: Loading ALL reports without limits
3. **Unnecessary Relations**: Always loading user and client data
4. **Missing Indexes**: No database indexes for frequently queried columns
5. **Complex JOINs**: Loading full user and client data for every report

## ✅ Optimizations Implemented

### 1. **Query Optimization**

#### Before:
```typescript
// Loading ALL reports with full relations
const reports = await this.feedbackReportRepository.find({
  relations: ['user', 'client'],
  order: { createdAt: 'DESC' },
});
```

#### After:
```typescript
// Optimized queries with pagination and optional relations
const feedbackQuery = this.feedbackReportRepository
  .createQueryBuilder('feedback')
  .where('feedback.reportId = :journeyPlanId', { journeyPlanId })
  .orderBy('feedback.createdAt', 'DESC')
  .limit(limit)
  .offset(offset);

// Only add relations if specifically requested
if (includeRelations) {
  feedbackQuery.leftJoinAndSelect('feedback.user', 'user');
  feedbackQuery.leftJoinAndSelect('feedback.client', 'client');
}
```

### 2. **Pagination Support**

- **Default Limits**: 50 for journey-specific queries, 100 for all reports
- **Offset Support**: For pagination
- **Has More Indicator**: Returns pagination metadata

### 3. **Optional Relations**

- **Lazy Loading**: Relations only loaded when `includeRelations=true`
- **Reduced Data Transfer**: Smaller response payloads
- **Faster Queries**: No unnecessary JOINs

### 4. **Database Indexes**

Added indexes for frequently queried columns:

```sql
-- ProductReport indexes
CREATE INDEX idx_product_report_report_id ON ProductReport(reportId);
CREATE INDEX idx_product_report_user_id ON ProductReport(userId);
CREATE INDEX idx_product_report_client_id ON ProductReport(clientId);
CREATE INDEX idx_product_report_created_at ON ProductReport(createdAt);
CREATE INDEX idx_product_report_composite ON ProductReport(reportId, createdAt);

-- Similar indexes for FeedbackReport and VisibilityReport
```

### 5. **New API Endpoints**

#### Get Reports by Journey Plan (Optimized)
```
GET /reports/journey-plan/:journeyPlanId?limit=50&offset=0&includeRelations=false
```

#### Get Report Counts (New)
```
GET /reports/counts?journeyPlanId=123
```

#### Get All Reports (Optimized)
```
GET /reports?limit=100&offset=0&includeRelations=false&userId=123&clientId=456
```

## 📊 Performance Improvements

### Expected Results:
- **Query Time**: Reduced from 36-69 seconds to <1 second
- **Memory Usage**: Reduced by 80-90%
- **Network Transfer**: Reduced by 70-80%
- **Database Load**: Significantly reduced

### Monitoring:
```sql
-- Check query performance
EXPLAIN SELECT * FROM ProductReport WHERE reportId = 123 ORDER BY createdAt DESC LIMIT 50;

-- Monitor index usage
SHOW INDEX FROM ProductReport;
```

## 🔧 Implementation Steps

### 1. **Database Optimization**
```bash
# Run the optimization script
mysql -u username -p database_name < optimize_reports_performance.sql
```

### 2. **Backend Updates**
- ✅ Updated `ReportsService` with optimized methods
- ✅ Updated `ReportsController` with new endpoints
- ✅ Added pagination and filtering support

### 3. **Frontend Updates** (Flutter)
- Update API calls to use new endpoints
- Implement pagination in UI
- Use `includeRelations=false` for list views
- Use `includeRelations=true` only for detail views

## 🎯 Usage Examples

### For Reports Dashboard (Fast Loading):
```typescript
// Get just counts for dashboard
const counts = await reportsService.getReportCounts(journeyPlanId);

// Get recent reports without relations
const reports = await reportsService.getReportsByJourneyPlan(journeyPlanId, {
  limit: 10,
  includeRelations: false
});
```

### For Report Details (Full Data):
```typescript
// Get specific report with relations
const reports = await reportsService.getReportsByJourneyPlan(journeyPlanId, {
  limit: 1,
  includeRelations: true
});
```

## 🚨 Migration Notes

### Breaking Changes:
1. **API Response Format**: Now includes pagination metadata
2. **Query Parameters**: New optional parameters for filtering
3. **Default Behavior**: Relations are NOT loaded by default

### Backward Compatibility:
- Existing endpoints still work
- New parameters are optional
- Old response format still supported

## 📈 Monitoring & Maintenance

### Regular Checks:
1. **Query Performance**: Monitor slow query log
2. **Index Usage**: Check index statistics
3. **Table Growth**: Monitor table sizes
4. **API Response Times**: Track endpoint performance

### Maintenance Tasks:
```sql
-- Monthly: Update table statistics
ANALYZE TABLE ProductReport;
ANALYZE TABLE FeedbackReport;
ANALYZE TABLE VisibilityReport;

-- Quarterly: Check index effectiveness
SHOW INDEX FROM ProductReport;
```

## 🔮 Future Improvements

1. **Caching**: Implement Redis caching for frequently accessed reports
2. **Materialized Views**: For complex aggregations
3. **Partitioning**: For large tables by date
4. **Read Replicas**: For read-heavy workloads

## 📞 Support

For issues or questions about the performance optimizations:
1. Check the logs for query performance
2. Monitor database metrics
3. Review the optimization script output
4. Contact the development team
