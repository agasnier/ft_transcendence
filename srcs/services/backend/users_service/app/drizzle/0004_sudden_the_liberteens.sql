CREATE TABLE `two_factor` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner_id` int NOT NULL,
	`secret` varchar(255) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	CONSTRAINT `two_factor_id` PRIMARY KEY(`id`),
	CONSTRAINT `two_factor_owner_id_unique` UNIQUE(`owner_id`)
);
