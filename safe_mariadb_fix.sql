-- =====================================================
-- SAFE MARIADB FIX REPORT TABLE CONSTRAINTS
-- =====================================================
-- This script safely checks existing columns and constraints
-- =====================================================

-- Step 1: Check current table structure
DESCRIBE `FeedbackReport`;
DESCRIBE `VisibilityReport`;

-- Step 2: Check current indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('FeedbackReport', 'VisibilityReport', 'ProductReport')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Step 3: Add computed columns only if they don't exist
-- For FeedbackReport
SET @sql = (SELECT 
    IF(COUNT(*) = 0, 
        'ALTER TABLE `FeedbackReport` ADD COLUMN `report_date` DATE GENERATED ALWAYS AS (DATE(`createdAt`)) STORED;',
        'SELECT "report_date column already exists in FeedbackReport" as message;'
    )
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'FeedbackReport' 
    AND COLUMN_NAME = 'report_date');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- For VisibilityReport
SET @sql = (SELECT 
    IF(COUNT(*) = 0, 
        'ALTER TABLE `VisibilityReport` ADD COLUMN `report_date` DATE GENERATED ALWAYS AS (DATE(`createdAt`)) STORED;',
        'SELECT "report_date column already exists in VisibilityReport" as message;'
    )
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'VisibilityReport' 
    AND COLUMN_NAME = 'report_date');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Add unique constraints only if they don't exist
-- For FeedbackReport
SET @sql = (SELECT 
    IF(COUNT(*) = 0, 
        'ALTER TABLE `FeedbackReport` ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`, `report_date`);',
        'SELECT "uk_feedback_client_date constraint already exists" as message;'
    )
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'FeedbackReport' 
    AND INDEX_NAME = 'uk_feedback_client_date');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- For VisibilityReport
SET @sql = (SELECT 
    IF(COUNT(*) = 0, 
        'ALTER TABLE `VisibilityReport` ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`, `report_date`);',
        'SELECT "uk_visibility_client_date constraint already exists" as message;'
    )
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'VisibilityReport' 
    AND INDEX_NAME = 'uk_visibility_client_date');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Verify final state
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
-- MANUAL FALLBACK (if dynamic SQL doesn't work):
-- =====================================================
-- If the above doesn't work, run these manually:

-- Check if columns exist:
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
--     AND TABLE_NAME = 'FeedbackReport' 
--     AND COLUMN_NAME = 'report_date';

-- If report_date doesn't exist, add it:
-- ALTER TABLE `FeedbackReport` ADD COLUMN `report_date` DATE GENERATED ALWAYS AS (DATE(`createdAt`)) STORED;
-- ALTER TABLE `VisibilityReport` ADD COLUMN `report_date` DATE GENERATED ALWAYS AS (DATE(`createdAt`)) STORED;

-- Check if constraints exist:
-- SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
-- WHERE TABLE_SCHEMA = DATABASE() 
--     AND TABLE_NAME = 'FeedbackReport' 
--     AND INDEX_NAME = 'uk_feedback_client_date';

-- If constraints don't exist, add them:
-- ALTER TABLE `FeedbackReport` ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`, `report_date`);
-- ALTER TABLE `VisibilityReport` ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`, `report_date`);
-- =====================================================
