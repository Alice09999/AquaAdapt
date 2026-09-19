-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Sep 19, 2026 at 07:46 AM
-- Server version: 8.0.44
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_feeder`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_detections`
--

CREATE TABLE `ai_detections` (
  `id` bigint NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `status` enum('pakan_ada','pakan_habis') NOT NULL,
  `confidence` decimal(5,4) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `detected_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_detections`
--

INSERT INTO `ai_detections` (`id`, `device_id`, `status`, `confidence`, `image_path`, `detected_at`, `created_at`) VALUES
(1, 'AI-001', 'pakan_habis', 0.9600, NULL, '2026-09-19 14:00:00', '2026-09-19 07:37:50');

-- --------------------------------------------------------

--
-- Table structure for table `ai_devices`
--

CREATE TABLE `ai_devices` (
  `id` int NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `device_name` varchar(100) NOT NULL,
  `status` enum('online','offline') DEFAULT 'offline',
  `last_seen` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_devices`
--

INSERT INTO `ai_devices` (`id`, `device_id`, `device_name`, `status`, `last_seen`, `created_at`, `updated_at`) VALUES
(1, 'AI-001', 'AI Kamera Kolam 1', 'offline', NULL, '2026-09-19 07:44:25', '2026-09-19 07:44:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_detections`
--
ALTER TABLE `ai_detections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_devices`
--
ALTER TABLE `ai_devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_id` (`device_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_detections`
--
ALTER TABLE `ai_detections`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ai_devices`
--
ALTER TABLE `ai_devices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
