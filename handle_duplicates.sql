-- =====================================================
-- HANDLE DUPLICATE ENTRIES BEFORE ADDING CONSTRAINTS
-- =====================================================
-- This script handles existing duplicate entries before adding unique constraints
-- =====================================================

-- Step 1: Check for duplicate entries in FeedbackReport
SELECT 
    `clientId`,
    DATE(`createdAt`) as report_date,
    COUNT(*) as duplicate_count
FROM `FeedbackReport`
GROUP BY `clientId`, DATE(`createdAt`)
HAVING COUNT(*) > 1
ORDER BY `clientId`, report_date;

-- Step 2: Check for duplicate entries in VisibilityReport
SELECT 
    `clientId`,
    DATE(`createdAt`) as report_date,
    COUNT(*) as duplicate_count
FROM `VisibilityReport`
GROUP BY `clientId`, DATE(`createdAt`)
HAVING COUNT(*) > 1
ORDER BY `clientId`, report_date;

-- Step 3: Show the actual duplicate records for FeedbackReport
SELECT 
    `id`,
    `clientId`,
    `reportId`,
    `comment`,
    `createdAt`,
    DATE(`createdAt`) as report_date
FROM `FeedbackReport`
WHERE (`clientId`, DATE(`createdAt`)) IN (
    SELECT 
        `clientId`,
        DATE(`createdAt`)
    FROM `FeedbackReport`
    GROUP BY `clientId`, DATE(`createdAt`)
    HAVING COUNT(*) > 1
)
ORDER BY `clientId`, `createdAt`;

-- Step 4: Show the actual duplicate records for VisibilityReport
SELECT 
    `id`,
    `clientId`,
    `reportId`,
    `comment`,
    `imageUrl`,
    `createdAt`,
    DATE(`createdAt`) as report_date
FROM `VisibilityReport`
WHERE (`clientId`, DATE(`createdAt`)) IN (
    SELECT 
        `clientId`,
        DATE(`createdAt`)
    FROM `VisibilityReport`
    GROUP BY `clientId`, DATE(`createdAt`)
    HAVING COUNT(*) > 1
)
ORDER BY `clientId`, `createdAt`;

-- =====================================================
-- OPTIONS TO HANDLE DUPLICATES:
-- =====================================================

-- OPTION 1: Keep the most recent report for each client per day
-- (Uncomment and run these if you want to keep the latest)

-- For FeedbackReport - Keep the most recent
-- DELETE f1 FROM `FeedbackReport` f1
-- INNER JOIN `FeedbackReport` f2 
-- WHERE f1.`clientId` = f2.`clientId` 
--     AND DATE(f1.`createdAt`) = DATE(f2.`createdAt`)
--     AND f1.`id` < f2.`id`;

-- For VisibilityReport - Keep the most recent
-- DELETE v1 FROM `VisibilityReport` v1
-- INNER JOIN `VisibilityReport` v2 
-- WHERE v1.`clientId` = v2.`clientId` 
--     AND DATE(v1.`createdAt`) = DATE(v2.`createdAt`)
--     AND v1.`id` < v2.`id`;

-- OPTION 2: Keep the first report for each client per day
-- (Uncomment and run these if you want to keep the earliest)

-- For FeedbackReport - Keep the first
-- DELETE f1 FROM `FeedbackReport` f1
-- INNER JOIN `FeedbackReport` f2 
-- WHERE f1.`clientId` = f2.`clientId` 
--     AND DATE(f1.`createdAt`) = DATE(f2.`createdAt`)
--     AND f1.`id` > f2.`id`;

-- For VisibilityReport - Keep the first
-- DELETE v1 FROM `VisibilityReport` v1
-- INNER JOIN `VisibilityReport` v2 
-- WHERE v1.`clientId` = v2.`clientId` 
--     AND DATE(v1.`createdAt`) = DATE(v2.`createdAt`)
--     AND v1.`id` > v2.`id`;

-- =====================================================
-- AFTER CLEANING DUPLICATES, ADD CONSTRAINTS:
-- =====================================================
-- ALTER TABLE `FeedbackReport` ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`, `report_date`);
-- ALTER TABLE `VisibilityReport` ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`, `report_date`);
-- =====================================================
