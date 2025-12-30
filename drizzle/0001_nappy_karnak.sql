CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`entityType` varchar(100),
	`entityId` int,
	`oldValue` text,
	`newValue` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(20),
	`companyName` varchar(255),
	`painPoint` text,
	`attachments` text,
	`lgpdConsent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leadRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int,
	`categoryId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`saleMode` enum('CHECKOUT','LEAD_FORM','BOTH') NOT NULL,
	`offerType` enum('DIGITAL','SERVICE_STANDARD','SERVICE_COMPLEX','LICENSE') NOT NULL,
	`price` int,
	`splitEnabled` int NOT NULL DEFAULT 0,
	`zopuTakeRatePercent` int,
	`partnerSharePercent` int,
	`successFeePercent` int NOT NULL,
	`successFeeRuleNotes` text,
	`exclusiveBenefitText` text,
	`partnerAckHours` int DEFAULT 48,
	`statusUpdateDays` int DEFAULT 15,
	`icp` text,
	`promessa` text,
	`entregaveis` text,
	`cases` text,
	`faq` text,
	`ctaCopy` text,
	`imageUrl` text,
	`status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`buyerId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` int NOT NULL,
	`totalAmount` int NOT NULL,
	`zopuAmount` int,
	`partnerAmount` int,
	`splitApplied` int NOT NULL DEFAULT 0,
	`paymentStatus` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
	`paymentGatewayId` varchar(255),
	`refundReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`legalName` varchar(255),
	`mainCategoryId` int,
	`curationStatus` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`bitrixWebhookUrl` text,
	`bitrixToken` text,
	`bankAccount` text,
	`pixKey` varchar(255),
	`contactName` varchar(255),
	`contactEmail` varchar(320),
	`contactPhone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`partnerId` int NOT NULL,
	`leadRequestId` int,
	`gerenteId` int,
	`buyerCompany` varchar(255),
	`buyerContact` varchar(255),
	`origin` enum('ZOPU_MARKET','ASSISTED_REFERRAL','CAMPAIGN') NOT NULL DEFAULT 'ZOPU_MARKET',
	`status` enum('SENT','ACKED','IN_NEGOTIATION','WON','LOST','OVERDUE') NOT NULL DEFAULT 'SENT',
	`expectedValue` int,
	`wonValue` int,
	`successFeePercent` int NOT NULL,
	`successFeeExpected` int,
	`successFeeRealized` int,
	`partnerLeadId` varchar(255),
	`internalNotes` text,
	`ackDeadline` timestamp,
	`lastStatusUpdate` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','gerente_contas','parceiro','cliente') NOT NULL DEFAULT 'cliente';--> statement-breakpoint
ALTER TABLE `users` ADD `partnerId` int;