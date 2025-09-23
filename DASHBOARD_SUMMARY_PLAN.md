# Dashboard Summary Consolidation Plan

This plan consolidates the dashboard’s multiple API calls into a single, fast endpoint backed by a database-side procedure/view. It reduces network round trips, centralizes aggregation, and improves perceived load time on the Flutter app.

## Goals
- Replace multiple endpoints with one: `GET /dashboard/summary`.
- Compute all dashboard card metrics server-side (preferably in a stored procedure or view).
- Keep existing card semantics and UI mapping in Flutter with minimal changes.
- Preserve offline/cache behavior in the Flutter app.

## Current Client Calls to Replace
Source: `woosh_app/lib/features/dashboard/data/datasources/dashboard_remote_datasource.dart`
- `/orders` (today’s list → totals, pending)
- `/targets/visit-statistics/{userId}` (visits: completed/total)
- `/clients/stats/overview` (clients: active/new today)
- `/tasks?userId={userId}` (tasks: pending/due today)
- `/notices` (notices: new/important)
- `/journey-plans/by-date?startDate=today&endDate=today` (routes/stops)
- `/clock-in-out/status/{userId}` (isClockedIn, clockInTime)
- `/leave?userId={userId}` (approved/pending)
- Static cards: uplift sales, returns, profile (remain static or include in response as convenience)

## Proposed Server Design (NestJS + DB)
- New endpoint: `GET /dashboard/summary?userId=:id&date=:isoDate` (date optional → today by default)
- Service calls a DB stored procedure or reads from a materialized view that aggregates all metrics in one roundtrip.
- Response shape tailored to Flutter’s `DashboardCardModel` mapping.

### Response Contract (example)
```json
{
  "userId": 123,
  "date": "2025-09-22",
  "cards": [
    {"id":"orders","title":"Create Order","mainValue":"New Order","subValue":"42 Total Orders","type":"orders","status":"normal"},
    {"id":"viewOrders","title":"View Orders","mainValue":"42 Orders","subValue":"5 Pending","type":"viewOrders","status":"normal"},
    {"id":"visits","title":"Visits","mainValue":"7/10 Done","subValue":"3 Remaining","type":"visits","status":"normal"},
    {"id":"clients","title":"Clients","mainValue":"120 Active","subValue":"3 Today","type":"clients","status":"normal"},
    {"id":"tasks","title":"Tasks","mainValue":"6 Pending","subValue":"2 Due Today","type":"tasks","status":"warning"},
    {"id":"notices","title":"Notices","mainValue":"4 New","subValue":"1 Important","type":"notices","status":"warning"},
    {"id":"journeyPlans","title":"Journey Plans","mainValue":"2 Routes","subValue":"18 Stops","type":"journeyPlans","status":"normal"},
    {"id":"clockInOut","title":"Clock In/Out","mainValue":"Clocked In","subValue":"08:35","type":"clockInOut","status":"success"},
    {"id":"leaves","title":"Leaves","mainValue":"1 Approved","subValue":"1 Pending","type":"leaves","status":"warning"},
    {"id":"upliftSales","title":"Uplift Sales","mainValue":"3 Active","subValue":"Promotions","type":"upliftSales","status":"normal"},
    {"id":"returns","title":"Returns","mainValue":"2 Pending","subValue":"Returns","type":"returns","status":"normal"},
    {"id":"profile","title":"Profile","mainValue":"View/Edit","subValue":"Profile","type":"profile","status":"normal"}
  ]
}
```

### Database Layer
- Option A (preferred): Stored procedure `sp_dashboard_summary(user_id INT, target_date DATE)` that returns a single result set with all metrics or JSON.
- Option B: Multiple lightweight views + a simple proc to select from them in one call.
- Option C: Materialized table refreshed every N seconds (if real-time not critical) to minimize DB load.

#### Suggested Metrics Sources (based on `nestJs/mydb.sql`)
- Orders: `sales_orders` (date = today, count total; pending by status)
- Visits: `JourneyPlan` (by userId, date)
- Clients: `Clients` (active count; created today)
- Tasks: `tasks` (by salesRepId, status pending; due today)
- Notices: `notices` and/or `NoticeBoard` (today/new; priority/important if modeled)
- Journey Plans: `JourneyPlan` (routes count = rows, stops = derived if schema supports; else 0)
- Clock status: `LoginHistory` (latest session status for userId)
- Leaves: `leave_requests` (approved/pending by employee/salesrep)

### NestJS Implementation
- Create module: `DashboardModule`
- Controller: `DashboardController` → `GET /dashboard/summary`
- Service: `DashboardService` → calls repository which executes `sp_dashboard_summary`
- Repository: Use TypeORM `queryRunner` or `manager.query` to execute procedure
- Auth: Guard with existing JWT/roles, limit to own userId unless admin
- Caching: In-memory or Redis (TTL 30–60s) keyed by `userId:date`

### Flutter Changes
- In `DashboardRemoteDataSourceImpl`, replace fan-out calls with one call: `/dashboard/summary`
- Map `cards` array directly to `DashboardCardModel.fromJson`
- Keep cache + fallback behavior; ordering via `_reorderCards()` remains

## Rollout Strategy
- Phase 1: Implement new endpoint without switching client; add hidden toggle for QA
- Phase 2: A/B test on small cohort; monitor timings and error rates
- Phase 3: Flip client to new endpoint; keep legacy endpoints for rollback

## Testing Checklist
- Unit tests for service mapping and date/user filters
- Load test the summary SP and endpoint
- Verify parity for each card vs old logic
- Verify offline cache and stale-warning behavior stays intact

## Open Questions
- Exact definitions for "important" notices and visit "stops" derivation
- Timezone consistency (server vs Africa/Nairobi); ensure date filters align
- Sales card remains hidden or included?
