-- Final Fix for Uplift Sales - Only the updatedAt Column Issue
-- The foreign key constraints are already fixed in the database

-- Fix the updatedAt column to have proper default and ON UPDATE
ALTER TABLE `UpliftSale` 
MODIFY COLUMN `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3);

-- Verify the fix
DESCRIBE UpliftSale;

-- Test creating a sample uplift sale (should now work without errors)
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

-- Test creating a sample uplift sale item
INSERT INTO UpliftSaleItem (upliftSaleId, productId, quantity, unitPrice, total, createdAt)
SELECT 
    us.id as upliftSaleId,
    p.id as productId,
    2 as quantity,
    100.0 as unitPrice,
    200.0 as total,
    NOW(3) as createdAt
FROM UpliftSale us, Product p
WHERE us.id = (SELECT MAX(id) FROM UpliftSale)
AND p.id = (SELECT MIN(id) FROM Product)
LIMIT 1;

-- Verify the test data and relationships work
SELECT 
    us.id as uplift_sale_id,
    c.name as client_name,
    s.name as sales_rep_name,
    us.status,
    us.totalAmount,
    us.createdAt,
    us.updatedAt,
    COUNT(usi.id) as item_count
FROM UpliftSale us
LEFT JOIN Clients c ON us.clientId = c.id
LEFT JOIN SalesRep s ON us.userId = s.id
LEFT JOIN UpliftSaleItem usi ON us.id = usi.upliftSaleId
GROUP BY us.id, c.name, s.name, us.status, us.totalAmount, us.createdAt, us.updatedAt
ORDER BY us.id DESC;

-- Show the items for verification
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
WHERE usi.upliftSaleId = (SELECT MAX(id) FROM UpliftSale)
ORDER BY usi.id;
