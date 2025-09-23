-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 22, 2025 at 10:35 PM
-- Server version: 10.6.23-MariaDB-cll-lve
-- PHP Version: 8.4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `impulsep_moonsun`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_category`
--

CREATE TABLE `account_category` (
  `id` int(3) NOT NULL,
  `name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `account_ledger`
--

CREATE TABLE `account_ledger` (
  `id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `debit` decimal(15,2) DEFAULT 0.00,
  `credit` decimal(15,2) DEFAULT 0.00,
  `running_balance` decimal(15,2) DEFAULT 0.00,
  `status` enum('in pay','confirmed') DEFAULT 'in pay',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `account_types`
--

CREATE TABLE `account_types` (
  `id` int(11) NOT NULL,
  `account_type` varchar(100) NOT NULL,
  `account_category` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `allowed_ips`
--

CREATE TABLE `allowed_ips` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `purchase_date` date NOT NULL,
  `purchase_value` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_assignments`
--

CREATE TABLE `asset_assignments` (
  `id` int(11) NOT NULL,
  `asset_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `assigned_date` date NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('active','returned','lost','damaged') DEFAULT 'active',
  `returned_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_types`
--

CREATE TABLE `asset_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `checkin_time` datetime DEFAULT NULL,
  `checkout_time` datetime DEFAULT NULL,
  `checkin_latitude` decimal(10,8) DEFAULT NULL,
  `checkin_longitude` decimal(11,8) DEFAULT NULL,
  `checkout_latitude` decimal(10,8) DEFAULT NULL,
  `checkout_longitude` decimal(11,8) DEFAULT NULL,
  `checkin_location` varchar(255) DEFAULT NULL,
  `checkout_location` varchar(255) DEFAULT NULL,
  `checkin_ip` varchar(45) DEFAULT NULL,
  `checkout_ip` varchar(45) DEFAULT NULL,
  `status` int(2) NOT NULL DEFAULT 1,
  `type` enum('regular','overtime','leave') NOT NULL DEFAULT 'regular',
  `total_hours` decimal(5,2) DEFAULT NULL,
  `overtime_hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `is_late` tinyint(1) NOT NULL DEFAULT 0,
  `late_minutes` int(11) NOT NULL DEFAULT 0,
  `device_info` text DEFAULT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'UTC',
  `shift_start` time DEFAULT NULL,
  `shift_end` time DEFAULT NULL,
  `is_early_departure` tinyint(1) NOT NULL DEFAULT 0,
  `early_departure_minutes` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `corrected` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Category`
--

CREATE TABLE `Category` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CategoryPriceOption`
--

CREATE TABLE `CategoryPriceOption` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `value` decimal(15,2) NOT NULL,
  `value_tzs` decimal(15,2) NOT NULL,
  `value_ngn` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `id` int(11) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_code` varchar(20) NOT NULL,
  `account_type` int(11) NOT NULL,
  `parent_account_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts1`
--

CREATE TABLE `chart_of_accounts1` (
  `id` int(11) NOT NULL,
  `account_code` varchar(20) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_type` enum('asset','liability','equity','revenue','expense') NOT NULL,
  `parent_account_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `readAt` timestamp NULL DEFAULT NULL,
  `message` text NOT NULL,
  `messageType` varchar(50) DEFAULT 'text',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_rooms`
--

CREATE TABLE `chat_rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_group` tinyint(1) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_room_members`
--

CREATE TABLE `chat_room_members` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ClientAssignment`
--

CREATE TABLE `ClientAssignment` (
  `id` int(11) NOT NULL,
  `outletId` int(11) NOT NULL,
  `salesRepId` int(11) NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` varchar(191) NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Clients`
--

CREATE TABLE `Clients` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `password` varchar(119) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `balance` decimal(11,2) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `region_id` int(11) NOT NULL,
  `region` varchar(191) NOT NULL,
  `route_id` int(11) DEFAULT NULL,
  `route_name` varchar(191) DEFAULT NULL,
  `route_id_update` int(11) DEFAULT NULL,
  `route_name_update` varchar(100) DEFAULT NULL,
  `contact` varchar(191) NOT NULL,
  `tax_pin` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `client_type` int(11) DEFAULT NULL,
  `outlet_account` int(11) DEFAULT NULL,
  `payment_terms` int(11) NOT NULL,
  `credit_limit` decimal(11,2) NOT NULL,
  `countryId` int(11) NOT NULL,
  `added_by` int(11) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients_prospects`
--

CREATE TABLE `clients_prospects` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `balance` decimal(11,2) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `region_id` int(11) NOT NULL,
  `region` varchar(191) NOT NULL,
  `route_id` int(11) DEFAULT NULL,
  `route_name` varchar(191) DEFAULT NULL,
  `route_id_update` int(11) DEFAULT NULL,
  `route_name_update` varchar(100) DEFAULT NULL,
  `contact` varchar(191) NOT NULL,
  `tax_pin` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `client_type` int(11) DEFAULT NULL,
  `outlet_account` int(11) DEFAULT NULL,
  `payment_terms` int(11) NOT NULL,
  `credit_limit` decimal(11,2) NOT NULL,
  `countryId` int(11) NOT NULL,
  `added_by` int(11) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_ledger`
--

CREATE TABLE `client_ledger` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `description` text NOT NULL,
  `reference_type` varchar(20) NOT NULL,
  `reference_id` int(11) NOT NULL,
  `reference` varchar(200) NOT NULL,
  `debit` decimal(15,2) DEFAULT 0.00,
  `credit` decimal(15,2) DEFAULT 0.00,
  `running_balance` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_payments`
--

CREATE TABLE `client_payments` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `account_id` int(11) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Country`
--

CREATE TABLE `Country` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `status` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `credit_notes`
--

CREATE TABLE `credit_notes` (
  `id` int(11) NOT NULL,
  `credit_note_number` varchar(50) NOT NULL,
  `client_id` int(11) NOT NULL,
  `original_invoice_id` int(11) DEFAULT NULL,
  `credit_note_date` date NOT NULL,
  `subtotal` decimal(11,2) NOT NULL,
  `tax_amount` decimal(11,2) NOT NULL,
  `net_price` decimal(11,2) NOT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `reason` text NOT NULL,
  `status` enum('draft','issued','cancelled') DEFAULT 'draft',
  `my_status` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `received_by` int(11) NOT NULL,
  `received_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `credit_note_items`
--

CREATE TABLE `credit_note_items` (
  `id` int(11) NOT NULL,
  `credit_note_id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `tax_amount` decimal(11,2) NOT NULL,
  `subtotal` decimal(11,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `net_price` decimal(11,2) NOT NULL,
  `reason` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `customer_code` varchar(20) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `payment_terms` int(11) DEFAULT 30,
  `credit_limit` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `country_id` int(11) DEFAULT NULL,
  `region_id` int(11) DEFAULT NULL,
  `route_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `distributors_targets`
--

CREATE TABLE `distributors_targets` (
  `id` int(11) NOT NULL,
  `sales_rep_id` int(11) NOT NULL,
  `vapes_targets` int(11) DEFAULT 0,
  `pouches_targets` int(11) DEFAULT 0,
  `new_outlets_targets` int(11) DEFAULT 0,
  `target_month` varchar(7) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `start_date` date NOT NULL,
  `end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_categories`
--

CREATE TABLE `document_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_contracts`
--

CREATE TABLE `employee_contracts` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `renewed_from` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE `employee_documents` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_warnings`
--

CREATE TABLE `employee_warnings` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `issued_by` varchar(100) DEFAULT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_details`
--

CREATE TABLE `expense_details` (
  `id` int(11) NOT NULL,
  `journal_entry_id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_items`
--

CREATE TABLE `expense_items` (
  `id` int(11) NOT NULL,
  `journal_entry_id` int(11) NOT NULL,
  `expense_account_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `tax_type` enum('16%','zero_rated','exempted') DEFAULT '16%',
  `total_amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_payments`
--

CREATE TABLE `expense_payments` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `payment_number` varchar(200) NOT NULL,
  `journal_entry_id` int(11) NOT NULL,
  `expense_detail_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('cash','check','bank_transfer','credit_card','mobile_money') NOT NULL,
  `account_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `currency` varchar(50) NOT NULL,
  `status` enum('pending','confirmed','cancelled') DEFAULT 'confirmed',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faulty_products_items`
--

CREATE TABLE `faulty_products_items` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `fault_comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faulty_products_reports`
--

CREATE TABLE `faulty_products_reports` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `reported_by` int(11) NOT NULL,
  `reported_date` date NOT NULL,
  `status` enum('Reported','Under Investigation','Being Repaired','Repaired','Replaced','Disposed','Closed') DEFAULT 'Reported',
  `assigned_to` int(11) DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `document_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `FeedbackReport`
--

CREATE TABLE `FeedbackReport` (
  `reportId` int(11) DEFAULT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `clientId` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `report_date` date GENERATED ALWAYS AS (cast(`createdAt` as date)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hr_calendar_tasks`
--

CREATE TABLE `hr_calendar_tasks` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed') DEFAULT 'Pending',
  `assigned_to` varchar(100) DEFAULT NULL,
  `text` varchar(255) NOT NULL,
  `recurrence_type` enum('none','daily','weekly','monthly') DEFAULT 'none',
  `recurrence_end` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_receipts`
--

CREATE TABLE `inventory_receipts` (
  `id` int(11) NOT NULL,
  `purchase_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `received_quantity` int(11) NOT NULL,
  `received_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `received_by` int(11) NOT NULL DEFAULT 1,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `amount_in` decimal(12,2) DEFAULT 0.00,
  `amount_out` decimal(12,2) DEFAULT 0.00,
  `balance` decimal(12,2) DEFAULT 0.00,
  `date_received` datetime NOT NULL,
  `store_id` int(11) NOT NULL,
  `unit_cost` decimal(11,2) NOT NULL,
  `total_cost` decimal(11,2) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transfers`
--

CREATE TABLE `inventory_transfers` (
  `id` int(11) NOT NULL,
  `from_store_id` int(11) NOT NULL,
  `to_store_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `transfer_date` datetime NOT NULL,
  `staff_id` int(11) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entries`
--

CREATE TABLE `journal_entries` (
  `id` int(11) NOT NULL,
  `entry_number` varchar(20) NOT NULL,
  `entry_date` date NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `total_debit` decimal(15,2) DEFAULT 0.00,
  `total_credit` decimal(15,2) DEFAULT 0.00,
  `status` enum('draft','posted','cancelled') DEFAULT 'draft',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entry_lines`
--

CREATE TABLE `journal_entry_lines` (
  `id` int(11) NOT NULL,
  `journal_entry_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `debit_amount` decimal(15,2) DEFAULT 0.00,
  `credit_amount` decimal(15,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `line_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `JourneyPlan`
--

CREATE TABLE `JourneyPlan` (
  `id` int(11) NOT NULL,
  `date` datetime(3) NOT NULL,
  `time` varchar(191) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `clientId` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `checkInTime` datetime(3) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `checkoutLatitude` double DEFAULT NULL,
  `checkoutLongitude` double DEFAULT NULL,
  `checkoutTime` datetime(3) DEFAULT NULL,
  `showUpdateLocation` tinyint(1) NOT NULL DEFAULT 1,
  `routeId` int(11) DEFAULT NULL,
  `createdAt` varchar(50) NOT NULL,
  `updatedAt` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `key_account_targets`
--

CREATE TABLE `key_account_targets` (
  `id` int(11) NOT NULL,
  `sales_rep_id` int(11) NOT NULL,
  `vapes_targets` int(11) DEFAULT 0,
  `pouches_targets` int(11) DEFAULT 0,
  `new_outlets_targets` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `target_month` varchar(7) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `LeaveRequestSummary`
--

CREATE TABLE `LeaveRequestSummary` (
  `id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `leave_type_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_half_day` tinyint(1) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `employee_type_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `applied_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `employee_name` varchar(255) DEFAULT NULL,
  `employee_email` varchar(255) DEFAULT NULL,
  `employee_phone` varchar(50) DEFAULT NULL,
  `leave_type_name` varchar(100) DEFAULT NULL,
  `leave_type_default_days` int(11) DEFAULT NULL,
  `approver_name` varchar(255) DEFAULT NULL,
  `total_days_requested` int(9) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leaves`
--

CREATE TABLE `leaves` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `leaveType` varchar(191) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `reason` varchar(191) NOT NULL,
  `attachment` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `year` int(4) NOT NULL,
  `total_days` int(11) NOT NULL DEFAULT 0,
  `used_days` int(11) NOT NULL DEFAULT 0,
  `remaining_days` int(11) NOT NULL DEFAULT 0,
  `carried_over_days` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `leave_type_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_half_day` tinyint(1) NOT NULL DEFAULT 0,
  `reason` varchar(255) DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `employee_type_id` int(11) DEFAULT NULL,
  `salesrep` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `applied_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `default_days` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `LoginHistory`
--

CREATE TABLE `LoginHistory` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `timezone` varchar(191) DEFAULT 'UTC',
  `duration` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT 0,
  `sessionEnd` varchar(191) DEFAULT NULL,
  `sessionStart` varchar(191) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `managers`
--

CREATE TABLE `managers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `managerType` enum('retail','distribution','key_account') NOT NULL,
  `managerTypeId` tinyint(3) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `country` varchar(100) DEFAULT NULL,
  `region_id` int(3) NOT NULL,
  `region` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `merchandise`
--

CREATE TABLE `merchandise` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `merchandise_assignments`
--

CREATE TABLE `merchandise_assignments` (
  `id` int(11) NOT NULL,
  `merchandise_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `quantity_assigned` int(11) NOT NULL,
  `date_assigned` date NOT NULL,
  `comment` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `merchandise_categories`
--

CREATE TABLE `merchandise_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `merchandise_ledger`
--

CREATE TABLE `merchandise_ledger` (
  `id` int(11) NOT NULL,
  `merchandise_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `transaction_type` enum('RECEIVE','ISSUE','ADJUSTMENT','TRANSFER') NOT NULL,
  `quantity` int(11) NOT NULL,
  `balance_after` int(11) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `reference_type` enum('STOCK_RECEIPT','STOCK_ISSUE','ADJUSTMENT','TRANSFER') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `merchandise_stock`
--

CREATE TABLE `merchandise_stock` (
  `id` int(11) NOT NULL,
  `merchandise_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `received_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `received_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `my_assets`
--

CREATE TABLE `my_assets` (
  `id` int(11) NOT NULL,
  `asset_code` varchar(50) NOT NULL,
  `asset_name` varchar(255) NOT NULL,
  `asset_type` varchar(100) NOT NULL,
  `purchase_date` date NOT NULL,
  `location` varchar(255) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `document_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `my_departments`
--

CREATE TABLE `my_departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `my_order`
--

CREATE TABLE `my_order` (
  `id` int(11) NOT NULL,
  `so_number` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `net_price` decimal(11,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rider_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` enum('draft','confirmed','shipped','delivered','cancelled','in payment','paid') DEFAULT 'draft',
  `my_status` tinyint(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `my_order_items`
--

CREATE TABLE `my_order_items` (
  `id` int(11) NOT NULL,
  `my_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `tax_amount` decimal(11,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `net_price` decimal(11,2) NOT NULL,
  `shipped_quantity` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `my_receipts`
--

CREATE TABLE `my_receipts` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `receipt_date` date NOT NULL,
  `document_path` varchar(500) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `NoticeBoard`
--

CREATE TABLE `NoticeBoard` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `countryId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `country_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(3) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `outlet_accounts`
--

CREATE TABLE `outlet_accounts` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `outlet_categories`
--

CREATE TABLE `outlet_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `out_of_office_requests`
--

CREATE TABLE `out_of_office_requests` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `reason` varchar(255) NOT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('pending','approved','declined') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Out of Office Request',
  `photo_url` int(255) NOT NULL,
  `approved_by` int(20) NOT NULL,
  `approved_at` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `payment_number` varchar(20) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `purchase_order_id` int(11) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('cash','check','bank_transfer','credit_card') NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `account_id` int(11) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` enum('in pay','confirmed') DEFAULT 'in pay'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_history`
--

CREATE TABLE `payroll_history` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `pay_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Product`
--

CREATE TABLE `Product` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category_id` int(11) NOT NULL,
  `category` varchar(191) NOT NULL,
  `unit_cost` decimal(11,2) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `currentStock` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `clientId` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `unit_cost_ngn` decimal(11,2) DEFAULT NULL,
  `unit_cost_tzs` decimal(11,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ProductReport`
--

CREATE TABLE `ProductReport` (
  `reportId` int(11) NOT NULL,
  `productName` varchar(191) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `clientId` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_code` varchar(20) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `unit_of_measure` varchar(20) DEFAULT 'PCS',
  `cost_price` decimal(10,2) DEFAULT 0.00,
  `selling_price` decimal(10,2) DEFAULT 0.00,
  `tax_type` enum('16%','zero_rated','exempted') DEFAULT '16%',
  `reorder_level` int(11) DEFAULT 0,
  `current_stock` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image_url` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_returns`
--

CREATE TABLE `product_returns` (
  `id` int(11) NOT NULL,
  `salesrepId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('pending','approved','rejected','processed') DEFAULT 'pending',
  `imageUrl` varchar(500) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL,
  `po_number` varchar(20) NOT NULL,
  `invoice_number` varchar(200) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `status` enum('draft','sent','received','cancelled') DEFAULT 'draft',
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `amount_paid` decimal(11,2) NOT NULL,
  `balance` decimal(11,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL,
  `purchase_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `received_quantity` int(11) DEFAULT 0,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `tax_type` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` int(11) NOT NULL,
  `receipt_number` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `invoice_number` int(50) NOT NULL,
  `sales_order_id` int(11) DEFAULT NULL,
  `receipt_date` date NOT NULL,
  `payment_method` enum('cash','check','bank_transfer','credit_card') NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('draft','in pay','confirmed','cancelled') DEFAULT 'draft',
  `account_id` int(11) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Regions`
--

CREATE TABLE `Regions` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `countryId` int(11) NOT NULL,
  `status` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retail_targets`
--

CREATE TABLE `retail_targets` (
  `id` int(11) NOT NULL,
  `sales_rep_id` int(11) NOT NULL,
  `vapes_targets` int(11) DEFAULT 0,
  `pouches_targets` int(11) DEFAULT 0,
  `new_outlets_targets` int(11) DEFAULT 0,
  `target_month` varchar(7) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `start_date` date NOT NULL,
  `end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Riders`
--

CREATE TABLE `Riders` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `contact` varchar(191) NOT NULL,
  `id_number` varchar(191) NOT NULL,
  `company_id` int(11) NOT NULL,
  `company` varchar(191) NOT NULL,
  `status` int(11) DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `device_id` varchar(191) DEFAULT NULL,
  `device_name` varchar(191) DEFAULT NULL,
  `device_status` varchar(191) DEFAULT NULL,
  `token` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `riders_company`
--

CREATE TABLE `riders_company` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `routes`
--

CREATE TABLE `routes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `region` int(11) NOT NULL,
  `region_name` varchar(100) NOT NULL,
  `country_id` int(11) NOT NULL,
  `country_name` varchar(100) NOT NULL,
  `sales_rep_id` int(11) NOT NULL,
  `sales_rep_name` varchar(100) NOT NULL,
  `leader_id` int(11) NOT NULL,
  `leader_name` varchar(20) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesclient_payment`
--

CREATE TABLE `salesclient_payment` (
  `id` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `amount` double NOT NULL,
  `invoicefileUrl` varchar(191) DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` varchar(191) DEFAULT NULL,
  `payment_method` varchar(191) DEFAULT NULL,
  `salesrepId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SalesRep`
--

CREATE TABLE `SalesRep` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `countryId` int(11) NOT NULL,
  `country` varchar(191) NOT NULL,
  `region_id` int(11) NOT NULL,
  `region` varchar(191) NOT NULL,
  `route_id` int(11) NOT NULL,
  `route` varchar(100) NOT NULL,
  `route_id_update` int(11) NOT NULL,
  `route_name_update` varchar(100) NOT NULL,
  `visits_targets` int(3) NOT NULL,
  `new_clients` int(3) NOT NULL,
  `vapes_targets` int(11) NOT NULL,
  `pouches_targets` int(11) NOT NULL,
  `role` varchar(191) DEFAULT 'USER',
  `manager_type` int(11) NOT NULL,
  `status` int(11) DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `retail_manager` int(11) NOT NULL,
  `key_channel_manager` int(11) NOT NULL,
  `distribution_manager` int(11) NOT NULL,
  `photoUrl` varchar(191) DEFAULT '',
  `managerId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_orders`
--

CREATE TABLE `sales_orders` (
  `id` int(11) NOT NULL,
  `so_number` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `net_price` decimal(11,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `salesrep` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rider_id` int(11) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT '0000-00-00 00:00:00',
  `recepients_name` varchar(255) DEFAULT NULL,
  `recepients_contact` varchar(255) DEFAULT NULL,
  `dispatched_by` int(11) DEFAULT NULL,
  `status` enum('draft','confirmed','shipped','delivered','cancelled','in payment','paid') DEFAULT 'draft',
  `my_status` tinyint(3) NOT NULL,
  `received_into_stock` tinyint(1) NOT NULL DEFAULT 0,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `delivery_notes` varchar(255) NOT NULL,
  `received_by` int(11) NOT NULL,
  `received_at` datetime DEFAULT NULL,
  `delivery_image` varchar(500) DEFAULT NULL COMMENT 'Path/URL of the delivery photo captured by rider',
  `returned_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_order_items`
--

CREATE TABLE `sales_order_items` (
  `id` int(11) NOT NULL,
  `sales_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `tax_amount` decimal(11,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `tax_type` enum('16%','zero_rated','exempted') DEFAULT '16%',
  `net_price` decimal(11,2) NOT NULL,
  `unit_cost` decimal(11,2) NOT NULL,
  `cost_price` decimal(11,2) NOT NULL,
  `shipped_quantity` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_rep_managers`
--

CREATE TABLE `sales_rep_managers` (
  `id` int(11) NOT NULL,
  `sales_rep_id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `manager_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_rep_manager_assignments`
--

CREATE TABLE `sales_rep_manager_assignments` (
  `id` int(11) NOT NULL,
  `sales_rep_id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `manager_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_rep_targets`
--

CREATE TABLE `sales_rep_targets` (
  `id` int(11) NOT NULL,
  `sales_rep_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `vapes_target` int(11) DEFAULT 0,
  `pouches_target` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `empl_no` varchar(50) NOT NULL,
  `id_no` varchar(50) NOT NULL,
  `role` varchar(255) NOT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `business_email` varchar(255) DEFAULT NULL,
  `department_email` varchar(255) DEFAULT NULL,
  `salary` decimal(11,2) DEFAULT NULL,
  `employment_type` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` int(3) NOT NULL,
  `avatar_url` varchar(200) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_tasks`
--

CREATE TABLE `staff_tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `priority` varchar(50) NOT NULL DEFAULT 'medium',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `staff_id` int(11) NOT NULL,
  `assigned_by_id` int(11) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_takes`
--

CREATE TABLE `stock_takes` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `take_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_take_items`
--

CREATE TABLE `stock_take_items` (
  `id` int(11) NOT NULL,
  `stock_take_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `system_quantity` int(11) NOT NULL,
  `counted_quantity` int(11) NOT NULL,
  `difference` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `store_code` varchar(20) NOT NULL,
  `store_name` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `country_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_inventory`
--

CREATE TABLE `store_inventory` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `supplier_code` varchar(20) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `payment_terms` int(11) DEFAULT 30,
  `credit_limit` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier_ledger`
--

CREATE TABLE `supplier_ledger` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `debit` decimal(15,2) DEFAULT 0.00,
  `credit` decimal(15,2) DEFAULT 0.00,
  `running_balance` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `targets`
--

CREATE TABLE `targets` (
  `id` int(11) NOT NULL,
  `salesRepId` int(11) NOT NULL,
  `targetType` varchar(50) NOT NULL,
  `targetValue` int(11) NOT NULL,
  `currentValue` int(11) DEFAULT 0,
  `targetMonth` varchar(7) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `progress` int(11) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completedAt` datetime(3) DEFAULT NULL,
  `isCompleted` tinyint(1) NOT NULL DEFAULT 0,
  `priority` varchar(191) NOT NULL DEFAULT 'medium',
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `salesRepId` int(11) NOT NULL,
  `assignedById` int(11) DEFAULT NULL,
  `date` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `termination_letters`
--

CREATE TABLE `termination_letters` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `termination_date` date NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Token`
--

CREATE TABLE `Token` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `salesRepId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) NOT NULL,
  `blacklisted` tinyint(1) NOT NULL DEFAULT 0,
  `lastUsedAt` datetime(3) DEFAULT NULL,
  `tokenType` varchar(10) NOT NULL DEFAULT 'access'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UpliftSale`
--

CREATE TABLE `UpliftSale` (
  `id` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `totalAmount` double NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UpliftSaleItem`
--

CREATE TABLE `UpliftSaleItem` (
  `id` int(11) NOT NULL,
  `upliftSaleId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` double NOT NULL,
  `total` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','user','rider') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `avatar_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_devices`
--

CREATE TABLE `user_devices` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `device_id` varchar(100) NOT NULL,
  `device_name` varchar(100) DEFAULT NULL,
  `device_type` enum('android','ios','web') NOT NULL,
  `device_model` varchar(100) DEFAULT NULL,
  `os_version` varchar(50) DEFAULT NULL,
  `app_version` varchar(20) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `last_used` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User device registration for attendance security. is_active: 0=pending approval, 1=approved';

-- --------------------------------------------------------

--
-- Table structure for table `versions`
--

CREATE TABLE `versions` (
  `id` int(11) NOT NULL,
  `version` varchar(20) NOT NULL,
  `build_number` int(11) NOT NULL,
  `min_required_version` varchar(20) DEFAULT '1.0.0',
  `force_update` tinyint(1) DEFAULT 0,
  `update_message` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `VisibilityReport`
--

CREATE TABLE `VisibilityReport` (
  `reportId` int(11) DEFAULT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `clientId` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `report_date` date GENERATED ALWAYS AS (cast(`createdAt` as date)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warning_letters`
--

CREATE TABLE `warning_letters` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `warning_date` date NOT NULL,
  `warning_type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_category`
--
ALTER TABLE `account_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `account_ledger`
--
ALTER TABLE `account_ledger`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `account_types`
--
ALTER TABLE `account_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `allowed_ips`
--
ALTER TABLE `allowed_ips`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_ip_address` (`ip_address`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `asset_assignments`
--
ALTER TABLE `asset_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_asset_id` (`asset_id`),
  ADD KEY `idx_staff_id` (`staff_id`),
  ADD KEY `idx_assigned_date` (`assigned_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_asset_staff` (`asset_id`,`staff_id`);

--
-- Indexes for table `asset_types`
--
ALTER TABLE `asset_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_staff_date` (`staff_id`,`date`),
  ADD KEY `idx_staff_id` (`staff_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_checkin_time` (`checkin_time`),
  ADD KEY `idx_checkout_time` (`checkout_time`),
  ADD KEY `idx_staff_date_range` (`staff_id`,`date`),
  ADD KEY `idx_attendance_staff_status` (`staff_id`,`status`),
  ADD KEY `idx_attendance_date_status` (`date`,`status`),
  ADD KEY `idx_attendance_created_at` (`created_at`);

--
-- Indexes for table `Category`
--
ALTER TABLE `Category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `CategoryPriceOption`
--
ALTER TABLE `CategoryPriceOption`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chart_of_accounts1`
--
ALTER TABLE `chart_of_accounts1`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_code` (`account_code`),
  ADD KEY `parent_account_id` (`parent_account_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `chat_room_members`
--
ALTER TABLE `chat_room_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `ClientAssignment`
--
ALTER TABLE `ClientAssignment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ClientAssignment_outletId_salesRepId_key` (`outletId`,`salesRepId`),
  ADD KEY `ClientAssignment_salesRepId_idx` (`salesRepId`),
  ADD KEY `ClientAssignment_outletId_idx` (`outletId`);

--
-- Indexes for table `Clients`
--
ALTER TABLE `Clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Clients_countryId_fkey` (`countryId`),
  ADD KEY `Clients_countryId_status_route_id_idx` (`countryId`,`status`,`route_id`);

--
-- Indexes for table `clients_prospects`
--
ALTER TABLE `clients_prospects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Clients_countryId_fkey` (`countryId`),
  ADD KEY `Clients_countryId_status_route_id_idx` (`countryId`,`status`,`route_id`);

--
-- Indexes for table `client_ledger`
--
ALTER TABLE `client_ledger`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_client_ledger_client` (`client_id`);

--
-- Indexes for table `client_payments`
--
ALTER TABLE `client_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_client_payments_account` (`account_id`);

--
-- Indexes for table `Country`
--
ALTER TABLE `Country`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `credit_notes`
--
ALTER TABLE `credit_notes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `credit_note_number` (`credit_note_number`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_credit_note_date` (`credit_note_date`),
  ADD KEY `idx_credit_note_number` (`credit_note_number`);

--
-- Indexes for table `credit_note_items`
--
ALTER TABLE `credit_note_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_credit_note_id` (`credit_note_id`),
  ADD KEY `idx_invoice_id` (`invoice_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_code` (`customer_code`),
  ADD KEY `country_id` (`country_id`),
  ADD KEY `region_id` (`region_id`),
  ADD KEY `route_id` (`route_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `distributors_targets`
--
ALTER TABLE `distributors_targets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_rep_id` (`sales_rep_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_document_category` (`category_id`);

--
-- Indexes for table `document_categories`
--
ALTER TABLE `document_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `employee_contracts`
--
ALTER TABLE `employee_contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `renewed_from` (`renewed_from`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `employee_warnings`
--
ALTER TABLE `employee_warnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `expense_details`
--
ALTER TABLE `expense_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `journal_entry_id` (`journal_entry_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `expense_items`
--
ALTER TABLE `expense_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `journal_entry_id` (`journal_entry_id`);

--
-- Indexes for table `expense_payments`
--
ALTER TABLE `expense_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expense_detail_id` (`expense_detail_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `faulty_products_items`
--
ALTER TABLE `faulty_products_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report_id` (`report_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `faulty_products_reports`
--
ALTER TABLE `faulty_products_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_store_id` (`store_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_reported_date` (`reported_date`),
  ADD KEY `idx_reported_by` (`reported_by`),
  ADD KEY `idx_assigned_to` (`assigned_to`);

--
-- Indexes for table `FeedbackReport`
--
ALTER TABLE `FeedbackReport`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_feedback_client_date` (`clientId`,`report_date`),
  ADD KEY `FeedbackReport_userId_idx` (`userId`),
  ADD KEY `FeedbackReport_clientId_idx` (`clientId`),
  ADD KEY `FeedbackReport_reportId_idx` (`reportId`),
  ADD KEY `idx_feedback_report_report_id` (`reportId`),
  ADD KEY `idx_feedback_report_user_id` (`userId`),
  ADD KEY `idx_feedback_report_client_id` (`clientId`),
  ADD KEY `idx_feedback_report_created_at` (`createdAt`),
  ADD KEY `idx_feedback_report_composite` (`reportId`,`createdAt`);

--
-- Indexes for table `hr_calendar_tasks`
--
ALTER TABLE `hr_calendar_tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory_receipts`
--
ALTER TABLE `inventory_receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `fk_inventory_receipts_received_by` (`received_by`);

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `inventory_transfers`
--
ALTER TABLE `inventory_transfers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `from_store_id` (`from_store_id`),
  ADD KEY `to_store_id` (`to_store_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `entry_number` (`entry_number`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `journal_entry_id` (`journal_entry_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `JourneyPlan`
--
ALTER TABLE `JourneyPlan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `JourneyPlan_routeId_fkey` (`routeId`);

--
-- Indexes for table `key_account_targets`
--
ALTER TABLE `key_account_targets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_rep_id` (`sales_rep_id`);

--
-- Indexes for table `leaves`
--
ALTER TABLE `leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leaves_userId_fkey` (`userId`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employee_leave_type_year` (`employee_id`,`leave_type_id`,`year`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_leave_type_id` (`leave_type_id`),
  ADD KEY `idx_year` (`year`),
  ADD KEY `idx_employee_year` (`employee_id`,`year`),
  ADD KEY `idx_leave_balances_employee_type` (`employee_id`,`leave_type_id`),
  ADD KEY `idx_leave_balances_year_type` (`year`,`leave_type_id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employee_leave_overlap` (`employee_id`,`leave_type_id`,`start_date`,`end_date`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_leave_type_id` (`leave_type_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_end_date` (`end_date`),
  ADD KEY `idx_approved_by` (`approved_by`),
  ADD KEY `idx_employee_status` (`employee_id`,`status`),
  ADD KEY `idx_date_range` (`start_date`,`end_date`),
  ADD KEY `idx_leave_requests_employee_status_date` (`employee_id`,`status`,`start_date`),
  ADD KEY `idx_leave_requests_type_status` (`leave_type_id`,`status`),
  ADD KEY `idx_leave_requests_created_at` (`created_at`),
  ADD KEY `leave_requests_salesrep_id_fkey` (`salesrep`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `LoginHistory`
--
ALTER TABLE `LoginHistory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `LoginHistory_userId_idx` (`userId`),
  ADD KEY `LoginHistory_userId_status_idx` (`userId`,`status`),
  ADD KEY `LoginHistory_sessionStart_idx` (`sessionStart`),
  ADD KEY `LoginHistory_sessionEnd_idx` (`sessionEnd`),
  ADD KEY `LoginHistory_userId_sessionStart_idx` (`userId`,`sessionStart`),
  ADD KEY `LoginHistory_status_sessionStart_idx` (`status`,`sessionStart`);

--
-- Indexes for table `managers`
--
ALTER TABLE `managers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `merchandise`
--
ALTER TABLE `merchandise`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_merchandise_active` (`is_active`),
  ADD KEY `idx_merchandise_name` (`name`);

--
-- Indexes for table `merchandise_assignments`
--
ALTER TABLE `merchandise_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_merchandise_id` (`merchandise_id`),
  ADD KEY `idx_staff_id` (`staff_id`),
  ADD KEY `idx_date_assigned` (`date_assigned`);

--
-- Indexes for table `merchandise_categories`
--
ALTER TABLE `merchandise_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_merchandise_categories_active` (`is_active`);

--
-- Indexes for table `merchandise_ledger`
--
ALTER TABLE `merchandise_ledger`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_merchandise_ledger_merchandise` (`merchandise_id`),
  ADD KEY `idx_merchandise_ledger_store` (`store_id`),
  ADD KEY `idx_merchandise_ledger_type` (`transaction_type`),
  ADD KEY `idx_merchandise_ledger_date` (`created_at`);

--
-- Indexes for table `merchandise_stock`
--
ALTER TABLE `merchandise_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `idx_merchandise_stock_merchandise` (`merchandise_id`),
  ADD KEY `idx_merchandise_stock_active` (`is_active`),
  ADD KEY `idx_merchandise_stock_date` (`received_date`);

--
-- Indexes for table `my_assets`
--
ALTER TABLE `my_assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_code` (`asset_code`),
  ADD KEY `idx_asset_code` (`asset_code`),
  ADD KEY `idx_asset_type` (`asset_type`),
  ADD KEY `idx_supplier_id` (`supplier_id`),
  ADD KEY `idx_purchase_date` (`purchase_date`),
  ADD KEY `idx_location` (`location`);

--
-- Indexes for table `my_departments`
--
ALTER TABLE `my_departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `my_order`
--
ALTER TABLE `my_order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `so_number` (`so_number`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `fk_sales_orders_client` (`client_id`);

--
-- Indexes for table `my_order_items`
--
ALTER TABLE `my_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_order_id` (`my_order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `my_receipts`
--
ALTER TABLE `my_receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `NoticeBoard`
--
ALTER TABLE `NoticeBoard`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `outlet_accounts`
--
ALTER TABLE `outlet_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `outlet_categories`
--
ALTER TABLE `outlet_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `out_of_office_requests`
--
ALTER TABLE `out_of_office_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_number` (`payment_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `fk_payments_purchase_order` (`purchase_order_id`);

--
-- Indexes for table `payroll_history`
--
ALTER TABLE `payroll_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `Product`
--
ALTER TABLE `Product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Product_clientId_fkey` (`clientId`);

--
-- Indexes for table `ProductReport`
--
ALTER TABLE `ProductReport`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductReport_userId_idx` (`userId`),
  ADD KEY `ProductReport_clientId_idx` (`clientId`),
  ADD KEY `ProductReport_reportId_idx` (`reportId`),
  ADD KEY `idx_product_report_report_id` (`reportId`),
  ADD KEY `idx_product_report_user_id` (`userId`),
  ADD KEY `idx_product_report_client_id` (`clientId`),
  ADD KEY `idx_product_report_created_at` (`createdAt`),
  ADD KEY `idx_product_report_composite` (`reportId`,`createdAt`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_code` (`product_code`);

--
-- Indexes for table `product_returns`
--
ALTER TABLE `product_returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_salesrep_id` (`salesrepId`),
  ADD KEY `idx_product_id` (`productId`),
  ADD KEY `idx_client_id` (`clientId`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `po_number` (`po_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `fk_receipts_sales_order` (`sales_order_id`),
  ADD KEY `fk_receipts_client` (`client_id`);

--
-- Indexes for table `Regions`
--
ALTER TABLE `Regions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Regions_name_countryId_key` (`name`,`countryId`),
  ADD KEY `Regions_countryId_fkey` (`countryId`);

--
-- Indexes for table `retail_targets`
--
ALTER TABLE `retail_targets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_rep_id` (`sales_rep_id`);

--
-- Indexes for table `Riders`
--
ALTER TABLE `Riders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `riders_company`
--
ALTER TABLE `riders_company`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `salesclient_payment`
--
ALTER TABLE `salesclient_payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ClientPayment_clientId_fkey` (`clientId`),
  ADD KEY `ClientPayment_userId_fkey` (`salesrepId`);

--
-- Indexes for table `SalesRep`
--
ALTER TABLE `SalesRep`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SalesRep_countryId_fkey` (`countryId`),
  ADD KEY `idx_status_role` (`status`,`role`),
  ADD KEY `idx_location` (`countryId`,`region_id`,`route_id`),
  ADD KEY `idx_manager` (`managerId`);

--
-- Indexes for table `sales_orders`
--
ALTER TABLE `sales_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `so_number` (`so_number`),
  ADD KEY `fk_sales_orders_client` (`client_id`),
  ADD KEY `salesrep_rel` (`salesrep`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_sales_orders_delivery_image` (`delivery_image`);

--
-- Indexes for table `sales_order_items`
--
ALTER TABLE `sales_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_order_id` (`sales_order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `sales_rep_managers`
--
ALTER TABLE `sales_rep_managers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_rep_id` (`sales_rep_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Indexes for table `sales_rep_manager_assignments`
--
ALTER TABLE `sales_rep_manager_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`sales_rep_id`,`manager_type`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Indexes for table `sales_rep_targets`
--
ALTER TABLE `sales_rep_targets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_sales_rep_year_month` (`sales_rep_id`,`year`,`month`),
  ADD KEY `idx_sales_rep_targets_sales_rep_year` (`sales_rep_id`,`year`),
  ADD KEY `idx_sales_rep_targets_year_month` (`year`,`month`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_staff_department` (`department_id`),
  ADD KEY `idx_staff_designation` (`designation`);

--
-- Indexes for table `staff_tasks`
--
ALTER TABLE `staff_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_staff_id` (`staff_id`),
  ADD KEY `idx_assigned_by_id` (`assigned_by_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`);

--
-- Indexes for table `stock_takes`
--
ALTER TABLE `stock_takes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `stock_take_items`
--
ALTER TABLE `stock_take_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_take_id` (`stock_take_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `store_code` (`store_code`),
  ADD KEY `country_re` (`country_id`);

--
-- Indexes for table `store_inventory`
--
ALTER TABLE `store_inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `store_id` (`store_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `supplier_code` (`supplier_code`);

--
-- Indexes for table `supplier_ledger`
--
ALTER TABLE `supplier_ledger`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `targets`
--
ALTER TABLE `targets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_salesRepId` (`salesRepId`),
  ADD KEY `idx_targetType` (`targetType`),
  ADD KEY `idx_targetMonth` (`targetMonth`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_assignedById_idx` (`assignedById`),
  ADD KEY `tasks_salesRepId_fkey` (`salesRepId`);

--
-- Indexes for table `termination_letters`
--
ALTER TABLE `termination_letters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `Token`
--
ALTER TABLE `Token`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Token_userId_fkey` (`salesRepId`),
  ADD KEY `idx_token_value` (`token`(64)),
  ADD KEY `idx_token_cleanup` (`expiresAt`,`blacklisted`),
  ADD KEY `idx_token_lookup` (`salesRepId`,`tokenType`,`blacklisted`,`expiresAt`);

--
-- Indexes for table `UpliftSale`
--
ALTER TABLE `UpliftSale`
  ADD PRIMARY KEY (`id`),
  ADD KEY `UpliftSale_clientId_fkey` (`clientId`),
  ADD KEY `UpliftSale_userId_fkey` (`userId`);

--
-- Indexes for table `UpliftSaleItem`
--
ALTER TABLE `UpliftSaleItem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `UpliftSaleItem_upliftSaleId_fkey` (`upliftSaleId`),
  ADD KEY `UpliftSaleItem_productId_fkey` (`productId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_devices`
--
ALTER TABLE `user_devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_device` (`user_id`,`device_id`),
  ADD KEY `idx_device_id` (`device_id`),
  ADD KEY `idx_user_active` (`user_id`,`is_active`),
  ADD KEY `idx_ip_address` (`ip_address`);

--
-- Indexes for table `versions`
--
ALTER TABLE `versions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `VisibilityReport`
--
ALTER TABLE `VisibilityReport`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_visibility_client_date` (`clientId`,`report_date`),
  ADD KEY `VisibilityReport_userId_idx` (`userId`),
  ADD KEY `VisibilityReport_clientId_idx` (`clientId`),
  ADD KEY `VisibilityReport_reportId_idx` (`reportId`),
  ADD KEY `idx_visibility_report_report_id` (`reportId`),
  ADD KEY `idx_visibility_report_user_id` (`userId`),
  ADD KEY `idx_visibility_report_client_id` (`clientId`),
  ADD KEY `idx_visibility_report_created_at` (`createdAt`),
  ADD KEY `idx_visibility_report_composite` (`reportId`,`createdAt`);

--
-- Indexes for table `warning_letters`
--
ALTER TABLE `warning_letters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_category`
--
ALTER TABLE `account_category`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_ledger`
--
ALTER TABLE `account_ledger`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_types`
--
ALTER TABLE `account_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `allowed_ips`
--
ALTER TABLE `allowed_ips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_assignments`
--
ALTER TABLE `asset_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_types`
--
ALTER TABLE `asset_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Category`
--
ALTER TABLE `Category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `CategoryPriceOption`
--
ALTER TABLE `CategoryPriceOption`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chart_of_accounts1`
--
ALTER TABLE `chart_of_accounts1`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_room_members`
--
ALTER TABLE `chat_room_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ClientAssignment`
--
ALTER TABLE `ClientAssignment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Clients`
--
ALTER TABLE `Clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clients_prospects`
--
ALTER TABLE `clients_prospects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_ledger`
--
ALTER TABLE `client_ledger`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_payments`
--
ALTER TABLE `client_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Country`
--
ALTER TABLE `Country`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `credit_notes`
--
ALTER TABLE `credit_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `credit_note_items`
--
ALTER TABLE `credit_note_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `distributors_targets`
--
ALTER TABLE `distributors_targets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_categories`
--
ALTER TABLE `document_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_contracts`
--
ALTER TABLE `employee_contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_warnings`
--
ALTER TABLE `employee_warnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_details`
--
ALTER TABLE `expense_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_items`
--
ALTER TABLE `expense_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_payments`
--
ALTER TABLE `expense_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faulty_products_items`
--
ALTER TABLE `faulty_products_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faulty_products_reports`
--
ALTER TABLE `faulty_products_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `FeedbackReport`
--
ALTER TABLE `FeedbackReport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hr_calendar_tasks`
--
ALTER TABLE `hr_calendar_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_receipts`
--
ALTER TABLE `inventory_receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_transfers`
--
ALTER TABLE `inventory_transfers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journal_entries`
--
ALTER TABLE `journal_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `JourneyPlan`
--
ALTER TABLE `JourneyPlan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `key_account_targets`
--
ALTER TABLE `key_account_targets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leaves`
--
ALTER TABLE `leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `LoginHistory`
--
ALTER TABLE `LoginHistory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `managers`
--
ALTER TABLE `managers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `merchandise`
--
ALTER TABLE `merchandise`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `merchandise_assignments`
--
ALTER TABLE `merchandise_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `merchandise_categories`
--
ALTER TABLE `merchandise_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `merchandise_ledger`
--
ALTER TABLE `merchandise_ledger`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `merchandise_stock`
--
ALTER TABLE `merchandise_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `my_assets`
--
ALTER TABLE `my_assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `my_departments`
--
ALTER TABLE `my_departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `my_order`
--
ALTER TABLE `my_order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `my_order_items`
--
ALTER TABLE `my_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `my_receipts`
--
ALTER TABLE `my_receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `NoticeBoard`
--
ALTER TABLE `NoticeBoard`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `outlet_accounts`
--
ALTER TABLE `outlet_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `outlet_categories`
--
ALTER TABLE `outlet_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `out_of_office_requests`
--
ALTER TABLE `out_of_office_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_history`
--
ALTER TABLE `payroll_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Product`
--
ALTER TABLE `Product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ProductReport`
--
ALTER TABLE `ProductReport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_returns`
--
ALTER TABLE `product_returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Regions`
--
ALTER TABLE `Regions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retail_targets`
--
ALTER TABLE `retail_targets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Riders`
--
ALTER TABLE `Riders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `riders_company`
--
ALTER TABLE `riders_company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `routes`
--
ALTER TABLE `routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesclient_payment`
--
ALTER TABLE `salesclient_payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SalesRep`
--
ALTER TABLE `SalesRep`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_orders`
--
ALTER TABLE `sales_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_order_items`
--
ALTER TABLE `sales_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_rep_managers`
--
ALTER TABLE `sales_rep_managers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_rep_manager_assignments`
--
ALTER TABLE `sales_rep_manager_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_rep_targets`
--
ALTER TABLE `sales_rep_targets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_tasks`
--
ALTER TABLE `staff_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_takes`
--
ALTER TABLE `stock_takes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_take_items`
--
ALTER TABLE `stock_take_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_inventory`
--
ALTER TABLE `store_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier_ledger`
--
ALTER TABLE `supplier_ledger`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `targets`
--
ALTER TABLE `targets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `termination_letters`
--
ALTER TABLE `termination_letters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Token`
--
ALTER TABLE `Token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UpliftSale`
--
ALTER TABLE `UpliftSale`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UpliftSaleItem`
--
ALTER TABLE `UpliftSaleItem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_devices`
--
ALTER TABLE `user_devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `versions`
--
ALTER TABLE `versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `VisibilityReport`
--
ALTER TABLE `VisibilityReport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warning_letters`
--
ALTER TABLE `warning_letters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `asset_assignments`
--
ALTER TABLE `asset_assignments`
  ADD CONSTRAINT `asset_assignments_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `my_assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `asset_assignments_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `asset_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `credit_notes`
--
ALTER TABLE `credit_notes`
  ADD CONSTRAINT `credit_notes_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `credit_notes_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `credit_note_items`
--
ALTER TABLE `credit_note_items`
  ADD CONSTRAINT `credit_note_items_ibfk_1` FOREIGN KEY (`credit_note_id`) REFERENCES `credit_notes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `credit_note_items_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `credit_note_items_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `fk_document_category` FOREIGN KEY (`category_id`) REFERENCES `document_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `expense_details`
--
ALTER TABLE `expense_details`
  ADD CONSTRAINT `expense_details_ibfk_1` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expense_details_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

--
-- Constraints for table `expense_items`
--
ALTER TABLE `expense_items`
  ADD CONSTRAINT `expense_items_ibfk_1` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense_payments`
--
ALTER TABLE `expense_payments`
  ADD CONSTRAINT `expense_payments_ibfk_1` FOREIGN KEY (`expense_detail_id`) REFERENCES `expense_details` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expense_payments_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`),
  ADD CONSTRAINT `expense_payments_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `LoginHistory`
--
ALTER TABLE `LoginHistory`
  ADD CONSTRAINT `LoginHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `SalesRep` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `merchandise`
--
ALTER TABLE `merchandise`
  ADD CONSTRAINT `merchandise_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `merchandise_categories` (`id`);

--
-- Constraints for table `merchandise_assignments`
--
ALTER TABLE `merchandise_assignments`
  ADD CONSTRAINT `merchandise_assignments_ibfk_1` FOREIGN KEY (`merchandise_id`) REFERENCES `merchandise` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `merchandise_assignments_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `merchandise_ledger`
--
ALTER TABLE `merchandise_ledger`
  ADD CONSTRAINT `merchandise_ledger_ibfk_1` FOREIGN KEY (`merchandise_id`) REFERENCES `merchandise` (`id`),
  ADD CONSTRAINT `merchandise_ledger_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`);

--
-- Constraints for table `merchandise_stock`
--
ALTER TABLE `merchandise_stock`
  ADD CONSTRAINT `merchandise_stock_ibfk_1` FOREIGN KEY (`merchandise_id`) REFERENCES `merchandise` (`id`),
  ADD CONSTRAINT `merchandise_stock_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`);

--
-- Constraints for table `product_returns`
--
ALTER TABLE `product_returns`
  ADD CONSTRAINT `fk_product_returns_client` FOREIGN KEY (`clientId`) REFERENCES `Clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_returns_product` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_returns_salesrep` FOREIGN KEY (`salesrepId`) REFERENCES `SalesRep` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sales_rep_targets`
--
ALTER TABLE `sales_rep_targets`
  ADD CONSTRAINT `sales_rep_targets_ibfk_1` FOREIGN KEY (`sales_rep_id`) REFERENCES `SalesRep` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `fk_staff_department` FOREIGN KEY (`department_id`) REFERENCES `my_departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `staff_tasks`
--
ALTER TABLE `staff_tasks`
  ADD CONSTRAINT `fk_staff_tasks_assigned_by` FOREIGN KEY (`assigned_by_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_staff_tasks_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `UpliftSale`
--
ALTER TABLE `UpliftSale`
  ADD CONSTRAINT `fk_uplift_sale_client` FOREIGN KEY (`clientId`) REFERENCES `Clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_uplift_sale_user` FOREIGN KEY (`userId`) REFERENCES `SalesRep` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `UpliftSaleItem`
--
ALTER TABLE `UpliftSaleItem`
  ADD CONSTRAINT `fk_uplift_sale_item_product` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_uplift_sale_item_uplift_sale` FOREIGN KEY (`upliftSaleId`) REFERENCES `UpliftSale` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
-- --------------------------------------------------------
-- Dashboard Summary Stored Procedure
-- Aggregates dashboard metrics in a single call
-- Signature: sp_dashboard_summary(IN p_user_id INT, IN p_date DATE)
-- Note: Requires tables present in this schema

DELIMITER $$
CREATE OR REPLACE PROCEDURE sp_dashboard_summary(IN p_user_id INT, IN p_date DATE)
BEGIN
  DECLARE v_date DATE;
  SET v_date = IFNULL(p_date, CURDATE());

  /* Cards schema: id, title, mainValue, subValue, type, status */

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
         '0 Stops' AS subValue,
         'journeyPlans',
         'normal'

  /* Clock In/Out */
  UNION ALL
  SELECT 'clockInOut',
         'Clock In/Out',
         CASE WHEN (
           SELECT lh.status FROM LoginHistory lh 
           WHERE lh.userId = p_user_id 
           ORDER BY CAST(lh.sessionStart AS DATETIME) DESC LIMIT 1
         ) = 1 THEN 'Clocked In' ELSE 'Clocked Out' END AS mainValue,
         COALESCE(
           (SELECT DATE_FORMAT(CAST(lh.sessionStart AS DATETIME), '%H:%i') FROM LoginHistory lh 
            WHERE lh.userId = p_user_id ORDER BY CAST(lh.sessionStart AS DATETIME) DESC LIMIT 1),
           'Not Started'
         ) AS subValue,
         'clockInOut',
         CASE WHEN (
           SELECT lh.status FROM LoginHistory lh 
           WHERE lh.userId = p_user_id 
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
