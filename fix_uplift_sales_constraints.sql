-- Fix Uplift Sales Foreign Key Constraints
-- This script adds the missing foreign key constraints to ensure data integrity

-- 1. Add constraint for UpliftSale.clientId -> Clients.id
ALTER TABLE `UpliftSale` 
ADD CONSTRAINT `fk_uplift_sale_client` 
FOREIGN KEY (`clientId`) REFERENCES `Clients` (`id`) ON DELETE CASCADE;

-- 2. Add constraint for UpliftSale.userId -> SalesRep.id
ALTER TABLE `UpliftSale` 
ADD CONSTRAINT `fk_uplift_sale_user` 
FOREIGN KEY (`userId`) REFERENCES `SalesRep` (`id`) ON DELETE CASCADE;

-- 3. Add constraint for UpliftSaleItem.productId -> Product.id
ALTER TABLE `UpliftSaleItem` 
ADD CONSTRAINT `fk_uplift_sale_item_product` 
FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE;

-- 4. Verify the constraints were added
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('UpliftSale', 'UpliftSaleItem')
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;
