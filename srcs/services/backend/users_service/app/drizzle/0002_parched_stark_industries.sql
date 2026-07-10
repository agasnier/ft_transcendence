CREATE TABLE `jwt_refresh_token` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner_id` int NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `jwt_refresh_token_id` PRIMARY KEY(`id`)
);
