-- =====================================================
-- COMPLETE FIX FOR REPORT CONSTRAINTS
-- =====================================================
-- This script completes the missing pieces
-- =====================================================

-- Step 1: Check current table structures
DESCRIBE `FeedbackReport`;
DESCRIBE `VisibilityReport`;

-- Step 2: Add report_date column to VisibilityReport (if missing)
ALTER TABLE `VisibilityReport` 
ADD COLUMN `report_date` DATE GENERATED ALWAYS AS (cast(`createdAt` as date)) STORED;

-- Step 3: Handle duplicate entries before adding constraints
-- Keep the most recent feedback report for each client per day
DELETE f1 FROM `FeedbackReport` f1
INNER JOIN `FeedbackReport` f2 
WHERE f1.`clientId` = f2.`clientId` 
    AND DATE(f1.`createdAt`) = DATE(f2.`createdAt`)
    AND f1.`id` < f2.`id`;

-- Keep the most recent visibility report for each client per day
DELETE v1 FROM `VisibilityReport` v1
INNER JOIN `VisibilityReport` v2 
WHERE v1.`clientId` = v2.`clientId` 
    AND DATE(v1.`createdAt`) = DATE(v2.`createdAt`)
    AND v1.`id` < v2.`id`;

-- Step 4: Add unique constraints
ALTER TABLE `FeedbackReport` 
ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`, `report_date`);

ALTER TABLE `VisibilityReport` 
ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`, `report_date`);

-- Step 5: Verify the changes
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
-- 1. Added report_date computed column to VisibilityReport
-- 2. Cleaned duplicate entries (kept most recent)
-- 3. Added unique constraints on (clientId, report_date)
-- 4. This ensures one report per client per day
-- =====================================================
