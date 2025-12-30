CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int,
	`offerId` int,
	`eventType` varchar(50) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
