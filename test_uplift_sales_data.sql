-- Test Uplift Sales Data
-- This script inserts test data to verify the foreign key relationships work

-- First, let's check if we have any existing data
SELECT 'UpliftSale' as table_name, COUNT(*) as record_count FROM UpliftSale
UNION ALL
SELECT 'UpliftSaleItem' as table_name, COUNT(*) as record_count FROM UpliftSaleItem;

-- Check if we have clients, users, and products to work with
SELECT 'Clients' as table_name, COUNT(*) as record_count FROM Clients LIMIT 1
UNION ALL
SELECT 'SalesRep' as table_name, COUNT(*) as record_count FROM SalesRep LIMIT 1
UNION ALL
SELECT 'Product' as table_name, COUNT(*) as record_count FROM Product LIMIT 1;

-- Insert test uplift sale (only if no existing data)
INSERT IGNORE INTO UpliftSale (clientId, userId, status, totalAmount, createdAt, updatedAt)
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

-- Insert test uplift sale items (only if no existing data)
INSERT IGNORE INTO UpliftSaleItem (upliftSaleId, productId, quantity, unitPrice, total, createdAt)
SELECT 
    us.id as upliftSaleId,
    p.id as productId,
    2 as quantity,
    100.0 as unitPrice,
    200.0 as total,
    NOW(3) as createdAt
FROM UpliftSale us, Product p
WHERE us.id = (SELECT MIN(id) FROM UpliftSale)
AND p.id = (SELECT MIN(id) FROM Product)
LIMIT 1;

-- Verify the test data was inserted
SELECT 
    'UpliftSale' as table_name,
    us.id,
    us.clientId,
    us.userId,
    us.status,
    us.totalAmount,
    us.createdAt
FROM UpliftSale us
ORDER BY us.id DESC
LIMIT 5;

SELECT 
    'UpliftSaleItem' as table_name,
    usi.id,
    usi.upliftSaleId,
    usi.productId,
    usi.quantity,
    usi.unitPrice,
    usi.total,
    usi.createdAt
FROM UpliftSaleItem usi
ORDER BY usi.id DESC
LIMIT 5;

-- Test the relationships by joining the tables
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
GROUP BY us.id, c.name, s.name, us.status, us.totalAmount, us.createdAt
ORDER BY us.id DESC;
