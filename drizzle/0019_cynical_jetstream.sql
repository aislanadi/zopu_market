CREATE TABLE `coupon_usages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`couponId` int NOT NULL,
	`userId` int NOT NULL,
	`offerId` int,
	`referralId` int,
	`originalAmount` decimal(10,2) NOT NULL,
	`discountAmount` decimal(10,2) NOT NULL,
	`finalAmount` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(50),
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupon_usages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`discountType` enum('PERCENTAGE','FIXED_AMOUNT') NOT NULL,
	`discountValue` decimal(10,2) NOT NULL,
	`maxDiscountAmount` decimal(10,2),
	`minPurchaseAmount` decimal(10,2),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`maxUsageTotal` int,
	`maxUsagePerUser` int DEFAULT 1,
	`currentUsageCount` int NOT NULL DEFAULT 0,
	`applicableOfferIds` text,
	`applicableCategoryIds` text,
	`applicablePaymentMethods` text,
	`firstPurchaseOnly` int NOT NULL DEFAULT 0,
	`excludedOfferIds` text,
	`status` enum('ACTIVE','INACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
