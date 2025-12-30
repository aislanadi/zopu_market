CREATE TABLE `clientLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`companyName` varchar(255),
	`message` text,
	`status` enum('new','contacted','converted','rejected') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clientLeads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userInvitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userInvitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `userInvitations_token_unique` UNIQUE(`token`)
);
