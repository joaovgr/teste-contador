CREATE TABLE `parametros_sistema` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chave` varchar(100) NOT NULL,
	`valor` text NOT NULL,
	`descricao` varchar(255),
	`categoria` varchar(50) NOT NULL DEFAULT 'geral',
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`atualizado_por` varchar(120),
	CONSTRAINT `parametros_sistema_id` PRIMARY KEY(`id`),
	CONSTRAINT `parametros_sistema_chave_unique` UNIQUE(`chave`)
);
--> statement-breakpoint
CREATE TABLE `permissoes_perfil` (
	`id` int AUTO_INCREMENT NOT NULL,
	`perfil` enum('contador','assistente') NOT NULL,
	`modulo` varchar(60) NOT NULL,
	`permitido` boolean NOT NULL DEFAULT true,
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissoes_perfil_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `triagens` ADD `desconto_tipo` enum('nenhum','percentual','valor') DEFAULT 'nenhum';--> statement-breakpoint
ALTER TABLE `triagens` ADD `desconto_valor` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `triagens` ADD `honorario_com_desconto` decimal(10,2);