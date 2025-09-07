-- =====================================================
-- FIX REPORT TABLE CONSTRAINTS
-- =====================================================
-- This script fixes the wrong unique constraints on report tables
-- Changes from: one report per journey plan EVER
-- To: one report per client per day
-- =====================================================

-- Step 1: Remove the wrong unique constraints
-- These prevent multiple reports per journey plan EVER (which is wrong)

-- Remove FeedbackReport unique constraint on reportId
ALTER TABLE `FeedbackReport` DROP INDEX `FeedbackReport_reportId_key`;

-- Remove VisibilityReport unique constraint on reportId  
ALTER TABLE `VisibilityReport` DROP INDEX `VisibilityReport_reportId_key`;

-- Step 2: Add the correct unique constraints
-- These ensure one report per client per day (which is correct)

-- Add unique constraint for FeedbackReport: one per client per day
ALTER TABLE `FeedbackReport` 
ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`, DATE(`createdAt`));

-- Add unique constraint for VisibilityReport: one per client per day
ALTER TABLE `VisibilityReport` 
ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`, DATE(`createdAt`));

-- Note: ProductReport doesn't need a unique constraint because:
-- - Multiple products can be reported for the same client on the same day
-- - Each product gets its own record in the ProductReport table
-- - The existing indexes are sufficient for performance

-- Step 3: Verify the changes
-- Check that the old constraints are removed
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('FeedbackReport', 'VisibilityReport', 'ProductReport')
    AND INDEX_NAME LIKE '%reportId%'
ORDER BY TABLE_NAME, INDEX_NAME;

-- Check that the new constraints are added
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('FeedbackReport', 'VisibilityReport')
    AND INDEX_NAME LIKE '%client_date%'
ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- EXPLANATION OF CHANGES:
-- =====================================================
-- 
-- BEFORE (WRONG):
-- - FeedbackReport: UNIQUE KEY on reportId (journeyPlanId)
-- - VisibilityReport: UNIQUE KEY on reportId (journeyPlanId)
-- - This prevented multiple reports per journey plan EVER
-- - This meant if a client was visited twice, only first report counted
--
-- AFTER (CORRECT):
-- - FeedbackReport: UNIQUE KEY on (clientId, DATE(createdAt))
-- - VisibilityReport: UNIQUE KEY on (clientId, DATE(createdAt))
-- - This allows one report per client per day
-- - This means:
--   * Client A can submit feedback on Monday
--   * Client A can submit feedback on Tuesday
--   * Client B can submit feedback on Monday
--   * Same journey plan can have multiple reports over time
--   * If client visited multiple times in same day, only first report counts
--
-- =====================================================
