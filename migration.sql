-- ======================================================
-- MIGRATION: Buat tabel feeding_logs dan feeding_schedules
-- Database: smart_feeder
-- 
-- CARA PAKAI:
-- 1. Buka phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Pilih database "smart_feeder"
-- 3. Klik tab "SQL"
-- 4. Copy-paste seluruh isi file ini
-- 5. Klik "Go" / "Execute"
-- ======================================================

-- Tabel feeding_logs
CREATE TABLE IF NOT EXISTS `feeding_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` varchar(50) NOT NULL,
  `ai_decision` enum('Hungry','FULL') NOT NULL,
  `motor_status` enum('ON','OFF') NOT NULL,
  `started_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_feeding_logs_device_id` (`device_id`),
  KEY `idx_feeding_logs_started_at` (`started_at`),
  CONSTRAINT `fk_feeding_logs_device` FOREIGN KEY (`device_id`) REFERENCES `ai_devices` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel feeding_schedules
CREATE TABLE IF NOT EXISTS `feeding_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` varchar(50) NOT NULL,
  `schedule_code` varchar(20) NOT NULL,
  `schedule_type` enum('Interval Tetap','Berbasis AI') NOT NULL,
  `feeding_time` time NOT NULL,
  `active_days` json NOT NULL,
  `duration_seconds` int DEFAULT 45,
  `intensity_percent` int DEFAULT 80,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `schedule_code` (`schedule_code`),
  KEY `idx_feeding_schedules_device_id` (`device_id`),
  CONSTRAINT `fk_feeding_schedules_device` FOREIGN KEY (`device_id`) REFERENCES `ai_devices` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
