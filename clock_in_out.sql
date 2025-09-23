-- Stored Procedures: sp_clock_in, sp_clock_out
-- MariaDB 10.6+ compatible
-- Handles single active session per day, auto-closes previous-day sessions at 18:00, and caps duration at 8 hours

DELIMITER $$

CREATE OR REPLACE PROCEDURE sp_clock_in(
  IN p_user_id INT,
  IN p_client_time DATETIME -- expected in Africa/Nairobi local time
)
BEGIN
  DECLARE v_today DATE;
  DECLARE v_active_id INT;
  DECLARE v_completed_id INT;

  SET v_today = DATE(p_client_time);

  -- 1) Auto-close any previous-day active sessions at 18:00 (Nairobi time)
  UPDATE LoginHistory lh
     SET lh.status = 2,
         lh.sessionEnd = CONCAT(DATE(lh.sessionStart), ' 18:00:00'),
         lh.duration = TIMESTAMPDIFF(MINUTE, lh.sessionStart, CONCAT(DATE(lh.sessionStart), ' 18:00:00'))
   WHERE lh.userId = p_user_id
     AND lh.status = 1
     AND DATE(lh.sessionStart) < v_today;

  -- 2) If an active session exists today, continue it
  SELECT id INTO v_active_id
    FROM LoginHistory
   WHERE userId = p_user_id
     AND status = 1
     AND DATE(sessionStart) = v_today
   ORDER BY sessionStart DESC
   LIMIT 1;

  IF v_active_id IS NOT NULL THEN
    SELECT 'ok' AS result, 'Continuing existing session' AS message, v_active_id AS sessionId;
    LEAVE proc;
  END IF;

  -- 3) If a completed session exists today, re-open it (continue)
  SELECT id INTO v_completed_id
    FROM LoginHistory
   WHERE userId = p_user_id
     AND status = 2
     AND DATE(sessionStart) = v_today
   ORDER BY sessionStart DESC
   LIMIT 1;

  IF v_completed_id IS NOT NULL THEN
    UPDATE LoginHistory
       SET status = 1,
           sessionEnd = NULL,
           duration = 0
     WHERE id = v_completed_id;

    SELECT 'ok' AS result, 'Continuing today\'s session' AS message, v_completed_id AS sessionId;
    LEAVE proc;
  END IF;

  -- 4) Otherwise create a new session
  INSERT INTO LoginHistory (userId, timezone, duration, status, sessionEnd, sessionStart)
  VALUES (p_user_id, 'Africa/Nairobi', 0, 1, NULL, p_client_time);

  SELECT 'ok' AS result, 'Successfully clocked in' AS message, LAST_INSERT_ID() AS sessionId;

END$$

CREATE OR REPLACE PROCEDURE sp_clock_out(
  IN p_user_id INT,
  IN p_client_time DATETIME -- expected in Africa/Nairobi local time
)
BEGIN
  DECLARE v_today DATE;
  DECLARE v_session_id INT;
  DECLARE v_start DATETIME;
  DECLARE v_end DATETIME;
  DECLARE v_duration INT;

  SET v_today = DATE(p_client_time);

  -- 1) Find today\'s active session
  SELECT id, sessionStart
    INTO v_session_id, v_start
    FROM LoginHistory
   WHERE userId = p_user_id
     AND status = 1
     AND DATE(sessionStart) = v_today
   ORDER BY sessionStart DESC
   LIMIT 1;

  IF v_session_id IS NULL THEN
    SELECT 'fail' AS result, 'You are not currently clocked in.' AS message;
    LEAVE proc2;
  END IF;

  -- 2) Cap duration at 8 hours or 18:00 end time, whichever applies
  SET v_end = p_client_time;
  SET v_duration = TIMESTAMPDIFF(MINUTE, v_start, v_end);

  IF v_duration > 480 THEN
    SET v_end = CONCAT(DATE(v_start), ' 18:00:00');
    SET v_duration = TIMESTAMPDIFF(MINUTE, v_start, v_end);
  END IF;

  -- 3) Update session
  UPDATE LoginHistory
     SET status = 2,
         sessionEnd = v_end,
         duration = v_duration
   WHERE id = v_session_id;

  SELECT 'ok' AS result, 'Successfully clocked out' AS message, v_duration AS durationMinutes, v_session_id AS sessionId;

END$$

DELIMITER ;
