-- =====================================================
-- MARIADB FIX REPORT TABLE CONSTRAINTS
-- =====================================================
-- This script fixes constraints for MariaDB compatibility
-- =====================================================

-- Step 1: Check current indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('FeedbackReport', 'VisibilityReport', 'ProductReport')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Step 2: Add the correct unique constraints for MariaDB
-- Note: MariaDB doesn't support DATE() function in unique constraints
-- We'll use a different approach with a computed column

-- For FeedbackReport: Add a computed column for date only
ALTER TABLE `FeedbackReport` 
ADD COLUMN `report_date` DATE GENERATED ALWAYS AS (DATE(`createdAt`)) STORED;

-- Add unique constraint on clientId + report_date
ALTER TABLE `FeedbackReport` 
ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`, `report_date`);

-- For VisibilityReport: Add a computed column for date only
ALTER TABLE `VisibilityReport` 
ADD COLUMN `report_date` DATE GENERATED ALWAYS AS (DATE(`createdAt`)) STORED;

-- Add unique constraint on clientId + report_date
ALTER TABLE `VisibilityReport` 
ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`, `report_date`);

-- Step 3: Verify the changes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('FeedbackReport', 'VisibilityReport')
    AND INDEX_NAME LIKE '%client_date%'
ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- EXPLANATION:
-- =====================================================
-- MariaDB doesn't support DATE() function in unique constraints
-- Solution: Add computed columns that store just the date part
-- This achieves the same result: one report per client per day
-- =====================================================
