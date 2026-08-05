CREATE TABLE `discussion_pairs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel_id` int NOT NULL,
	`user_min_id` int NOT NULL,
	`user_max_id` int NOT NULL,
	CONSTRAINT `discussion_pairs_id` PRIMARY KEY(`id`),
	CONSTRAINT `discussion_pairs_user_min_id_user_max_id_unique` UNIQUE(`user_min_id`,`user_max_id`)
);
--> statement-breakpoint
ALTER TABLE `discussion_pairs` ADD CONSTRAINT `discussion_pairs_channel_id_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON DELETE cascade ON UPDATE no action;