CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`orderId` int,
	`referralId` int,
	`reviewerName` varchar(255) NOT NULL,
	`reviewerCompany` varchar(255),
	`rating` int NOT NULL,
	`comment` text,
	`isVerified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `partners` ADD `logoUrl` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `description` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `ecosystems` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `rating` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `partners` ADD `totalProjects` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `partners` ADD `totalEarned` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `partners` ADD `avgResponseTime` int;