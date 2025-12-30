CREATE TABLE `serviceContracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`offerId` int NOT NULL,
	`partnerId` int NOT NULL,
	`contractDate` timestamp NOT NULL,
	`value` varchar(50),
	`period` varchar(100),
	`comments` text,
	`verified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serviceContracts_id` PRIMARY KEY(`id`)
);
