-- =====================================================
-- CREATE COMPETITOR REPORT TABLE
-- =====================================================
-- This script creates the CompetitorReport table for tracking
-- competitor products, pricing, and activities during visits
-- =====================================================

CREATE TABLE IF NOT EXISTS `CompetitorReport` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reportId` int(11) DEFAULT NULL COMMENT 'References JourneyPlan ID',
  `clientId` int(11) NOT NULL COMMENT 'References the client visited',
  `userId` int(11) NOT NULL COMMENT 'References the sales rep who created the report',
  `competitorName` varchar(255) DEFAULT NULL COMMENT 'Name of competitor company/brand',
  `productName` varchar(255) DEFAULT NULL COMMENT 'Competitor product name',
  `price` decimal(10,2) DEFAULT NULL COMMENT 'Competitor product price',
  `quantity` int(11) DEFAULT NULL COMMENT 'Stock/quantity observed',
  `promotion` text DEFAULT NULL COMMENT 'Any promotions or discounts',
  `comment` text DEFAULT NULL COMMENT 'Additional notes about competitor activity',
  `imageUrl` varchar(255) DEFAULT NULL COMMENT 'Photo evidence URL',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `idx_competitor_report_report_id` (`reportId`),
  KEY `idx_competitor_report_user_id` (`userId`),
  KEY `idx_competitor_report_client_id` (`clientId`),
  KEY `idx_competitor_report_created_at` (`createdAt`),
  KEY `idx_competitor_report_composite` (`reportId`, `createdAt`),
  CONSTRAINT `fk_competitor_report_client` FOREIGN KEY (`clientId`) REFERENCES `Clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_competitor_report_user` FOREIGN KEY (`userId`) REFERENCES `SalesRep` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================
-- Additional indexes for common query patterns
-- Note: Some indexes may already be created above, but included here for reference

-- Index for filtering by journey plan and date
CREATE INDEX IF NOT EXISTS `idx_competitor_report_plan_date` ON `CompetitorReport` (`reportId`, `createdAt`);

-- Index for client-based queries
CREATE INDEX IF NOT EXISTS `idx_competitor_report_client_date` ON `CompetitorReport` (`clientId`, `createdAt`);

-- Index for user-based queries
CREATE INDEX IF NOT EXISTS `idx_competitor_report_user_date` ON `CompetitorReport` (`userId`, `createdAt`);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify the table was created correctly

-- Check table structure
DESCRIBE `CompetitorReport`;

-- Check indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'CompetitorReport'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

