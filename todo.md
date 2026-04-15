# TODO — Sistema IRPF 2026 Contador SOS

## Infraestrutura
- [x] Upgrade para web-db-user (backend + banco + auth)
- [x] Sistema de login/senha próprio com bcrypt + JWT
- [x] Tela de login com identidade visual Contador SOS
- [x] Proteção de rotas autenticadas
- [x] Tabela de usuários internos com senha criptografada
- [x] Schema do banco de dados (clientes, triagem, propostas, cobranças)
- [x] Migrations rodadas com pnpm db:push
- [x] Routers tRPC para todas as entidades

## Formulário de Triagem
- [x] Página /triagem com formulário completo (41 campos)
- [x] Motor de cálculo automático de honorários
- [x] Enquadramento de faixa (Essencial → Estratégico)
- [x] Cálculo de adicionais e urgência
- [x] Sinalização de orçamento manual

## Gestão de Clientes
- [x] Página /clientes com listagem e filtros
- [x] Cadastro/edição de cliente
- [x] Status de processamento e pagamento
- [x] Checklist de documentos por cliente

## Proposta Comercial
- [x] Geração automática de proposta em PDF
- [x] Página /propostas com histórico
- [ ] Envio por e-mail (futuro)

## Cobrança
- [x] Página /cobranca com controle de pagamentos
- [x] Dias em atraso automáticos
- [x] Status de cobrança (1ª, 2ª, 3ª, inadimplente)

## Dashboard
- [x] Página /dashboard com 15 KPIs em tempo real
- [x] Gráficos com dados do banco
- [ ] Seletor de período (futuro)
- [ ] Exportação PDF/PNG (futuro)

## Navegação e Layout
- [x] DashboardLayout com sidebar
- [x] Identidade visual Contador SOS
- [x] Logomarca no header
- [x] Responsividade mobile

## Testes
- [x] Testes de autenticação (login, setup, bloqueio)
- [x] Testes do motor de cálculo de honorários
- [x] Testes do dashboard stats
- [x] 11 testes passando (vitest)

## Portal do Cliente
- [x] Tabela portal_tokens (CPF + código de acesso gerado pelo contador)
- [x] Tabela cliente_uploads (arquivos enviados pelo cliente via S3)
- [x] Router portal: login por CPF + token, status, upload, listar docs
- [x] Rota /portal separada do sistema interno
- [x] Tela de login do portal (CPF + código de acesso)
- [x] Dashboard do cliente: status da declaração com linha do tempo
- [x] Upload de documentos por categoria (RG, Informe, Deduções etc.)
- [x] Visualização dos documentos já enviados
- [x] Mensagens/observações do contador para o cliente
- [x] Painel interno: geração de token de acesso por cliente
- [x] Painel interno: visualizar uploads recebidos por cliente
- [x] Notificação visual no painel quando cliente faz upload
- [x] Testes do portal (autenticação, upload, status)

## Correções Críticas
- [ ] Corrigir UNAUTHORIZED: migrar de cookie para Authorization header (Bearer token) para compatibilidade cross-origin
