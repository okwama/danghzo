-- Database Optimization for Reports Performance
-- This file contains SQL commands to optimize the reports tables for better query performance

-- 1. Add indexes for frequently queried columns
-- These indexes will significantly improve query performance for the reports

-- Indexes for ProductReport table
CREATE INDEX IF NOT EXISTS idx_product_report_report_id ON ProductReport(reportId);
CREATE INDEX IF NOT EXISTS idx_product_report_user_id ON ProductReport(userId);
CREATE INDEX IF NOT EXISTS idx_product_report_client_id ON ProductReport(clientId);
CREATE INDEX IF NOT EXISTS idx_product_report_created_at ON ProductReport(createdAt);
CREATE INDEX IF NOT EXISTS idx_product_report_composite ON ProductReport(reportId, createdAt);

-- Indexes for FeedbackReport table
CREATE INDEX IF NOT EXISTS idx_feedback_report_report_id ON FeedbackReport(reportId);
CREATE INDEX IF NOT EXISTS idx_feedback_report_user_id ON FeedbackReport(userId);
CREATE INDEX IF NOT EXISTS idx_feedback_report_client_id ON FeedbackReport(clientId);
CREATE INDEX IF NOT EXISTS idx_feedback_report_created_at ON FeedbackReport(createdAt);
CREATE INDEX IF NOT EXISTS idx_feedback_report_composite ON FeedbackReport(reportId, createdAt);

-- Indexes for VisibilityReport table
CREATE INDEX IF NOT EXISTS idx_visibility_report_report_id ON VisibilityReport(reportId);
CREATE INDEX IF NOT EXISTS idx_visibility_report_user_id ON VisibilityReport(userId);
CREATE INDEX IF NOT EXISTS idx_visibility_report_client_id ON VisibilityReport(clientId);
CREATE INDEX IF NOT EXISTS idx_visibility_report_created_at ON VisibilityReport(createdAt);
CREATE INDEX IF NOT EXISTS idx_visibility_report_composite ON VisibilityReport(reportId, createdAt);

-- 2. Analyze table statistics for better query planning
ANALYZE TABLE ProductReport;
ANALYZE TABLE FeedbackReport;
ANALYZE TABLE VisibilityReport;

-- 3. Optional: Add foreign key constraints if they don't exist
-- This helps with data integrity and can improve query performance

-- Note: Only add these if the foreign key constraints don't already exist
-- ALTER TABLE ProductReport ADD CONSTRAINT fk_product_report_user FOREIGN KEY (userId) REFERENCES SalesRep(id);
-- ALTER TABLE ProductReport ADD CONSTRAINT fk_product_report_client FOREIGN KEY (clientId) REFERENCES Clients(id);

-- ALTER TABLE FeedbackReport ADD CONSTRAINT fk_feedback_report_user FOREIGN KEY (userId) REFERENCES SalesRep(id);
-- ALTER TABLE FeedbackReport ADD CONSTRAINT fk_feedback_report_client FOREIGN KEY (clientId) REFERENCES Clients(id);

-- ALTER TABLE VisibilityReport ADD CONSTRAINT fk_visibility_report_user FOREIGN KEY (userId) REFERENCES SalesRep(id);
-- ALTER TABLE VisibilityReport ADD CONSTRAINT fk_visibility_report_client FOREIGN KEY (clientId) REFERENCES Clients(id);

-- 4. Show current indexes for verification
SHOW INDEX FROM ProductReport;
SHOW INDEX FROM FeedbackReport;
SHOW INDEX FROM VisibilityReport;

-- 5. Performance monitoring queries
-- Use these queries to monitor performance after optimization

-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
    AND table_name IN ('ProductReport', 'FeedbackReport', 'VisibilityReport');

-- Check index usage statistics
SELECT 
    table_name,
    index_name,
    cardinality
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
    AND table_name IN ('ProductReport', 'FeedbackReport', 'VisibilityReport')
ORDER BY table_name, index_name;
