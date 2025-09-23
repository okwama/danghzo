-- Stored Procedure: sp_dashboard_summary
-- MariaDB 10.6 compatible
-- Aggregates dashboard metrics into a single result set of card rows
-- Signature: sp_dashboard_summary(IN p_user_id INT, IN p_date DATE)

DELIMITER $$
CREATE OR REPLACE PROCEDURE sp_dashboard_summary(IN p_user_id INT, IN p_date DATE)
BEGIN
  DECLARE v_date DATE;
  SET v_date = IFNULL(p_date, CURDATE());

  /* Cards schema: id, title, mainValue, subValue, type, status */
  /* Note: status values: normal | loading | warning | success */

  /* Orders + View Orders */
  SELECT 'orders' AS id,
         'Create Order' AS title,
         'New Order' AS mainValue,
         CONCAT(IFNULL((SELECT COUNT(*) FROM sales_orders so WHERE DATE(so.order_date) = v_date), 0), ' Total Orders') AS subValue,
         'orders' AS type,
         'normal' AS status
  UNION ALL
  SELECT 'viewOrders',
         'View Orders',
         CONCAT(IFNULL((SELECT COUNT(*) FROM sales_orders so WHERE DATE(so.order_date) = v_date), 0), ' Orders') AS mainValue,
         CONCAT(IFNULL((SELECT COUNT(*) FROM sales_orders so WHERE so.status = 'in payment' OR so.status = 'draft'), 0), ' Pending') AS subValue,
         'viewOrders',
         'normal'

  /* Visits */
  UNION ALL
  SELECT 'visits' AS id,
         'Visits' AS title,
         CONCAT(IFNULL((SELECT COUNT(*) FROM JourneyPlan jp WHERE jp.userId = p_user_id AND DATE(jp.date) = v_date AND jp.checkInTime IS NOT NULL), 0),
                '/',
                IFNULL((SELECT COUNT(*) FROM JourneyPlan jp2 WHERE jp2.userId = p_user_id AND DATE(jp2.date) = v_date), 0),
                ' Done') AS mainValue,
         CONCAT(
           GREATEST(
             IFNULL((SELECT COUNT(*) FROM JourneyPlan jp3 WHERE jp3.userId = p_user_id AND DATE(jp3.date) = v_date), 0)
             - IFNULL((SELECT COUNT(*) FROM JourneyPlan jp4 WHERE jp4.userId = p_user_id AND DATE(jp4.date) = v_date AND jp4.checkInTime IS NOT NULL), 0),
             0
           ),
           ' Remaining'
         ) AS subValue,
         'visits' AS type,
         CASE WHEN (
           IFNULL((SELECT COUNT(*) FROM JourneyPlan jp3 WHERE jp3.userId = p_user_id AND DATE(jp3.date) = v_date), 0)
           - IFNULL((SELECT COUNT(*) FROM JourneyPlan jp4 WHERE jp4.userId = p_user_id AND DATE(jp4.date) = v_date AND jp4.checkInTime IS NOT NULL), 0)
         ) = 0 THEN 'success' ELSE 'normal' END AS status

  /* Clients */
  UNION ALL
  SELECT 'clients',
         'Clients',
         CONCAT(IFNULL((SELECT COUNT(*) FROM Clients c WHERE c.status = 1), 0), ' Active') AS mainValue,
         CONCAT(IFNULL((SELECT COUNT(*) FROM Clients c2 WHERE DATE(c2.created_at) = v_date), 0), ' Today') AS subValue,
         'clients',
         'normal'

  /* Tasks */
  UNION ALL
  SELECT 'tasks',
         'Tasks',
         CONCAT(IFNULL((SELECT COUNT(*) FROM tasks t WHERE t.salesRepId = p_user_id AND t.status = 'pending'), 0), ' Pending') AS mainValue,
         CONCAT(IFNULL((SELECT COUNT(*) FROM tasks t2 
                         WHERE t2.salesRepId = p_user_id 
                           AND t2.status = 'pending' 
                           AND (DATE(t2.date) = v_date OR (t2.date IS NULL AND DATE(t2.createdAt) = v_date))
                       ), 0), ' Due Today') AS subValue,
         'tasks',
         CASE WHEN IFNULL((SELECT COUNT(*) FROM tasks t2 
                             WHERE t2.salesRepId = p_user_id 
                               AND t2.status = 'pending' 
                               AND (DATE(t2.date) = v_date OR (t2.date IS NULL AND DATE(t2.createdAt) = v_date))
                           ), 0) > 0 THEN 'warning' ELSE 'normal' END AS status

  /* Notices */
  UNION ALL
  SELECT 'notices',
         'Notices',
         CONCAT(IFNULL((SELECT COUNT(*) FROM notices n WHERE DATE(n.created_at) = v_date), 0), ' New') AS mainValue,
         CONCAT(IFNULL((SELECT COUNT(*) FROM notices n2 WHERE DATE(n2.created_at) = v_date AND n2.status = 1), 0), ' Important') AS subValue,
         'notices',
         CASE WHEN IFNULL((SELECT COUNT(*) FROM notices n2 WHERE DATE(n2.created_at) = v_date AND n2.status = 1), 0) > 0 THEN 'warning' ELSE 'normal' END

  /* Journey Plans */
  UNION ALL
  SELECT 'journeyPlans',
         'Journey Plans',
         CONCAT(IFNULL((SELECT COUNT(*) FROM JourneyPlan jp WHERE DATE(jp.date) = v_date AND (jp.userId = p_user_id OR p_user_id IS NULL)), 0), ' Routes') AS mainValue,
         '0 Stops' AS subValue, -- derive stops if modeled; else 0
         'journeyPlans',
         'normal'

  /* Clock In/Out */
  UNION ALL
  SELECT 'clockInOut',
         'Clock In/Out',
         CASE WHEN (
           SELECT lh.status FROM LoginHistory lh 
           WHERE lh.userId = p_user_id 
             AND DATE(CAST(lh.sessionStart AS DATETIME)) = v_date
           ORDER BY CAST(lh.sessionStart AS DATETIME) DESC LIMIT 1
         ) = 1 THEN 'Clocked In' ELSE 'Clocked Out' END AS mainValue,
         COALESCE(
           (SELECT DATE_FORMAT(CAST(lh.sessionStart AS DATETIME), '%H:%i')
              FROM LoginHistory lh 
             WHERE lh.userId = p_user_id 
               AND DATE(CAST(lh.sessionStart AS DATETIME)) = v_date
             ORDER BY CAST(lh.sessionStart AS DATETIME) DESC LIMIT 1),
           'Not Started'
         ) AS subValue,
         'clockInOut',
         CASE WHEN (
           SELECT lh.status FROM LoginHistory lh 
           WHERE lh.userId = p_user_id 
             AND DATE(CAST(lh.sessionStart AS DATETIME)) = v_date
           ORDER BY CAST(lh.sessionStart AS DATETIME) DESC LIMIT 1
         ) = 1 THEN 'success' ELSE 'normal' END AS status

  /* Leaves */
  UNION ALL
  SELECT 'leaves',
         'Leaves',
         CONCAT(IFNULL((SELECT COUNT(*) FROM leave_requests lr WHERE lr.employee_id = p_user_id AND lr.status = 'approved'), 0), ' Approved') AS mainValue,
         CONCAT(IFNULL((SELECT COUNT(*) FROM leave_requests lr2 WHERE lr2.employee_id = p_user_id AND lr2.status = 'pending'), 0), ' Pending') AS subValue,
         'leaves',
         CASE WHEN IFNULL((SELECT COUNT(*) FROM leave_requests lr2 WHERE lr2.employee_id = p_user_id AND lr2.status = 'pending'), 0) > 0 THEN 'warning' ELSE 'normal' END

  /* Static cards */
  UNION ALL
  SELECT 'upliftSales','Uplift Sales','3 Active','Promotions','upliftSales','normal'
  UNION ALL
  SELECT 'returns','Returns','2 Pending','Returns','returns','normal'
  UNION ALL
  SELECT 'profile','Profile','View/Edit','Profile','profile','normal'
  ;
END$$
DELIMITER ;
