-- Test script to verify uplift sales database structure and relationships
-- Run this to ensure the database is properly set up for uplift sales with items

-- 1. Check if tables exist and have correct structure
SELECT 'Checking UpliftSale table structure...' as test_step;
DESCRIBE UpliftSale;

SELECT 'Checking UpliftSaleItem table structure...' as test_step;
DESCRIBE UpliftSaleItem;

-- 2. Check foreign key constraints
SELECT 'Checking foreign key constraints...' as test_step;
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

-- 3. Check if we have sample data to work with
SELECT 'Checking sample data availability...' as test_step;
SELECT 
    'Clients' as table_name, 
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN '✅ Has data' ELSE '❌ No data' END as status
FROM Clients
UNION ALL
SELECT 
    'SalesRep' as table_name, 
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN '✅ Has data' ELSE '❌ No data' END as status
FROM SalesRep
UNION ALL
SELECT 
    'Product' as table_name, 
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN '✅ Has data' ELSE '❌ No data' END as status
FROM Product;

-- 4. Test creating an uplift sale with items (if sample data exists)
SELECT 'Testing uplift sale creation...' as test_step;

-- Insert test uplift sale
INSERT INTO UpliftSale (clientId, userId, status, totalAmount, createdAt, updatedAt)
SELECT 
    c.id as clientId,
    s.id as userId,
    'pending' as status,
    0.0 as totalAmount,
    NOW(3) as createdAt,
    NOW(3) as updatedAt
FROM Clients c, SalesRep s 
WHERE c.id = (SELECT MIN(id) FROM Clients)
AND s.id = (SELECT MIN(id) FROM SalesRep)
LIMIT 1;

-- Get the ID of the created uplift sale
SET @uplift_sale_id = LAST_INSERT_ID();

-- Insert test uplift sale items
INSERT INTO UpliftSaleItem (upliftSaleId, productId, quantity, unitPrice, total, createdAt)
SELECT 
    @uplift_sale_id as upliftSaleId,
    p.id as productId,
    2 as quantity,
    100.0 as unitPrice,
    200.0 as total,
    NOW(3) as createdAt
FROM Product p
WHERE p.id = (SELECT MIN(id) FROM Product)
LIMIT 1;

INSERT INTO UpliftSaleItem (upliftSaleId, productId, quantity, unitPrice, total, createdAt)
SELECT 
    @uplift_sale_id as upliftSaleId,
    p.id as productId,
    1 as quantity,
    50.0 as unitPrice,
    50.0 as total,
    NOW(3) as createdAt
FROM Product p
WHERE p.id = (SELECT MIN(id) FROM Product) + 1
LIMIT 1;

-- 5. Verify the test data was created correctly
SELECT 'Verifying test data...' as test_step;
SELECT 
    us.id as uplift_sale_id,
    c.name as client_name,
    s.name as sales_rep_name,
    us.status,
    us.totalAmount,
    us.createdAt,
    COUNT(usi.id) as item_count
FROM UpliftSale us
LEFT JOIN Clients c ON us.clientId = c.id
LEFT JOIN SalesRep s ON us.userId = s.id
LEFT JOIN UpliftSaleItem usi ON us.id = usi.upliftSaleId
WHERE us.id = @uplift_sale_id
GROUP BY us.id, c.name, s.name, us.status, us.totalAmount, us.createdAt;

-- 6. Show the items for the test uplift sale
SELECT 'Showing uplift sale items...' as test_step;
SELECT 
    usi.id,
    usi.upliftSaleId,
    p.name as product_name,
    usi.quantity,
    usi.unitPrice,
    usi.total,
    usi.createdAt
FROM UpliftSaleItem usi
JOIN Product p ON usi.productId = p.id
WHERE usi.upliftSaleId = @uplift_sale_id
ORDER BY usi.id;

-- 7. Test updating the total amount
SELECT 'Testing total amount calculation...' as test_step;
UPDATE UpliftSale 
SET totalAmount = (
    SELECT COALESCE(SUM(total), 0) 
    FROM UpliftSaleItem 
    WHERE upliftSaleId = @uplift_sale_id
)
WHERE id = @uplift_sale_id;

-- Verify the total was updated
SELECT 
    'Updated total amount:' as message,
    totalAmount
FROM UpliftSale 
WHERE id = @uplift_sale_id;

-- 8. Clean up test data
SELECT 'Cleaning up test data...' as test_step;
DELETE FROM UpliftSaleItem WHERE upliftSaleId = @uplift_sale_id;
DELETE FROM UpliftSale WHERE id = @uplift_sale_id;

SELECT '✅ Database test completed successfully!' as final_result;
