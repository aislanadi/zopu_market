CREATE TABLE `partnerCases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientCompany` varchar(255),
	`description` text NOT NULL,
	`results` text,
	`testimonial` text,
	`imageUrl` text,
	`displayOrder` int DEFAULT 0,
	`isPublished` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnerCases_id` PRIMARY KEY(`id`)
);
