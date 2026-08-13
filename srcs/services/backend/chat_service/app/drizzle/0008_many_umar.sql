CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel_id` int NOT NULL,
	`uploader_id` int NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`stored_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`size` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`),
	CONSTRAINT `files_stored_name_unique` UNIQUE(`stored_name`)
);
--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_channel_id_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON DELETE cascade ON UPDATE no action;