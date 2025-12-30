ALTER TABLE `offers` MODIFY COLUMN `status` enum('DRAFT','PENDING_INTERVIEW','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE `offers` ADD `profitMargin` int;--> statement-breakpoint
ALTER TABLE `offers` ADD `negotiationNotes` text;