CREATE TABLE `license_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`notificationType` enum('90_DAYS','60_DAYS','30_DAYS','EXPIRED') NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`licenseExpiryDate` date NOT NULL,
	CONSTRAINT `license_notifications_id` PRIMARY KEY(`id`)
);
