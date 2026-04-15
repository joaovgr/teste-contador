CREATE TABLE `cliente_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`categoria` enum('rg_cpf','comprovante_residencia','informe_rendimentos','deducoes','bens_direitos','renda_variavel','cripto','exterior','outros','recibo_anterior') NOT NULL,
	`nome_arquivo` varchar(255) NOT NULL,
	`nome_original` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`tamanho` int NOT NULL,
	`url_s3` text NOT NULL,
	`file_key` varchar(500) NOT NULL,
	`status_revisao` enum('aguardando','aprovado','rejeitado') NOT NULL DEFAULT 'aguardando',
	`observacao_contador` text,
	`lido` boolean NOT NULL DEFAULT false,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cliente_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portal_mensagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`remetente` enum('contador','cliente') NOT NULL,
	`mensagem` text NOT NULL,
	`lida` boolean NOT NULL DEFAULT false,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portal_mensagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portal_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`token` varchar(12) NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp,
	`ultimo_acesso` timestamp,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portal_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `portal_tokens_token_unique` UNIQUE(`token`)
);
