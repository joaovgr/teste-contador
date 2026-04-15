import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  date,
  json,
} from "drizzle-orm/mysql-core";

// ─── USUÁRIOS DO SISTEMA (login interno com senha criptografada) ───────────────
export const systemUsers = mysqlTable("system_users", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  senhaHash: varchar("senha_hash", { length: 255 }).notNull(),
  perfil: mysqlEnum("perfil", ["admin", "contador", "assistente"]).default("contador").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
  ultimoLogin: timestamp("ultimo_login"),
});

// ─── USUÁRIOS OAUTH (Manus) ────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  senhaGovBr: varchar("senha_gov_br", { length: 100 }),
  faixa: mysqlEnum("faixa", ["essencial", "completo", "avancado", "estrategico"]).default("essencial"),
  honorarios: decimal("honorarios", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["a_fazer", "em_andamento", "feito", "pendente", "desistiu"]).default("a_fazer").notNull(),
  statusPagamento: mysqlEnum("status_pagamento", ["pendente", "pago", "parcial", "inadimplente"]).default("pendente").notNull(),
  responsavel: varchar("responsavel", { length: 120 }),
  anoBase: int("ano_base").default(2025),
  observacoes: text("observacoes"),
  orcamentoManual: boolean("orcamento_manual").default(false),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

// ─── TRIAGEM / MOTOR DE CÁLCULO ───────────────────────────────────────────────
export const triagens = mysqlTable("triagens", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").notNull(),
  possuiCNPJ: boolean("possui_cnpj").default(false),
  possuiImoveis: boolean("possui_imoveis").default(false),
  qtdImoveis: int("qtd_imoveis").default(0),
  possuiVeiculos: boolean("possui_veiculos").default(false),
  possuiInvestimentos: boolean("possui_investimentos").default(false),
  possuiExterior: boolean("possui_exterior").default(false),
  possuiCripto: boolean("possui_cripto").default(false),
  possuiRendaVariavel: boolean("possui_renda_variavel").default(false),
  possuiCarneLeao: boolean("possui_carne_leao").default(false),
  possuiLivroCaixa: boolean("possui_livro_caixa").default(false),
  possuiAluguel: boolean("possui_aluguel").default(false),
  possuiPensao: boolean("possui_pensao").default(false),
  possuiHeranca: boolean("possui_heranca").default(false),
  possuiDoacao: boolean("possui_doacao").default(false),
  possuiRetificacao: boolean("possui_retificacao").default(false),
  anosRetificacao: int("anos_retificacao").default(0),
  possuiMalhaFina: boolean("possui_malha_fina").default(false),
  possuiDependentes: boolean("possui_dependentes").default(false),
  qtdDependentes: int("qtd_dependentes").default(0),
  possuiDespMedicas: boolean("possui_desp_medicas").default(false),
  possuiDespEducacao: boolean("possui_desp_educacao").default(false),
  possuiPrevidPrivada: boolean("possui_previd_privada").default(false),
  possuiSocioEmpresa: boolean("possui_socio_empresa").default(false),
  qtdEmpresas: int("qtd_empresas").default(0),
  possuiProLabore: boolean("possui_pro_labore").default(false),
  possuiDistribuicaoLucros: boolean("possui_distribuicao_lucros").default(false),
  urgencia: mysqlEnum("urgencia", ["normal", "7dias", "3dias", "24h"]).default("normal"),
  faixaCalculada: mysqlEnum("faixa_calculada", ["essencial", "completo", "avancado", "estrategico"]).default("essencial"),
  honorarioBase: decimal("honorario_base", { precision: 10, scale: 2 }),
  totalAdicionais: decimal("total_adicionais", { precision: 10, scale: 2 }),
  multiplicadorUrgencia: decimal("multiplicador_urgencia", { precision: 5, scale: 2 }).default("1.00"),
  honorarioFinal: decimal("honorario_final", { precision: 10, scale: 2 }),
  // Campos de desconto (novos)
  descontoTipo: mysqlEnum("desconto_tipo", ["nenhum", "percentual", "valor"]).default("nenhum"),
  descontoValor: decimal("desconto_valor", { precision: 10, scale: 2 }).default("0.00"),
  honorarioComDesconto: decimal("honorario_com_desconto", { precision: 10, scale: 2 }),
  requerOrcamentoManual: boolean("requer_orcamento_manual").default(false),
  observacoesCalculo: text("observacoes_calculo"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// ─── PROPOSTAS COMERCIAIS ─────────────────────────────────────────────────────
export const propostas = mysqlTable("propostas", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").notNull(),
  triagemId: int("triagem_id"),
  numero: varchar("numero", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["rascunho", "enviada", "aceita", "recusada", "expirada"]).default("rascunho").notNull(),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }),
  descricaoServicos: text("descricao_servicos"),
  condicoesComerciais: text("condicoes_comerciais"),
  validadeAte: date("validade_ate"),
  dataEnvio: timestamp("data_envio"),
  dataAceite: timestamp("data_aceite"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

// ─── CONTROLE DE DOCUMENTOS ───────────────────────────────────────────────────
export const documentos = mysqlTable("documentos", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").notNull(),
  tipo: mysqlEnum("tipo", [
    "rg_cpf", "comprovante_residencia", "informe_rendimentos",
    "deducoes", "bens_direitos", "renda_variavel",
    "cripto", "exterior", "outros", "recibo_anterior"
  ]).notNull(),
  status: mysqlEnum("status", ["pendente", "recebido", "dispensado"]).default("pendente").notNull(),
  observacao: text("observacao"),
  dataRecebimento: timestamp("data_recebimento"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// ─── COBRANÇAS ────────────────────────────────────────────────────────────────
export const cobrancas = mysqlTable("cobrancas", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  dataVencimento: date("data_vencimento"),
  dataPagamento: timestamp("data_pagamento"),
  status: mysqlEnum("status", ["pendente", "pago", "atrasado", "negociando", "inadimplente"]).default("pendente").notNull(),
  acaoCobranca: mysqlEnum("acao_cobranca", ["nenhuma", "1a_cobranca", "2a_cobranca", "3a_cobranca", "negociacao", "juridico"]).default("nenhuma"),
  observacao: text("observacao"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

// ─── PORTAL DO CLIENTE — TOKENS DE ACESSO ─────────────────────────────────────
export const portalTokens = mysqlTable("portal_tokens", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").notNull(),
  token: varchar("token", { length: 12 }).notNull().unique(), // código de 8 chars gerado pelo contador
  ativo: boolean("ativo").default(true).notNull(),
  expiresAt: timestamp("expires_at"),                         // null = sem expiração
  ultimoAcesso: timestamp("ultimo_acesso"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// ─── PORTAL DO CLIENTE — UPLOADS DE ARQUIVOS ──────────────────────────────────
export const clienteUploads = mysqlTable("cliente_uploads", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").notNull(),
  categoria: mysqlEnum("categoria", [
    "rg_cpf", "comprovante_residencia", "informe_rendimentos",
    "deducoes", "bens_direitos", "renda_variavel",
    "cripto", "exterior", "outros", "recibo_anterior"
  ]).notNull(),
  nomeArquivo: varchar("nome_arquivo", { length: 255 }).notNull(),
  nomeOriginal: varchar("nome_original", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  tamanho: int("tamanho").notNull(),                          // bytes
  urlS3: text("url_s3").notNull(),
  fileKey: varchar("file_key", { length: 500 }).notNull(),
  statusRevisao: mysqlEnum("status_revisao", ["aguardando", "aprovado", "rejeitado"]).default("aguardando").notNull(),
  observacaoContador: text("observacao_contador"),            // feedback do contador
  lido: boolean("lido").default(false).notNull(),             // contador visualizou?
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// ─── PORTAL DO CLIENTE — MENSAGENS DO CONTADOR ────────────────────────────────
export const portalMensagens = mysqlTable("portal_mensagens", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").notNull(),
  remetente: mysqlEnum("remetente", ["contador", "cliente"]).notNull(),
  mensagem: text("mensagem").notNull(),
  lida: boolean("lida").default(false).notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// ─── PARÂMETROS DO SISTEMA (configurações editáveis pelo admin) ───────────────
export const parametrosSistema = mysqlTable("parametros_sistema", {
  id: int("id").autoincrement().primaryKey(),
  chave: varchar("chave", { length: 100 }).notNull().unique(),
  valor: text("valor").notNull(),
  descricao: varchar("descricao", { length: 255 }),
  categoria: varchar("categoria", { length: 50 }).notNull().default("geral"),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
  atualizadoPor: varchar("atualizado_por", { length: 120 }),
});

// ─── PERMISSÕES POR PERFIL ────────────────────────────────────────────────────
export const permissoesPerfil = mysqlTable("permissoes_perfil", {
  id: int("id").autoincrement().primaryKey(),
  perfil: mysqlEnum("perfil", ["contador", "assistente"]).notNull(),
  modulo: varchar("modulo", { length: 60 }).notNull(),
  permitido: boolean("permitido").default(true).notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

// ─── TIPOS ────────────────────────────────────────────────────────────────────
export type SystemUser = typeof systemUsers.$inferSelect;
export type InsertSystemUser = typeof systemUsers.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;
export type Triagem = typeof triagens.$inferSelect;
export type InsertTriagem = typeof triagens.$inferInsert;
export type Proposta = typeof propostas.$inferSelect;
export type InsertProposta = typeof propostas.$inferInsert;
export type Documento = typeof documentos.$inferSelect;
export type InsertDocumento = typeof documentos.$inferInsert;
export type Cobranca = typeof cobrancas.$inferSelect;
export type InsertCobranca = typeof cobrancas.$inferInsert;
export type PortalToken = typeof portalTokens.$inferSelect;
export type InsertPortalToken = typeof portalTokens.$inferInsert;
export type ClienteUpload = typeof clienteUploads.$inferSelect;
export type InsertClienteUpload = typeof clienteUploads.$inferInsert;
export type PortalMensagem = typeof portalMensagens.$inferSelect;
export type InsertPortalMensagem = typeof portalMensagens.$inferInsert;
export type ParametroSistema = typeof parametrosSistema.$inferSelect;
export type PermissaoPerfil = typeof permissoesPerfil.$inferSelect;
