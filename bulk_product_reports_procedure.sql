DELIMITER $$

CREATE PROCEDURE BulkInsertProductReports(
    IN p_journey_plan_id INT,
    IN p_client_id INT,
    IN p_user_id INT,
    IN p_products_json JSON
)
BEGIN
    DECLARE v_product_count INT DEFAULT 0;
    DECLARE v_current_index INT DEFAULT 0;
    DECLARE v_product_name VARCHAR(191);
    DECLARE v_quantity INT;
    DECLARE v_comment VARCHAR(191);
    DECLARE v_product_id INT;
    DECLARE v_inserted_count INT DEFAULT 0;
    
    SET v_product_count = JSON_LENGTH(p_products_json);
    
    WHILE v_current_index < v_product_count DO
        SET v_product_name = JSON_UNQUOTE(JSON_EXTRACT(p_products_json, CONCAT('$[', v_current_index, '].productName')));
        SET v_quantity = JSON_UNQUOTE(JSON_EXTRACT(p_products_json, CONCAT('$[', v_current_index, '].quantity')));
        SET v_comment = JSON_UNQUOTE(JSON_EXTRACT(p_products_json, CONCAT('$[', v_current_index, '].comment')));
        SET v_product_id = JSON_UNQUOTE(JSON_EXTRACT(p_products_json, CONCAT('$[', v_current_index, '].productId')));
        
        INSERT INTO ProductReport (
            reportId, productName, quantity, comment, clientId, userId, productId, createdAt
        ) VALUES (
            p_journey_plan_id, v_product_name, v_quantity, v_comment, p_client_id, p_user_id, v_product_id, NOW(3)
        );
        
        SET v_inserted_count = v_inserted_count + 1;
        SET v_current_index = v_current_index + 1;
    END WHILE;
    
    SELECT 'SUCCESS' AS status, v_inserted_count AS inserted_count;
END$$

DELIMITER ;