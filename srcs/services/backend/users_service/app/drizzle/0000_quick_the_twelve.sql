CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pseudo` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_pseudo_unique` UNIQUE(`pseudo`)
);
