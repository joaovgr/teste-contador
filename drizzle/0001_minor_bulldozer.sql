CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(200) NOT NULL,
	`cpf` varchar(14),
	`email` varchar(320),
	`telefone` varchar(20),
	`senha_gov_br` varchar(100),
	`faixa` enum('essencial','completo','avancado','estrategico') DEFAULT 'essencial',
	`honorarios` decimal(10,2),
	`status` enum('a_fazer','em_andamento','feito','pendente','desistiu') NOT NULL DEFAULT 'a_fazer',
	`status_pagamento` enum('pendente','pago','parcial','inadimplente') NOT NULL DEFAULT 'pendente',
	`responsavel` varchar(120),
	`ano_base` int DEFAULT 2025,
	`observacoes` text,
	`orcamento_manual` boolean DEFAULT false,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cobrancas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`data_vencimento` date,
	`data_pagamento` timestamp,
	`status` enum('pendente','pago','atrasado','negociando','inadimplente') NOT NULL DEFAULT 'pendente',
	`acao_cobranca` enum('nenhuma','1a_cobranca','2a_cobranca','3a_cobranca','negociacao','juridico') DEFAULT 'nenhuma',
	`observacao` text,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cobrancas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`tipo` enum('rg_cpf','comprovante_residencia','informe_rendimentos','deducoes','bens_direitos','renda_variavel','cripto','exterior','outros','recibo_anterior') NOT NULL,
	`status` enum('pendente','recebido','dispensado') NOT NULL DEFAULT 'pendente',
	`observacao` text,
	`data_recebimento` timestamp,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `propostas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`triagem_id` int,
	`numero` varchar(20) NOT NULL,
	`status` enum('rascunho','enviada','aceita','recusada','expirada') NOT NULL DEFAULT 'rascunho',
	`valor_total` decimal(10,2),
	`descricao_servicos` text,
	`condicoes_comerciais` text,
	`validade_ate` date,
	`data_envio` timestamp,
	`data_aceite` timestamp,
	`observacoes` text,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `propostas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`senha_hash` varchar(255) NOT NULL,
	`perfil` enum('admin','contador','assistente') NOT NULL DEFAULT 'contador',
	`ativo` boolean NOT NULL DEFAULT true,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ultimo_login` timestamp,
	CONSTRAINT `system_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `triagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`possui_cnpj` boolean DEFAULT false,
	`possui_imoveis` boolean DEFAULT false,
	`qtd_imoveis` int DEFAULT 0,
	`possui_veiculos` boolean DEFAULT false,
	`possui_investimentos` boolean DEFAULT false,
	`possui_exterior` boolean DEFAULT false,
	`possui_cripto` boolean DEFAULT false,
	`possui_renda_variavel` boolean DEFAULT false,
	`possui_carne_leao` boolean DEFAULT false,
	`possui_livro_caixa` boolean DEFAULT false,
	`possui_aluguel` boolean DEFAULT false,
	`possui_pensao` boolean DEFAULT false,
	`possui_heranca` boolean DEFAULT false,
	`possui_doacao` boolean DEFAULT false,
	`possui_retificacao` boolean DEFAULT false,
	`anos_retificacao` int DEFAULT 0,
	`possui_malha_fina` boolean DEFAULT false,
	`possui_dependentes` boolean DEFAULT false,
	`qtd_dependentes` int DEFAULT 0,
	`possui_desp_medicas` boolean DEFAULT false,
	`possui_desp_educacao` boolean DEFAULT false,
	`possui_previd_privada` boolean DEFAULT false,
	`possui_socio_empresa` boolean DEFAULT false,
	`qtd_empresas` int DEFAULT 0,
	`possui_pro_labore` boolean DEFAULT false,
	`possui_distribuicao_lucros` boolean DEFAULT false,
	`urgencia` enum('normal','7dias','3dias','24h') DEFAULT 'normal',
	`faixa_calculada` enum('essencial','completo','avancado','estrategico') DEFAULT 'essencial',
	`honorario_base` decimal(10,2),
	`total_adicionais` decimal(10,2),
	`multiplicador_urgencia` decimal(5,2) DEFAULT '1.00',
	`honorario_final` decimal(10,2),
	`requer_orcamento_manual` boolean DEFAULT false,
	`observacoes_calculo` text,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `triagens_id` PRIMARY KEY(`id`)
);
