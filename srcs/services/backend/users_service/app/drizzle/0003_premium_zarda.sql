ALTER TABLE `users` ADD `mail` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_mail_unique` UNIQUE(`mail`);