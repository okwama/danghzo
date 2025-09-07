-- =====================================================
-- MANUAL FIX REPORT TABLE CONSTRAINTS
-- =====================================================
-- Run this first to see what indexes exist:
-- =====================================================

-- Check current indexes on report tables
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE,
    CASE 
        WHEN NON_UNIQUE = 0 THEN 'UNIQUE'
        ELSE 'NON-UNIQUE'
    END as INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('FeedbackReport', 'VisibilityReport', 'ProductReport')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- =====================================================
-- MANUAL STEPS (run these based on what you see above):
-- =====================================================

-- If you see a UNIQUE index on reportId for FeedbackReport, run:
-- ALTER TABLE `FeedbackReport` DROP INDEX `INDEX_NAME_HERE`;

-- If you see a UNIQUE index on reportId for VisibilityReport, run:
-- ALTER TABLE `VisibilityReport` DROP INDEX `INDEX_NAME_HERE`;

-- Then add the new constraints:
-- ALTER TABLE `FeedbackReport` ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`, DATE(`createdAt`));
-- ALTER TABLE `VisibilityReport` ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`, DATE(`createdAt`));

-- =====================================================
-- COMMON INDEX NAMES TO LOOK FOR:
-- =====================================================
-- FeedbackReport_reportId_key
-- VisibilityReport_reportId_key
-- uk_feedback_reportId
-- uk_visibility_reportId
-- =====================================================
