ALTER TABLE `buyers` ADD `bitrixUrl` varchar(255);--> statement-breakpoint
ALTER TABLE `buyers` ADD `bitrixLicenseType` varchar(50);--> statement-breakpoint
ALTER TABLE `buyers` ADD `bitrixLicenseExpiry` date;--> statement-breakpoint
ALTER TABLE `buyers` ADD `bitrixLicenseStatus` enum('ATIVA','VENCENDO','VENCIDA','NAO_INFORMADA') DEFAULT 'NAO_INFORMADA';