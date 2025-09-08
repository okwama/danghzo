-- Create product_returns table
CREATE TABLE `product_returns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_salesrep_id` (`salesrepId`),
  KEY `idx_product_id` (`productId`),
  KEY `idx_client_id` (`clientId`),
  KEY `idx_date` (`date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_product_returns_salesrep` FOREIGN KEY (`salesrepId`) REFERENCES `SalesRep` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_returns_product` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_returns_client` FOREIGN KEY (`clientId`) REFERENCES `Clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
