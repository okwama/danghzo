-- =====================================================
-- CHECK AND FIX REPORT TABLE CONSTRAINTS
-- =====================================================
-- This script safely checks existing constraints and fixes them
-- =====================================================

-- Step 1: Check what indexes currently exist on report tables
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('FeedbackReport', 'VisibilityReport', 'ProductReport')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Step 2: Remove existing unique constraints on reportId (if they exist)
-- FeedbackReport
SET @sql = (SELECT CONCAT('ALTER TABLE `FeedbackReport` DROP INDEX `', INDEX_NAME, '`')
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'FeedbackReport'
                AND INDEX_NAME LIKE '%reportId%'
                AND NON_UNIQUE = 0
            LIMIT 1);

SET @sql = IF(@sql IS NOT NULL, @sql, 'SELECT "No unique index on reportId found for FeedbackReport" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- VisibilityReport
SET @sql = (SELECT CONCAT('ALTER TABLE `VisibilityReport` DROP INDEX `', INDEX_NAME, '`')
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'VisibilityReport'
                AND INDEX_NAME LIKE '%reportId%'
                AND NON_UNIQUE = 0
            LIMIT 1);

SET @sql = IF(@sql IS NOT NULL, @sql, 'SELECT "No unique index on reportId found for VisibilityReport" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add the correct unique constraints
-- Add unique constraint for FeedbackReport: one per client per day
ALTER TABLE `FeedbackReport` 
ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`, DATE(`createdAt`));

-- Add unique constraint for VisibilityReport: one per client per day
ALTER TABLE `VisibilityReport` 
ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`, DATE(`createdAt`));

-- Step 4: Verify the final state
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('FeedbackReport', 'VisibilityReport', 'ProductReport')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- =====================================================
-- EXPLANATION:
-- =====================================================
-- This script:
-- 1. Shows current indexes before changes
-- 2. Safely removes unique constraints on reportId (if they exist)
-- 3. Adds new unique constraints on (clientId, DATE(createdAt))
-- 4. Shows final indexes after changes
-- =====================================================
