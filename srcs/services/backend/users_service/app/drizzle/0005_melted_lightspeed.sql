CREATE TABLE `friends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requester_id` int NOT NULL,
	`addressee_id` int NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `friends_id` PRIMARY KEY(`id`),
	CONSTRAINT `friends_requester_id_addressee_id_unique` UNIQUE(`requester_id`,`addressee_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `display_name` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` varchar(255) DEFAULT '/avatars/default.png';--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `is_online` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `last_seen_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `friends` ADD CONSTRAINT `friends_requester_id_users_id_fk` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `friends` ADD CONSTRAINT `friends_addressee_id_users_id_fk` FOREIGN KEY (`addressee_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;