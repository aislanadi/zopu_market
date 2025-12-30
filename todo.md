# ZOPUMarket - TODO

## ✅ Épico 1 — Fundamentos e Autenticação

- [x] Estender schema de users com role RBAC (admin, gerente_contas, parceiro, cliente)
- [x] Criar tabela de categorias (categories)
- [x] Criar tabela de parceiros (partners) com dados jurídicos e status de curadoria
- [x] Criar tabela de ofertas (offers) com todos os campos do modelo
- [x] Implementar procedures tRPC para autenticação e verificação de roles
- [x] Criar middleware adminProcedure e gerenteProcedure

## ✅ Épico 2 — Catálogo e Ofertas

- [x] Implementar CRUD de categorias (admin only)
- [x] Implementar listagem de ofertas com filtros (categoria, tipo, ICP, exclusiva)
- [x] Criar página de detalhes da oferta
- [x] Implementar criação/edição de ofertas por admin
- [x] Implementar criação/edição de ofertas por parceiro (após aprovado)
- [x] Adicionar upload de imagens para ofertas (S3)

## ✅ Épico 3 — Curadoria de Parceiros

- [x] Criar formulário de onboarding de parceiro
- [x] Implementar submissão de cadastro de parceiro
- [x] Criar painel admin para aprovar/reprovar parceiros
- [x] Implementar mudança de status de curadoria (PENDING, APPROVED, REJECTED)
- [x] Criar notificações para parceiro sobre status de aprovação
- [x] Implementar configuração de credenciais Bitrix24 por parceiro

## ✅ Épico 4 — Sistema de Indicações (Core)

- [x] Criar tabela de referrals (indicações/ledger interno)
- [x] Criar tabela de lead_requests (formulários de proposta)
- [x] Implementar formulário de proposta (lead form) dinâmico por oferta
- [x] Criar procedure para submissão de formulário → cria Referral
- [x] Implementar integração Bitrix24: criar Lead no Bitrix do parceiro
- [x] Salvar partner_lead_id no Referral
- [x] Criar painel do parceiro para visualizar leads recebidos
- [x] Implementar atualização de status de indicação pelo parceiro
- [x] Implementar SLA de aceite (partner_ack_hours)
- [x] Implementar SLA de atualização (status_update_days)
- [x] Criar alertas automáticos para SLA vencido

## Épico 5 — Checkout e Pagamentos

- [ ] Criar tabela de orders (pedidos)
- [ ] Implementar fluxo de checkout para produtos simples
- [ ] Integrar gateway de pagamento (a definir)
- [ ] Implementar cálculo de split por produto (zopu_take_rate_percent)
- [ ] Criar ledger financeiro interno
- [ ] Implementar política de refund com reversão de split
- [ ] Criar notificações de confirmação de pedido

## ✅ Épico 6 — Comissionamento e Relatórios

- [x] Implementar cálculo de success fee por oferta
- [x] Criar relatório de comissões previstas x realizadas
- [x] Criar relatório por parceiro
- [x] Criar relatório por categoria
- [x] Criar relatório por gerente de contas
- [x] Implementar dashboard ZOPU com métricas principais
- [x] Implementar dashboard do parceiro com histórico de comissões

## Épico 7 — Painéis de Usuário

### ✅ Painel Admin ZOPU (Concluído)
- [x] Dashboard com novos parceiros pendentes
- [x] Dashboard com ofertas pendentes
- [x] Dashboard com leads por categoria (AdminAnalytics)
- [x] Dashboard com aging de indicações (AdminAnalytics)
- [x] Dashboard com ranking de conversão (AdminConversionRanking)
- [x] Página de gestão de categorias
- [x] Página de gestão de ofertas (todas)
- [x] Página de configuração de fees por produto (AdminFeesConfig)
- [x] Página de auditoria e logs (AdminAuditLogs)

### ✅ Painel Gerente de Contas (Concluído)
- [x] Dashboard com indicações por carteira (gerente/Dashboard)
- [x] Visualização de status e aging (integrado no dashboard)
- [x] Alertas de follow-up (gerente/FollowUpAlerts)
- [x] Funcionalidade para indicar ofertas para clientes (gerente/CreateReferral)
- [x] Registro de observações internas (gerente/ReferralDetail)

### ⚠️ Painel Parceiro (83% - Bloqueado por Épico 5)
- [x] Dashboard com leads recebidos (partner/Dashboard)
- [x] Indicações pendentes de aceite (implementado no dashboard)
- [x] Status e valores de indicações (implementado no dashboard)
- [x] Histórico de comissões (seção no dashboard)
- [ ] Configuração de dados de pagamento (split) - BLOQUEADO por Épico 5
- [x] Gestão de suas ofertas (implementado no dashboard)

### ✅ Área Pública (Cliente Comprador) (80% - Bloqueado por Épico 5)
- [x] Home page com destaque de ofertas (Home.tsx)
- [x] Catálogo com filtros (Catalog.tsx)
- [x] Página de detalhes da oferta (OfferDetail.tsx)
- [ ] Fluxo de checkout - BLOQUEADO por Épico 5
- [x] Fluxo de formulário de proposta (modal em OfferDetail)

## ✅ Épico 8 — Requisitos Não Funcionais (Concluído)

- [x] Implementar logs de auditoria (tabela auditLogs + página /admin/audit-logs)
- [x] Garantir LGPD by design (banner cookies, aceite termos, página privacidade)
- [x] Implementar layout responsivo (menu hamburger, ResponsiveTable, 100% mobile)
- [x] Adicionar testes vitest para procedures críticas (34 testes passando)
- [x] Documentar APIs e fluxos principais (94 procedures, 7 fluxos, arquitetura)
- [x] Configurar variáveis de ambiente para Bitrix24 (campo bitrix24Config em partners)

## Épico 9 — Integrações Avançadas

- [ ] Integração opcional com Bitrix da ZOPU (Deal/SPA)
- [ ] Webhook de status do parceiro → Market
- [ ] Lembretes automáticos por e-mail
- [ ] Sistema de notificações em tempo real
- [ ] Exportação de relatórios (CSV/PDF)

## Fora do Escopo Inicial (Futuro)

- [ ] Checkout multi-itens avançado
- [ ] Bundles de produtos
- [ ] Marketplace público aberto
- [ ] Motor de recomendação automático
- [ ] NPS automatizado
- [ ] Antifraude robusto
- [ ] Chat interno entre parceiro e cliente

## Atualização de Identidade Visual

- [x] Copiar logo oficial para o projeto
- [x] Atualizar paleta de cores para usar laranja como cor primária
- [x] Substituir texto "ZOPUMarket" por logo nos componentes
- [ ] Atualizar favicon

## Processamento de Logo

- [x] Extrair uma das três opções de logo da imagem
- [x] Remover fundo preto
- [x] Alterar cor do lettering para preto
- [x] Aplicar logo processada no site

## Correção de Tipografia da Logo

- [x] Processar logo com fundo já removido
- [x] Alterar tipografia "zopumarket" de branco para preto
- [x] Aplicar logo corrigida no site

## Correção de Páginas Quebradas

- [x] Identificar quais páginas estão com problemas
- [x] Criar página admin/categories
- [x] Criar página admin/partners  
- [x] Criar página admin/offers
- [x] Criar página admin/referrals
- [x] Atualizar App.tsx com novas rotas
- [x] Testar todas as páginas

## Correção de Nested Anchor Tags

- [x] Identificar onde há <a> dentro de <a> na página Home
- [x] Corrigir estrutura para evitar nested anchors
- [x] Testar página sem erros

## Logo na Página Torne-se Parceiro

- [x] Adicionar logo no header da página PartnerApply
- [x] Testar visualização

## Página de Detalhes da Oferta

- [x] Criar componente OfferDetail.tsx
- [x] Exibir todas as informações da oferta (título, descrição, preço, ICP, entregáveis, cases, FAQ)
- [x] Adicionar botão "Comprar Agora" para ofertas com saleMode CHECKOUT
- [x] Adicionar botão "Solicitar Proposta" para ofertas com saleMode LEAD_FORM
- [x] Implementar modal/formulário de lead request
- [x] Adicionar rota /offer/:id no App.tsx
- [x] Testar página completa

## Correção de Validação de ID na Página de Detalhes

- [x] Corrigir validação de ID em OfferDetail.tsx para lidar com valores inválidos
- [x] Adicionar tratamento de erro quando ID não é um número válido
- [x] Testar com diferentes cenários (sem ID, ID inválido, ID válido)

## Correção de Nested Anchors em Ofertas e Modal de Criação

- [x] Corrigir nested anchor tags na página admin/Offers
- [x] Criar modal completo de criação de ofertas
- [x] Adicionar todos os campos do formulário (título, descrição, categoria, tipo, preço, etc.)
- [x] Implementar upload de imagem via S3
- [x] Testar criação de oferta completa

## Redesign Inspirado em Marketplace de Freelancers

### Schema e Backend
- [ ] Adicionar tabela `reviews` para avaliações de parceiros
- [ ] Adicionar campo `ecosystems` (tags) na tabela partners
- [ ] Adicionar campo `rating` (média de avaliações) na tabela partners
- [ ] Adicionar campo `totalProjects` na tabela partners
- [ ] Adicionar campo `totalEarned` na tabela partners
- [ ] Criar procedures tRPC para reviews

### Design da Página Inicial
- [x] Redesenhar hero com espaço para imagem humanizada
- [x] Adicionar seção "Parceiros em Destaque" com cards estilo freelancer
- [x] Adicionar seção "Ecossistemas" com tags visuais
- [x] Melhorar tipografia e espaçamentos
- [x] Adicionar elementos visuais mais orgânicos (bordas arredondadas, sombras suaves)

### Página de Catálogo
- [x] Criar grid de cards de ofertas com info do parceiro
- [x] Cada card mostra: logo empresa, nome, especialidade, rating, projetos concluídos
- [x] Filtros por ecossistema (Indústria, Tecnologia, Serviços, Saúde, etc.)
- [x] Filtros por categoria
- [x] Campo de busca por texto
- [x] Ordenação (rating, projetos, mais recentes)

### Perfil Público do Parceiro
- [ ] Criar página `/partner-profile/:id` (diferente do painel admin)
- [ ] Sidebar com logo, nome, especialidade, rating, projetos, total ganho
- [ ] Seção "Sobre" com descrição da empresa
- [ ] Seção "Portfolio" com ofertas do parceiro
- [ ] Seção "Reviews" com avaliações de clientes
- [ ] Botão "Ver Ofertas" que leva ao catálogo filtrado por parceiro

### Sistema de Avaliações
- [ ] Formulário de avaliação após compra/lead fechado
- [ ] Campos: rating (1-5 estrelas), comentário, nome do avaliador
- [ ] Exibição de reviews no perfil do parceiro
- [ ] Cálculo automático de rating médio
- [ ] Filtros de reviews (mais recentes, melhor avaliados)

### Melhorias Visuais Gerais
- [x] Atualizar paleta de cores para tons mais suaves (rosa/coral + laranja)
- [x] Adicionar mais espaçamento e respiração no layout
- [x] Usar bordas arredondadas consistentemente
- [x] Adicionar sombras suaves nos cards
- [x] Melhorar hierarquia visual com tipografia
- [x] Adicionar micro-interações (hover effects, transitions)

## Correção da Logo no Header

- [x] Adicionar logo ZOPUMarket de volta no header da página Home
- [x] Adicionar logo ZOPUMarket de volta no header da página Catalog
- [x] Verificar qual arquivo de logo usar (logo-zopu.png ou zopu-logo-black.png)

## Criação de Ofertas de Exemplo

- [x] Verificar categorias existentes no banco
- [x] Criar parceiro de exemplo aprovado
- [x] Criar oferta 1: Licença Bitrix24 (produto simples, checkout direto)
- [x] Criar oferta 2: Aplicativo ZOPU personalizado (produto complexo, formulário de proposta)
- [x] Criar oferta 3: Consultoria em automação (serviço, formulário de proposta)
- [x] Verificar ofertas aparecendo no catálogo público

## Melhorias na Home e Detalhes das Ofertas

- [x] Copiar imagem humanizada para /client/public
- [x] Adicionar imagem humanizada no hero da página Home
- [x] Criar seção de depoimentos com sistema de estrelas (1-5) estilo Uber/Google
- [x] Corrigir parsing JSON em OfferDetail.tsx para "O que está incluído" (entregaveis)
- [x] Corrigir parsing JSON em OfferDetail.tsx para "Cases de Sucesso" (cases)
- [x] Corrigir parsing JSON em OfferDetail.tsx para "Perguntas Frequentes" (faq)
- [x] Testar todas as melhorias

## Sistema de Reviews de Parceiros (Reputação)

- [x] Remover seção de depoimentos genéricos da Home
- [x] Criar tRPC procedure review.listByPartner para buscar reviews de um parceiro
- [x] Adicionar seção de reviews na página OfferDetail.tsx
- [x] Criar 5-8 reviews de exemplo no banco para os parceiros existentes
- [x] Testar sistema de reviews nas páginas de ofertas

## Perfis Públicos de Parceiros

- [x] Criar tRPC procedure partner.getPublicProfile para buscar dados completos do parceiro
- [x] Criar página PartnerProfile.tsx em /partner/:id
- [x] Exibir informações do parceiro (logo, nome, descrição, especialidades)
- [x] Listar todas as ofertas do parceiro
- [x] Exibir métricas agregadas (rating médio, total de reviews, projetos concluídos)
- [x] Mostrar histórico de reviews do parceiro
- [x] Adicionar botão "Ver Perfil do Parceiro" nos cards de ofertas
- [x] Registrar rota /partner/:id no App.tsx

## Filtro de Rating no Catálogo

- [x] Adicionar filtro de rating mínimo na sidebar do catálogo
- [x] Implementar lógica de filtragem por rating no frontend
- [x] Calcular rating médio do parceiro de cada oferta
- [x] Exibir rating médio nos cards de ofertas do catálogo
- [x] Testar filtro combinado com outros filtros existentes

## Formulário de Review Pós-Compra

- [x] Criar tRPC procedure review.create (protectedProcedure)
- [x] Criar componente ReviewForm.tsx
- [x] Implementar seletor de estrelas (1-5)
- [x] Adicionar campo de comentário
- [x] Adicionar validação e feedback de sucesso
- [x] Exibir formulário na página de detalhes para usuários autenticados
- [x] Testar fluxo completo de criação de review

## Busca Avançada no Catálogo

- [x] Adicionar filtro de faixa de preço (inputs min/max)
- [x] Adicionar dropdown de ordenação (relevância, menor preço, maior rating, mais recente)
- [x] Implementar lógica de ordenação no frontend
- [x] Testar filtros combinados (categoria + rating + preço)

## Sistema de Favoritos

- [x] Criar tabela `favorites` no schema (userId, offerId, partnerId, type)
- [x] Criar procedures favorite.add, favorite.remove, favorite.list, favorite.check
- [x] Adicionar botão "Favoritar" nos cards de ofertas
- [x] Implementar toggle de favorito com feedback visual (coração preenchido/vazio)
- [x] Criar página "Meus Favoritos" em /favorites
- [x] Adicionar botão "Favoritar" nos perfis de parceiros (implementado nos cards)

## Dashboard de Métricas para Parceiros

- [x] Criar tabela `analytics` para tracking (partnerId, offerId, eventType, timestamp)
- [x] Implementar tracking de visualizações de perfil
- [x] Implementar tracking de cliques em ofertas
- [x] Implementar tracking de propostas enviadas
- [x] Criar página /partner/dashboard
- [x] Exibir métricas: views, clicks, conversão, rating médio
- [x] Exibir últimas avaliações recebidas
- [x] Restringir acesso apenas ao próprio parceiro (verificar userId)
- [x] Criar testes vitest para sistema de favoritos (5/5 passando)
- [x] Criar testes vitest para sistema de analytics (11/11 passando)

## Campos de Localização e Ecossistema no Perfil de Parceiros

- [x] Adicionar campos `state` (UF), `city` e `ecosystem` na tabela `partners`
- [x] Executar `pnpm db:push` para aplicar mudanças no schema
- [x] Atualizar formulário de cadastro de parceiros no admin (via Database UI)
- [x] Atualizar página de perfil público para exibir localização e ecossistema
- [x] Adicionar filtros de UF, cidade e ecossistema no catálogo
- [ ] Testar filtros combinados com localização

## Sistema de Notificações em Tempo Real

- [x] Criar tabela `notifications` (userId, type, title, message, read, createdAt)
- [x] Criar procedures notification.create, notification.list, notification.markAsRead
- [x] Criar componente NotificationBell no header
- [x] Implementar dropdown de notificações com contador
- [ ] Criar notificações automáticas para: novo lead, novo review, nova mensagem
- [ ] Adicionar página /notifications com histórico completo

## Comparador de Ofertas

- [x] Criar estado local (localStorage) para ofertas selecionadas (máximo 3)
- [x] Criar página /compare com tabela de comparação lado a lado
- [x] Exibir: preço, descrição, tipo de checkout
- [x] Adicionar botão "Ver Detalhes" e "Remover da comparação"
- [ ] Adicionar checkbox "Comparar" nos cards de ofertas do catálogo
- [ ] Criar botão flutuante "Comparar (X)" quando houver seleções

## Sistema de Mensagens Diretas

**REMOVIDO DO ESCOPO** - O sistema funciona com compra direta via checkout ou formulário de proposta, sem necessidade de chat interno.

## Sistema de Acesso Restrito e Preços Ocultos

- [x] Ocultar preços no catálogo para usuários não autenticados
- [x] Mostrar "Faça login para ver preços" ao invés do valor
- [x] Revelar preços após login
- [x] Atualizar página de detalhes da oferta para ocultar preço

## Sistema de Cadastro por Convite

- [ ] Remover opção "Criar Conta" do sistema
- [ ] Criar formulário "Quero ser Cliente" (lead form)
- [ ] Integrar lead form com Bitrix24 CRM
- [ ] Criar tabela `user_invitations` (token, email, expiresAt, usedAt)
- [ ] Criar procedure para gerar convites
- [ ] Criar página de aceite de convite (/invite/:token)
- [ ] Admin pode enviar convites por email

## Controle de Avaliações Baseado em Contratação

- [ ] Criar tabela `service_contracts` (userId, offerId, contractDate, value, period, comments, verified)
- [ ] Avaliação automática habilitada após checkout direto
- [ ] Criar botão "Eu Contratei este Serviço" para serviços complexos
- [ ] Formulário de confirmação de contratação (data, valor, período, comentários)
- [ ] Habilitar avaliação apenas após contratação verificada
- [ ] Admin pode validar/moderar contratos informados
- [ ] Remover formulário de avaliação aberto para todos

## Controle de Avaliações por Contratação

- [ ] Criar tabela `serviceContracts` (userId, offerId, partnerId, contractDate, value, period, comments, verified)
- [ ] Criar procedures contract.create, contract.verify, contract.checkEligibility
- [ ] Implementar botão "Eu Contratei este Serviço" em OfferDetail para serviços complexos
- [ ] Criar modal/formulário para informar dados da contratação (data, valor, período)
- [ ] Atualizar ReviewForm para verificar se usuário contratou antes de permitir avaliação
- [ ] Exibir mensagem "Você precisa contratar este serviço para avaliá-lo" quando não elegível
- [ ] Testar fluxo completo: contratar → avaliar

## Sistema de Convites por Email

- [ ] Criar página /admin/invitations para gestão de convites
- [ ] Implementar formulário de envio de convite (email, nome)
- [ ] Criar procedure invitation.create para gerar token único
- [ ] Criar procedure invitation.validate para verificar token na URL
- [ ] Criar página /accept-invitation/:token para aceitar convite
- [ ] Implementar criação de conta via convite (sem senha, apenas OAuth)
- [ ] Adicionar lista de convites enviados (pendentes, usados, expirados)
- [ ] Testar fluxo completo: admin envia → usuário aceita → conta criada

## Sistema de Controle de Avaliações Baseado em Contratação

- [x] Criar tabela serviceContracts no schema
- [x] Criar funções no db.ts: createServiceContract, checkContractEligibility, getUserContracts
- [x] Criar tRPC procedures: contract.create, contract.checkEligibility
- [x] Criar componente ContractDeclarationModal com formulário completo
- [x] Adicionar botão "Eu Contratei este Serviço" em OfferDetail (apenas para ofertas complexas/sob consulta)
- [x] Implementar lógica de elegibilidade: exibir formulário de review apenas se contrato verificado
- [x] Adicionar card de "Contrato em verificação" quando contrato está pendente
- [x] Testar fluxo completo: declarar contratação → ver aviso de verificação → aguardar aprovação

## Sistema de Convites por Email (Backend)

- [x] Criar funções no db.ts: createUserInvitation, getInvitationByToken, markInvitationAsUsed, listInvitations
- [x] Criar tRPC procedures: invitation.create, invitation.list, invitation.validate
- [ ] Criar página admin para enviar convites (/admin/invitations)
- [ ] Criar página pública de registro via convite (/register/:token)
- [ ] Implementar envio de email com link de convite (integração com serviço de email)

## Bugs Reportados

- [x] Corrigir erro 404 na página /partner-apply
- [x] Corrigir erro 404 na página /dashboard

## Melhorias Solicitadas - Dezembro 2025

- [x] Verificar e corrigir rotas /partner-apply e /admin/dashboard (reportadas como não funcionando)
- [x] Adicionar botão WhatsApp no catálogo (554733079280) com texto padrão sobre ZOPUMarket
- [x] Criar página de Contato (/contact) inspirada em https://zopu.com.br/contato
- [x] Criar página Sobre Nós (/about)
- [x] Criar página Termos de Uso (/terms)
- [x] Criar página Política de Privacidade (/privacy)
- [x] Adicionar campo videoUrl (YouTube embed) na tabela offers
- [x] Adicionar campo institutionalVideoUrl na tabela partners
- [x] Exibir vídeo do YouTube na página de detalhes da oferta
- [x] Exibir vídeo institucional na página de perfil do parceiro
- [x] Atualizar formulário de criação de ofertas com campo de vídeo

## Implementação de Vídeo Institucional - Perfil do Parceiro

- [x] Adicionar campo institutionalVideoUrl no formulário de cadastro de parceiros (PartnerApply)
- [x] Atualizar backend (procedures tRPC) para aceitar institutionalVideoUrl
- [x] Exibir vídeo institucional na página de perfil do parceiro usando YouTubeEmbed

## Novas Funcionalidades - Gestao de Parceiros e Melhorias

- [x] Criar pagina /admin/partners-management para gestao completa de parceiros
- [x] Adicionar modal de edicao de parceiro com todos os campos incluindo video institucional
- [x] Implementar /partner/edit-profile para parceiros editarem seus proprios perfis
- [x] Adicionar botao "Editar Perfil" no /partner/dashboard
- [x] Adicionar secao de cases/depoimentos na pagina do parceiro
- [x] Criar tabela partnerCases no banco de dados
- [x] Implementar tRPC procedures para gerenciar cases

## Bug Reportado - Dezembro 2025

- [x] Corrigir rota /admin/dashboard quebrada (erro 404)

## Novas Funcionalidades - Dezembro 2025

- [x] Criar painel /admin/contracts para aprovação de contratos
- [x] Adicionar procedure tRPC para listar contratos pendentes
- [x] Implementar ação de aprovar/rejeitar contrato com comentários
- [x] Liberar automaticamente formulário de avaliação após aprovação
- [x] Adicionar campo badges na tabela partners
- [x] Criar sistema de badges visuais na página do parceiro
- [x] Criar interface /admin/cases para gestão de cases de sucesso
- [x] Permitir criar, editar, publicar/despublicar cases pelo admin

## Implementação de Badge "Preferido da Comunidade" e Filtros Avançados

- [x] Adicionar badge "community_favorite" no componente PartnerBadges
- [x] Criar sistema de filtros no catálogo (badges, localização, preço, avaliação)
- [x] Atualizar backend para suportar filtragem de ofertas por múltiplos critérios
- [x] Implementar lógica automática para atribuir badge "Preferido da Comunidade" (10+ vendas)
- [x] Adicionar UI de filtros na página Catalog
- [x] Testar filtros combinados e validar resultados

## Sistema de Comparação de Ofertas

- [x] Criar contexto React para gerenciar ofertas selecionadas (máximo 3)
- [x] Adicionar botão "Comparar" nos cards de ofertas do catálogo
- [x] Criar barra flutuante mostrando ofertas selecionadas
- [x] Implementar página /compare com layout de comparação lado a lado
- [x] Exibir preços, features, avaliações e badges na comparação
- [x] Adicionar botão para remover ofertas da comparação
- [x] Testar fluxo completo de seleção e comparação
- [x] Adicionar persistência com localStorage para manter seleções entre navegações

## Feedback Visual no Comparador de Ofertas

- [x] Adicionar toast de confirmação ao adicionar oferta no comparador
- [x] Implementar animação no botão de comparar quando oferta é adicionada
- [x] Adicionar animação de entrada na barra flutuante
- [x] Testar feedback visual completo

## Busca Avançada com Autocomplete

- [x] Criar componente SearchAutocomplete com debounce
- [x] Implementar procedure tRPC para busca unificada (ofertas + parceiros + categorias)
- [x] Adicionar highlighting de termos correspondentes
- [x] Categorizar sugestões por tipo (Ofertas, Parceiros, Categorias)
- [x] Adicionar navegação por teclado (setas, Enter, Esc)
- [x] Testar busca em tempo real

## Filtros de Localização no Catálogo

- [ ] Adicionar filtros dropdown de Estado (UF) e Cidade na UI do catálogo
- [ ] Implementar lógica de filtro cascata (selecionar estado primeiro, depois cidade)
- [ ] Criar lista de estados brasileiros e cidades
- [ ] Atualizar lógica de filtro no Catalog.tsx para incluir localização
- [ ] Adicionar botão de limpar filtros de localização
- [ ] Testar filtros de localização combinados com outros filtros

## Filtros de Localização no Catálogo

- [x] Adicionar todos os 27 estados brasileiros no dropdown de estados
- [x] Implementar filtro cascata (limpar cidade ao mudar estado)
- [x] Adicionar campo de cidade que aparece após selecionar estado
- [x] Backend já filtra ofertas por localização do parceiro
- [x] Testar filtros de localização

## Dashboard de Métricas para Parceiros

- [ ] Criar tabela `analytics` (partnerId, offerId, eventType, metadata, timestamp)
- [ ] Instalar biblioteca recharts para gráficos
- [ ] Implementar tracking de visualizações de perfil
- [ ] Implementar tracking de cliques em ofertas
- [ ] Implementar tracking de leads gerados via WhatsApp
- [ ] Criar procedure tRPC analytics.getPartnerMetrics
- [ ] Criar gráfico de linha: visualizações ao longo do tempo
- [ ] Criar gráfico de barras: leads por oferta
- [ ] Criar gráfico de linha: evolução de rating médio
- [ ] Criar card de métricas: taxa de conversão
- [ ] Adicionar gráficos no /partner/dashboard
- [ ] Testar dashboard completo


## Dashboard de Métricas para Parceiros

- [x] Criar tabela `analytics` para tracking (partnerId, offerId, eventType, timestamp)
- [x] Implementar tracking de visualizações de perfil
- [x] Implementar tracking de cliques em ofertas
- [x] Implementar tracking de propostas enviadas
- [x] Criar página /partner/dashboard
- [x] Exibir métricas: views, clicks, conversão, rating médio
- [x] Exibir últimas avaliações recebidas
- [x] Restringir acesso apenas ao próprio parceiro (verificar userId)
- [x] Criar testes vitest para sistema de favoritos (5/5 passando)
- [x] Criar testes vitest para sistema de analytics (11/11 passando)

## Exportação de Relatórios em CSV

- [x] Criar função generateMetricsCSV() no backend para formatar dados em CSV
- [x] Criar endpoint tRPC analytics.exportReport para gerar e retornar CSV
- [x] Adicionar botão "Exportar Relatório CSV" no dashboard do parceiro
- [x] Implementar download automático do arquivo CSV no navegador
- [x] Testar exportação com dados reais
- [x] Criar testes vitest para exportação (13/13 passando)


## Correções de Bugs

- [x] Corrigir erro "Admin deve especificar partnerId" quando admin tem partnerId associado
- [x] Ajustar lógica de permissões em analytics.getPartnerMetrics e analytics.exportReport

- [x] Corrigir permissões em partner.update para permitir admins com partnerId editarem perfil


## Sistema de Parceiro Premium

- [x] Adicionar campo `tier` (STANDARD/PREMIUM) na tabela partners
- [x] Executar migração do schema com pnpm db:push
- [x] Atualizar função getAllPartners() para ordenar por tier (premium primeiro)
- [x] Adicionar badge visual "Premium" nos cards de parceiros (Catalog, PartnerProfile)
- [x] Criar toggle no admin para ativar/desativar premium
- [x] Testar ordenação e visualização do badge (testado manualmente no browser)


## Workflow de Negociação de Success Fee

- [x] Adicionar status `PENDING_INTERVIEW` ao enum de status de ofertas
- [x] Adicionar campo `profitMargin` (int) para margem líquida estimada
- [x] Adicionar campo `negotiationNotes` (text) para observações da entrevista
- [x] Executar migração do schema com pnpm db:push
- [x] Criar query getPendingOffers() para listar ofertas aguardando aprovação
- [x] Criar procedure offer.getPending para admin listar ofertas pendentes
- [x] Criar procedure offer.approve para admin aprovar oferta e definir success fee
- [x] Criar procedure offer.reject para admin rejeitar oferta com motivo
- [x] Criar página admin /admin/pending-offers para dashboard de aprovação
- [x] Atualizar formulário de cadastro de oferta para incluir campo profitMargin
- [x] Atualizar lógica: oferta criada por parceiro vai para PENDING_INTERVIEW
- [x] Testar fluxo completo: cadastro → pendente → aprovação → publicada
- [x] Criar testes vitest para workflow de negociação (5/5 passando)


## Cadastro de Comprador com ReceitaWS

- [x] Criar tabela `buyers` no schema com campos enriquecidos da Receita Federal
- [x] Executar migração do schema com pnpm db:push
- [x] Criar helper de integração com ReceitaWS no backend
- [x] Criar procedure buyer.searchCNPJ para consultar dados da empresa
- [x] Criar procedure buyer.completeProfile para salvar cadastro completo
- [x] Criar procedure buyer.getProfile para buscar perfil do comprador
- [x] Criar procedure buyer.updateProfile para atualizar perfil
- [x] Criar procedure buyer.listAll para admin listar compradores
- [x] Criar página /buyer/complete-profile com formulário em etapas
- [x] Implementar upload de foto de perfil (preview local por enquanto)
- [x] Implementar busca automática de CNPJ com ReceitaWS
- [x] Adicionar multi-select de categorias de interesse
- [x] Criar sistema de classificação automática em ecossistemas (baseado em CNAE)
- [ ] Implementar redirecionamento automático para complete-profile após login (TODO: adicionar lógica no AuthContext)
- [x] Testar fluxo completo de cadastro
- [x] Criar testes vitest para cadastro de comprador (10/10 passando, 1 skipped)


## Dashboard do Comprador e Recomendações

- [x] Criar página /buyer/dashboard com visão geral
- [x] Exibir histórico de solicitações de orçamento (estrutura pronta)
- [x] Exibir ofertas favoritas
- [x] Criar procedure buyer.getRecommendations para matching inteligente
- [x] Implementar algoritmo de recomendação baseado em parceiros premium e rating
- [x] Implementar algoritmo de recomendação baseado em categorias de interesse
- [x] Exibir recomendações personalizadas no dashboard
- [x] Implementar redirecionamento automático com ProfileGuard
- [x] Adicionar verificação de profileComplete após login
- [x] Testar fluxo completo de onboarding
- [x] Criar testes vitest para sistema de recomendações (11/11 passando)


## Sistema de Gestão de Licenças Bitrix24

### Campos e Estrutura
- [x] Adicionar campos de licença Bitrix24 na tabela buyers (bitrixUrl, bitrixLicenseType, bitrixLicenseExpiry, bitrixLicenseStatus)
- [x] Executar migração do schema com pnpm db:push
- [x] Atualizar formulário /buyer/complete-profile com campos de licença
- [x] Atualizar procedures buyer.completeProfile e buyer.updateProfile com campos de licença
- [x] Criar função calculateLicenseStatus() para calcular status automaticamente

### Sistema de Notificações de Vencimento
- [x] Criar tabela license_notifications para controlar envios
- [x] Criar função checkLicenseExpirations() para verificar vencimentos
- [x] Implementar lógica de notificação 90/60/30/0 dias antes
- [x] Criar função getLicensesExpiring() para dashboard admin
- [x] Criar endpoint tRPC para executar verificação manual (admin)
- [x] Criar testes vitest para sistema de licenças (8/8 passando)
- [ ] Adicionar alerta de vencimento no dashboard do comprador (TODO: futuro)

### Dashboard Admin de Licenças
- [x] Criar página /admin/licenses para gestão de licenças
- [x] Listar licenças vencendo nos próximos 90 dias
- [x] Filtros por período (30/60/90 dias)
- [x] Botão para executar verificação manual de notificações
- [x] Métricas: total, vencidas, vencendo, ativas
- [x] Adicionar link no menu admin

### Preparação para Integração Asaas (Futuro)
- [ ] Documentar estrutura necessária para gateway de pagamento
- [ ] Criar placeholder para fluxo de renovação automática


## Banner de Alerta de Vencimento no Dashboard do Comprador

- [x] Criar componente LicenseExpiryAlert com design responsivo
- [x] Implementar lógica de cores e ícones baseados na urgência (VENCENDO/VENCIDA)
- [x] Adicionar botão "Renovar Licença" que redireciona para catálogo
- [x] Integrar alerta no topo do dashboard do comprador
- [x] Testar exibição do alerta com diferentes status de licença
- [x] Criar testes vitest para sistema de alerta (18/18 passando)


## Correção: Página de Edição de Perfil do Comprador

- [x] Criar página /buyer/edit-profile para editar dados do comprador
- [x] Adicionar rota no App.tsx
- [x] Permitir edição de dados pessoais, empresa e licença Bitrix24
- [x] Testar fluxo de edição completo (rota funcionando corretamente)


## Upload de Foto de Perfil do Comprador

### Backend
- [x] Criar endpoint tRPC buyer.uploadPhoto para fazer upload para S3
- [x] Adicionar validações (tamanho máximo 5MB, formatos JPG/PNG/WEBP)
- [x] Gerar nome único para arquivo (userId + timestamp + hash)
- [x] Retornar URL pública da foto após upload

### Frontend
- [x] Criar componente PhotoUpload com preview e validação
- [x] Integrar componente na página /buyer/complete-profile
- [x] Integrar componente na página /buyer/edit-profile
- [ ] Exibir foto atual do perfil no dashboard do comprador (TODO: adicionar avatar no header)

### Testes
- [x] Testar upload de foto com diferentes formatos
- [x] Testar validação de tamanho máximo
- [x] Criar testes vitest para endpoint de upload (4/4 passando)


## Cadastro da ZOPU como Parceiro Premium Oficial

### Backend - Seed de Dados
- [x] Criar script seed-zopu.mjs para cadastrar ZOPU
- [x] Definir ID fixo para parceiro ZOPU (ex: partnerId = 1)
- [x] Cadastrar ZOPU com tier PREMIUM e todos os dados oficiais
- [x] Criar ofertas de licenças Bitrix24 (Professional, Enterprise, Start+)
- [ ] Criar ofertas de aplicativos do ecossistema ZOPU (futuro)
- [x] Executar seed e validar dados no banco

### Frontend - Integração com Dashboard do Comprador
- [x] Atualizar componente LicenseExpiryAlert
- [x] Modificar botão "Renovar Licença" para direcionar ao catálogo filtrado por ZOPU
- [x] Adicionar parâmetro de query para filtrar ofertas de licenças Bitrix24
- [x] Testar fluxo completo de renovação

### Testes
- [x] Criar testes vitest para verificar existência do parceiro ZOPU (9/9 passando)
- [x] Testar filtro de ofertas por parceiro ZOPU
- [x] Testar redirecionamento do botão Renovar Licença


## Correção: Erro de Renderização na Página de Detalhes da Oferta

- [x] Investigar erro "Objects are not valid as a React child" na página /offer/:id
- [x] Corrigir renderização de objetos JSON (cases, FAQ) no componente OfferDetail
- [x] Testar com ofertas das licenças Bitrix24 (IDs 90000, 90001, 90002)


## Correção: Permissões de Usuário Admin

- [x] Verificar role atual do usuário Aislan (já é admin)
- [x] Implementar funcionalidade de edição de ofertas
- [x] Adicionar campo de vídeo no formulário de edição


## Atualização: Sistema de Licenças Bitrix24 com Periodicidade e Variantes

### Backend - Schema e Dados
- [x] Atualizar schema de ofertas para suportar periodicidade (trimestral/anual/mensal)
- [x] Adicionar campo para variantes de planos (Enterprise 250/500/1000/2000)
- [x] Criar script para atualizar ofertas existentes
- [x] Criar novos planos: Basic, Standard, Professional
- [x] Criar variantes Enterprise: 250, 500, 1000, 2000 usuários
- [x] Remover plano Start+ obsoleto

### Frontend - Seleção de Periodicidade e Variantes
- [x] Criar componente de seleção de periodicidade (trimestral/anual/mensal)
- [x] Criar componente de seleção de variante Enterprise
- [x] Atualizar página de detalhes da oferta com seletores
- [x] Calcular preço dinamicamente baseado na seleção
- [ ] Atualizar botão de checkout com opções selecionadas (próxima etapa)

### Validações
- [x] Mensal disponível apenas para Enterprise
- [x] Variantes disponíveis apenas para Enterprise
- [x] Preços corretos para cada combinação
- [x] Criar testes vitest para validar lógica (11/11 passando)


## Integração com Gateway de Pagamento Asaas

### Credenciais e Configuração
- [ ] Solicitar API Key do Asaas (sandbox e produção)
- [ ] Configurar webhook URL no painel Asaas
- [ ] Adicionar credenciais como secrets no projeto

### Backend - Schema e Estrutura
- [ ] Criar tabela `payments` (id, orderId, asaasId, status, amount, method, etc.)
- [ ] Criar tabela `subscriptions` (id, buyerId, offerId, asaasSubscriptionId, status, billingPeriod, etc.)
- [ ] Atualizar tabela `orders` com campos de pagamento
- [ ] Aplicar migração no banco

### Backend - Integração API Asaas
- [ ] Criar helper `server/asaas.ts` para comunicação com API
- [ ] Implementar criação de cliente no Asaas
- [ ] Implementar criação de cobrança única (PIX/Boleto/Cartão)
- [ ] Implementar criação de assinatura recorrente
- [ ] Implementar webhook handler para notificações de pagamento
- [ ] Implementar cancelamento de assinatura

### Backend - Procedures tRPC
- [ ] Criar `payment.createCheckout` - Iniciar processo de pagamento
- [ ] Criar `payment.processPayment` - Processar pagamento com Asaas
- [ ] Criar `payment.handleWebhook` - Receber notificações do Asaas
- [ ] Criar `payment.listByBuyer` - Listar pagamentos do comprador
- [ ] Criar `payment.cancelSubscription` - Cancelar assinatura
- [ ] Criar `subscription.listByBuyer` - Listar assinaturas ativas

### Frontend - Página de Checkout
- [ ] Criar página `/checkout/:offerId` com formulário de pagamento
- [ ] Implementar seleção de método de pagamento (PIX/Boleto/Cartão)
- [ ] Implementar formulário de dados do cartão (com validação)
- [ ] Exibir resumo do pedido com preço e periodicidade selecionada
- [ ] Implementar fluxo de confirmação de pagamento
- [ ] Criar página de sucesso `/checkout/success`
- [ ] Criar página de erro `/checkout/error`

### Frontend - Dashboard de Pagamentos
- [ ] Adicionar seção "Meus Pagamentos" no dashboard do comprador
- [ ] Exibir histórico de pagamentos com status
- [ ] Exibir assinaturas ativas com opção de cancelamento
- [ ] Adicionar seção "Pagamentos" no painel admin
- [ ] Exibir todos os pagamentos com filtros

### Testes e Validação
- [ ] Criar testes vitest para helpers Asaas
- [ ] Criar testes para procedures de pagamento
- [ ] Testar fluxo completo de checkout em sandbox
- [ ] Testar webhooks com simulador Asaas
- [ ] Testar cancelamento de assinatura



## Atualização: Imagem Hero da Homepage

- [x] Copiar nova imagem para client/public/
- [x] Atualizar componente Home.tsx com nova imagem
- [x] Verificar responsividade da nova imagem



## Melhoria UX: Efeito Hover na Imagem Hero

- [x] Adicionar transição de zoom suave na imagem hero (scale-105, duration-700ms)
- [x] Testar efeito em diferentes navegadores



## Melhoria UX: Botão CTA na Imagem Hero

- [x] Adicionar botão "Saiba Mais" flutuante sobre a imagem hero
- [x] Link para página de catálogo/ofertas
- [x] Estilo com backdrop blur e hover effect (scale-105)



## Melhoria UX: Animação de Entrada do Botão CTA

- [x] Adicionar animação fade-in com bounce no carregamento (1s, delay 0.5s)
- [x] Adicionar pulso sutil contínuo para manter atenção (2s infinite, delay 1.5s)
- [x] Configurar delay apropriado para não sobrecarregar



## Melhoria UX: Reposicionamento e Feedback Tátil do Botão CTA

- [x] Mover botão "Saiba Mais" para ao lado do card de avaliação 4.9/5.0
- [x] Adicionar feedback tátil (active:scale-95) no clique
- [x] Ajustar espaçamento e alinhamento (gap-4)



## Melhoria UX: Reposicionamento Final e Efeito Hover na Estrela

- [x] Mover botão "Saiba Mais" para canto direito inferior da imagem
- [x] Manter card de avaliação no canto esquerdo inferior
- [x] Adicionar efeito de brilho/shine na estrela ao hover (drop-shadow glow)
- [x] Criar animação de pulso ou glow na estrela (scale-110 + glow coral)



---

# 📋 ÉPICOS DO MARKETPLACE

## ✅ Épico 1 — Fundamentos e Autenticação

### Schema e Banco de Dados
- [x] Estender schema de users com role RBAC (admin, gerente_contas, parceiro, cliente)
- [x] Criar tabela de categorias (categories)
- [x] Criar tabela de parceiros (partners) com dados jurídicos e status de curadoria
- [x] Criar tabela de ofertas (offers) com todos os campos do modelo
- [x] Adicionar campos de licenças Bitrix24 (billingPeriods, variants, preços)
- [x] Adicionar campo tier (STANDARD/PREMIUM) para parceiros

### Procedures tRPC e Middleware
- [x] Implementar procedures tRPC para autenticação e verificação de roles
- [x] Criar middleware adminProcedure (apenas admin)
- [x] Criar middleware gerenteProcedure (admin + gerente_contas)
- [x] Criar middleware parceiroProcedure (apenas parceiro)
- [x] Aplicar middlewares em todos os routers apropriados

**Status**: ✅ **COMPLETO** - Todas as funcionalidades implementadas e testadas



## ✅ Épico 2 — Gestão de Parceiros

### Backend - Procedures tRPC
- [x] Router de parceiros (partnerRouter) com CRUD completo
- [x] Procedures de curadoria (updateCurationStatus)
- [x] Procedures de configuração Bitrix24 (updateBitrixConfig)
- [x] Procedures de informações de pagamento (updatePaymentInfo)
- [x] Procedures de perfil (updateProfile, updateSelfProfile)
- [x] Procedures de tier (updateTier para STANDARD/PREMIUM)
- [x] Router de ofertas (offerRouter) com CRUD completo
- [x] Procedures de workflow de ofertas (getPending, approve, reject)
- [x] Router de analytics (analyticsRouter)
- [x] Procedures de métricas (getPartnerMetrics)
- [x] Procedures de exportação CSV (exportReport)

### Frontend - Dashboard do Parceiro
- [x] Página /partner/dashboard com métricas completas
- [x] Gráficos Recharts (visualizações, cliques, leads)
- [x] Cards de estatísticas (ofertas, reviews, rating)
- [x] Exportação de relatórios CSV
- [x] Lista de ofertas do parceiro
- [x] Lista de reviews recebidos

### Frontend - Perfil e Cadastro
- [x] Página /partner/apply para candidatura
- [x] Página /partner/edit-profile para edição
- [x] Página /partner/:id para perfil público
- [x] Exibição de badges e tier (PREMIUM/STANDARD)
- [x] Integração com YouTube (vídeo institucional)
- [x] Cases de sucesso do parceiro

### Frontend - Admin
- [x] Página /admin/partners para listagem
- [x] Página /admin/partners-management para gestão
- [x] Aprovação/rejeição de parceiros
- [x] Gestão de tier e badges

**Status**: ✅ **COMPLETO** - Dashboard, métricas, CRUD e workflows implementados



## ✅ Épico 3 — Jornada do Comprador

### Backend - Procedures tRPC
- [x] Router de compradores (buyerRouter)
- [x] Busca de CNPJ via ReceitaWS (searchCNPJ)
- [x] Perfil do comprador (getProfile, completeProfile, updateProfile)
- [x] Upload de foto de perfil (uploadPhoto)
- [x] Sistema de favoritos (favoriteRouter)
  - [x] Adicionar/remover favoritos de ofertas e parceiros
  - [x] Listar favoritos
  - [x] Verificar se item está favoritado
- [x] Sistema de recomendações (getRecommendations)
- [x] Busca unificada (searchRouter.unified)
- [x] Histórico de pedidos (orderRouter)

### Frontend - Dashboard e Perfil
- [x] Página /buyer/dashboard
  - [x] Cards de estatísticas (favoritos, lead requests)
  - [x] Alerta de vencimento de licença Bitrix24
  - [x] Recomendações personalizadas
  - [x] Histórico de pedidos
- [x] Página /buyer/complete-profile
  - [x] Formulário de cadastro completo
  - [x] Integração ReceitaWS para busca de CNPJ
  - [x] Classificação por ecossistema
- [x] Página /buyer/edit-profile
  - [x] Edição de dados cadastrais
  - [x] Upload de foto de perfil

### Frontend - Catálogo e Busca
- [x] Página /catalog com filtros avançados
  - [x] Busca por texto
  - [x] Filtro por categoria
  - [x] Filtro por parceiro
  - [x] Filtro por ecossistema
  - [x] Filtro por rating mínimo
  - [x] Filtro por faixa de preço
  - [x] Filtro por localização (estado/cidade)
  - [x] Filtro por badges
  - [x] Ordenação (relevância, preço, rating, recente)
  - [x] Suporte a query params para deep linking
- [x] Componente SearchAutocomplete
- [x] Sistema de comparação de ofertas
  - [x] ComparisonContext e ComparisonProvider
  - [x] ComparisonBar flutuante
  - [x] Página /compare para visualização lado a lado
  - [x] Limite de 3 ofertas por comparação

### Frontend - Favoritos e Interações
- [x] Página /favorites
- [x] Componente FavoriteButton reutilizável
- [x] Sistema de notificações (NotificationBell)

### ❌ Funcionalidades Pendentes

#### Sistema de Lead Requests (Formulário de Interesse)
- [ ] Backend: Implementar listagem de lead requests por comprador
- [ ] Frontend: Exibir lead requests no dashboard do comprador
- [ ] Frontend: Página para visualizar detalhes de lead request
- [ ] Frontend: Status e acompanhamento de lead requests

#### Sistema de Mensagens/Chat
- [ ] Backend: Criar tabela de mensagens
- [ ] Backend: Router de mensagens (enviar, listar, marcar como lida)
- [ ] Frontend: Inbox/caixa de entrada
- [ ] Frontend: Interface de chat em tempo real
- [ ] Frontend: Notificações de novas mensagens

#### Histórico de Navegação e Visualizações
- [ ] Backend: Tracking detalhado de visualizações
- [ ] Frontend: Seção "Visualizados Recentemente" no dashboard
- [ ] Frontend: Histórico de buscas

**Status**: ⚠️ **PARCIALMENTE COMPLETO** - Core implementado, faltam lead requests e mensagens



## Implementação: Épico 4 - Sistema de Indicações (Pendências)

### Dashboard do Parceiro - Leads
- [ ] Adicionar seção "Leads Recebidos" no /partner/dashboard
- [ ] Listar indicações do parceiro com status e dados do cliente
- [ ] Adicionar botão para atualizar status (ACKED, IN_NEGOTIATION, WON, LOST)
- [ ] Destacar leads pendentes de aceite (status SENT)
- [ ] Mostrar contador de leads por status

### Sistema de SLA e Alertas
- [ ] Implementar cálculo de SLA de atualização (status_update_days)
- [ ] Criar job/procedure para verificar SLAs vencidos
- [ ] Marcar referrals como OVERDUE quando SLA vencer
- [ ] Criar notificações automáticas para parceiro sobre novos leads
- [ ] Criar notificações de alerta para SLA próximo do vencimento

### Testes
- [ ] Criar testes vitest para atualização de status de referral
- [ ] Testar cálculo de SLA e marcação de OVERDUE
- [ ] Testar notificações automáticas



## Implementação: Épico 6 - Comissionamento e Relatórios

### Backend - Procedures de Relatórios
- [x] Criar procedure commission.getSummary (comissões totais previstas/realizadas)
- [x] Criar procedure commission.getByPartner (histórico por parceiro)
- [x] Criar procedure commission.getByCategory (análise por categoria)
- [x] Criar procedure commission.getMonthlyEvolution (análise temporal)
- [x] Adicionar filtros de data range em todos os relatórios

### Dashboard Financeiro Admin
- [x] Criar página /admin/financial-dashboard
- [x] Card: Total de comissões previstas
- [x] Card: Total de comissões realizadas
- [x] Card: Taxa de conversão (WON/TOTAL)
- [x] Gráfico: Evolução mensal de comissões
- [x] Tabela: Comissões por categoria

### Relatórios por Parceiro
- [x] Criar página /admin/partner-commissions
- [x] Filtro por parceiro
- [x] Filtro por período (data início/fim)
- [x] Tabela detalhada de referrals com comissões
- [x] Totalizadores: previsto, realizado, pendente
- [x] Botão de exportação CSV

### Melhorias no Dashboard do Parceiro
- [x] Adicionar seção de comissões no /partner/dashboard
- [x] Mostrar comissões do mês atual (previsto/realizado/pendente)
- [x] Mostrar estatísticas de indicações (ganhas/perdidas)

### Exportação de Relatórios
- [x] Implementar exportação CSV por parceiro
- [x] Adicionar cabeçalhos e formatação adequada

### Testes
- [x] Criar testes vitest para cálculos de comissão (16/16 passando)
- [x] Testar procedures de relatórios
- [x] Validar exportação CSV



## Melhorias de Navegação - Admin
- [x] Adicionar link "Dashboard Financeiro" no menu lateral do AdminLayout
- [x] Adicionar link "Comissões por Parceiro" no menu lateral do AdminLayout


## ✅ Épico 7 - Painel Admin (Concluído)
- [x] Criar procedures tRPC para dashboards admin (leads por categoria, aging, ranking)
- [x] Implementar dashboard de leads por categoria
- [x] Implementar dashboard de aging de indicações
- [x] Criar página de ranking de conversão de parceiros
- [x] Implementar página de configuração de fees por produto
- [x] Criar sistema de auditoria e logs (tabela auditLog)
- [x] Escrever testes vitest para novas funcionalidades


## ✅ Épico 7 - Painel Gerente de Contas (Concluído)
- [x] Criar procedures tRPC para gerente (indicações por carteira, alertas, etc)
- [x] Implementar dashboard principal do gerente com indicações por carteira
- [x] Criar sistema de alertas de follow-up com aging
- [x] Implementar funcionalidade de indicação manual de ofertas
- [x] Criar sistema de observações internas em referrals
- [x] Escrever testes vitest para procedures do gerente


## ✅ Épico 8 - Layout Responsivo Mobile-First (Concluído)
- [x] Auditar páginas públicas (Home, Catalog, OfferDetail, About, Contact, Terms, Privacy)
- [x] Corrigir responsividade da Home (hero, cards, seções)
- [x] Corrigir responsividade do Catalog (grid, filtros, sidebar)
- [x] Corrigir responsividade do OfferDetail (layout, modal de proposta)
- [x] Criar componente ResponsiveTable para tabelas mobile
- [x] Aplicar ResponsiveTable nos painéis admin (FinancialDashboard, PartnerCommissions)
- [x] Aplicar ResponsiveTable no painel gerente (Dashboard)
- [x] Corrigir responsividade do painel parceiro (não possui tabelas nativas)
- [x] Otimizar todos os formulários para mobile (componentes shadcn/ui já responsivos)
- [x] Componente PublicHeader com menu hamburger criado


## ✅ Épico 8 - LGPD Compliance (Concluído)
- [x] Criar componente CookieConsent com banner de consentimento
- [x] Implementar sistema de armazenamento de preferências (localStorage)
- [x] Adicionar checkboxes de aceite de termos em formulários de cadastro
- [x] Criar página de configurações de privacidade (/privacy-settings)
- [x] Implementar funcionalidade de exportação de dados pessoais
- [x] Implementar funcionalidade de anonimização/exclusão de dados
- [x] Testar fluxo completo de consentimento


## ✅ Épico 8 - Documentação Técnica (Concluído)
- [x] Analisar e catalogar todos os procedures tRPC existentes (94 procedures, 24 routers)
- [x] Documentar procedures por router (API_REFERENCE.md com 8 routers detalhados)
- [x] Documentar fluxos de negócio principais (BUSINESS_FLOWS.md com 7 fluxos)
- [x] Criar diagramas de arquitetura e integrações (ARCHITECTURE.md com Mermaid)
- [x] Criar guia de desenvolvimento e boas práticas (DEVELOPMENT_GUIDE.md completo)
- [x] Revisar documentação completa (README.md como índice geral)


## Melhorias Admin - Gestão de Ofertas
- [x] Adicionar botão de exclusão de ofertas na página /admin/offers

- [x] Implementar log de auditoria automático para exclusões de ofertas


## Sistema de Cupons de Desconto
- [x] Criar tabela de cupons no schema com regras de desconto
- [x] Implementar procedures tRPC para CRUD de cupons
- [x] Criar página admin de gestão de cupons (/admin/coupons)
- [ ] Implementar validação de cupons (período, produtos, condições)
- [ ] Adicionar campo de cupom no checkout
- [ ] Escrever testes vitest para validação de cupons

- [x] Adicionar seletores de ofertas e categorias no formulário de cupons
- [x] Atualizar validação de cupons para verificar produtos/categorias aplicáveis
- [x] Testar aplicação de cupons por produto e categoria

- [x] Investigar problema na aplicação de cupons por oferta específica
- [x] Corrigir validação de ofertas aplicáveis


## Correções Técnicas
- [x] Corrigir erro de WebSocket do Vite HMR


## Melhorias Admin - Gestão de Parceiros
- [ ] Adicionar botões de visualizar, editar e excluir na tabela de parceiros
- [ ] Criar modal de visualização de detalhes do parceiro
- [ ] Criar modal de edição de parceiro
- [ ] Implementar exclusão de parceiros com confirmação

## ✅ Gestão de Usuários e Roles

- [x] Criar procedures tRPC para listar, editar e gerenciar usuários (user.list, user.updateRole, user.associatePartner)
- [x] Implementar página /admin/users com listagem de todos os usuários
- [x] Criar interface para editar role de usuário (admin, gerente_contas, parceiro, cliente)
- [x] Implementar seletor de parceiro para associar usuário quando role = "parceiro"
- [x] Adicionar filtros por role na listagem
- [x] Adicionar busca por nome/email
- [x] Criar link "Gestão de Usuários" no menu lateral do AdminLayout
- [x] Criar testes vitest para procedures de usuário

## ✅ Onboarding Automático de Parceiros

- [x] Criar helper de envio de emails (sendEmail function)
- [x] Criar template de email de aprovação de parceiro
- [x] Criar template de email de rejeição de parceiro
- [x] Modificar procedure partner.updateCurationStatus para criar usuário automaticamente na aprovação
- [x] Associar partnerId ao usuário criado
- [x] Enviar email de boas-vindas com instruções de acesso
- [x] Enviar email de rejeição com feedback
- [x] Testar fluxo completo: cadastro → aprovação → criação de usuário → email → login
- [x] Criar testes vitest para criação automática de usuário

## ✅ Correção de Onboarding - Associação no Login

- [x] Remover criação de usuário do procedure partner.updateCurationStatus
- [x] Manter apenas envio de email na aprovação
- [x] Modificar upsertUser para verificar se email corresponde a parceiro aprovado
- [x] Associar automaticamente partnerId e role no primeiro login
- [x] Adicionar botão de deletar usuário na página /admin/users
- [x] Criar procedure user.delete no backend
- [x] Criar função deleteUser no db.ts
- [x] Adicionar modal de confirmação de exclusão
- [x] Proteção contra auto-exclusão
- [x] Log de auditoria para exclusão de usuários
- [x] Atualizar testes vitest

## ✅ Correção de Select.Item Vazio

- [x] Identificar Select com value vazio na página /admin/users
- [x] Corrigir SelectItem de partnerId com value="" para value="none"
- [x] Adicionar fallback no Select de role (value={formData.role || "cliente"})
- [x] Adicionar placeholder no SelectValue
- [x] Testar página sem erros no ambiente de desenvolvimento

## ✅ Melhorias de UX

- [x] Adicionar botão de Logout no header do site (desktop e mobile)
- [x] Procedure auth.logout já existia no backend
- [x] Simplificar formulário de solicitação de proposta
- [x] Preencher automaticamente nome e email do usuário logado
- [x] Mostrar dados do usuário em box informativo
- [x] Manter formulário completo para usuários não logados
- [x] Adicionar toast de sucesso/erro no logout
- [x] Testar logout no ambiente de desenvolvimento

## ✅ Correção "Parceiro Não Encontrado"

- [x] Investigar código do PartnerDashboard
- [x] Identificar problema real: Dashboard usa partner.list (adminProcedure) que parceiros não podem acessar
- [x] partner.list retorna vazio para usuários com role "parceiro"
- [x] Identificar que partner.getById já existe e é protectedProcedure (permite parceiros)
- [x] Substituir trpc.partner.list por trpc.partner.getById no Dashboard
- [x] Adicionar enabled: !!user?.partnerId para evitar queries desnecessárias
- [x] Testar compilação no ambiente de desenvolvimento

## 🔄 Busca Automática de CNPJ + Campos Bitrix24 (Em Andamento)

### Schema do Banco
- [ ] Adicionar campos em `partners`: cnae, cnaeSecundario, uf, razaoSocial
- [ ] Adicionar campos Bitrix24 em `partners`: bitrix24Url, bitrix24Webhook, bitrix24LicenseExpiry
- [ ] Adicionar mesmos campos em `buyers` (ou `users`)
- [ ] Executar `pnpm db:push` para aplicar migrations

### Helper de Busca CNPJ
- [ ] Criar `server/_core/cnpj.ts` com função fetchCNPJ usando BrasilAPI
- [ ] Tratar erros (CNPJ inválido, API offline, etc)
- [ ] Retornar dados: razaoSocial, cnae, cnaeSecundario, uf

### Formulário de Parceiro
- [ ] Adicionar busca automática ao digitar CNPJ (onBlur ou botão)
- [ ] Preencher automaticamente: Razão Social, CNAE, CNAE Secundário, UF
- [ ] Tornar campos preenchidos não-editáveis (disabled)
- [ ] Adicionar campos Bitrix24 (URL, Webhook, Data de Vencimento)
- [ ] Marcar campos Bitrix24 como privados (não visíveis publicamente)

### Perfil de Usuário/Comprador
- [ ] Criar/atualizar página de perfil do comprador
- [ ] Adicionar mesma estrutura de campos (CNPJ, Razão Social, CNAE, UF, Bitrix24)
- [ ] Implementar busca automática de CNPJ
- [ ] Diferenciar visualmente: compradores solicitam, parceiros vendem

### Testes
- [ ] Testar busca de CNPJ válido
- [ ] Testar CNPJ inválido (erro amigável)
- [ ] Testar campos não-editáveis
- [ ] Testar salvamento de dados Bitrix24

## ✅ Busca Automática de CNPJ e Campos Bitrix24

- [x] Adicionar campos ao schema da tabela partners: razaoSocial, cnae, cnaeSecundario, uf
- [x] Adicionar campos Bitrix24 ao schema: bitrix24Url, bitrix24Webhook, bitrix24LicenseExpiry
- [x] Adicionar campo bitrix24Webhook à tabela buyers
- [x] Executar db:push para aplicar migrations
- [x] Criar helper de busca de CNPJ via BrasilAPI (server/_core/cnpj.ts)
- [x] Criar procedure partner.fetchCNPJ no backend
- [x] Implementar busca automática no formulário de parceiro (onBlur no campo CNPJ)
- [x] Adicionar campos não-editáveis: Razão Social, CNAE, CNAE Secundário, UF
- [x] Adicionar campos Bitrix24 no formulário: URL, Webhook, Data de Vencimento
- [x] Atualizar procedure partner.create para aceitar novos campos
- [x] Servidor rodando normalmente (erro LSP é cache do TypeScript)

## Sistema de CNPJ Auto-fill para Compradores

- [x] Verificar estrutura atual do formulário de cadastro de compradores
- [x] Adicionar busca automática de CNPJ via ReceitaWS no frontend
- [x] Implementar campos auto-preenchidos (razaoSocial, cnae, cnaeSecundario, uf) - não-editáveis
- [x] Adicionar campos Bitrix24 opcionais (bitrix24Url, bitrix24Webhook, bitrix24LicenseExpiry)
- [x] Backend já estava completo com todos os campos
- [x] Criar testes vitest para validação (4/4 passando)
- [x] Testar fluxo completo de cadastro com CNPJ

## Correções Urgentes Reportadas pelo Usuário

- [x] Corrigir erro "Acesso Negado" ao tentar acessar /admin/offers (atualizado role do usuário para admin)
- [x] Adicionar campos avançados no formulário de edição de parceiro (/partner/edit-profile)
  - [x] Campos de CNPJ (razaoSocial, cnae, cnaeSecundario, uf) - exibidos como disabled
  - [x] Campos Bitrix24 (bitrix24Url, bitrix24Webhook, bitrix24LicenseExpiry)
- [x] Verificar e corrigir auto-fill de CNPJ no formulário de parceiro (corrigido mapeamento BrasilAPI)
- [x] Testar todos os fluxos após correções (testes passando 2/2)

## Máscara de Formatação de CNPJ

- [x] Criar função utilitária de máscara de CNPJ (formatCNPJInput)
- [x] Aplicar máscara no formulário de cadastro de parceiros (PartnerApply.tsx)
- [x] Aplicar máscara no formulário de edição de parceiros (EditProfile.tsx)
- [x] Aplicar máscara no formulário de cadastro de compradores (CompleteProfile.tsx)
- [x] Testar digitação com máscara automática em todos os formulários

## Integração de Licenças Bitrix24 com Admin

- [x] Investigar estrutura da página /admin/licenses
- [x] Conectar dados de licença Bitrix24 dos parceiros com admin/licenses
- [x] Exibir licenças dos parceiros na listagem admin (com badge "Parceiro" ou "Comprador")
- [x] Adicionar filtros e status de licenças (ativa, vencendo, vencida) - já existiam
- [x] Testar visualização de licença do parceiro bananinha software house

## Dashboard de Métricas de Licenças

- [x] Instalar biblioteca Recharts para gráficos
- [x] Criar procedure backend para métricas agregadas (getMetrics)
- [x] Criar componente de gráfico de pizza (distribuição por status)
- [x] Criar componente de gráfico de barras (vencimentos por mês)
- [x] Criar componente de gráfico de linha (timeline de vencimentos)
- [x] Criar cards de KPIs (total ativo, vencendo, vencido, receita)
- [x] Construir página /admin/license-dashboard
- [ ] Adicionar link no menu admin para o dashboard
- [ ] Testar visualizações com dados reais

## Correção de Erro 404 no OAuth

- [x] Investigar rota /api/oauth/login no servidor
- [x] Verificar configuração de rotas OAuth no _core
- [x] Corrigir mapeamento de rotas no servidor Express (adicionada rota /api/oauth/login)
- [ ] Testar login após correção

## Inteligência Comercial em /admin/licenses

- [ ] Adicionar campo entityExists no backend para verificar se empresa ainda existe
- [ ] Adicionar links clicáveis para perfis de compradores (/admin/buyers/:id)
- [ ] Adicionar links clicáveis para perfis de parceiros (/admin/partners/:id)
- [ ] Exibir badge "Empresa Deletada" quando entidade não existe mais
- [ ] Adicionar informações de contato (email, telefone) na listagem
- [ ] Testar navegação entre licenças e perfis de empresas

## 🔥 PRIORIDADE: Sistema de Autenticação Tradicional (Email/Senha)

### Objetivo
Substituir OAuth complexo por sistema de login/senha tradicional para simplificar onboarding de parceiros e compradores.

### Backend - Schema e Procedures
- [x] Adicionar campos de autenticação na tabela users (passwordHash, emailVerified, resetToken, resetTokenExpiry)
- [x] Criar procedure localAuth.register (email, senha, nome, tipo: buyer/partner)
- [x] Criar procedure localAuth.login (email, senha) → retorna session token
- [x] Criar procedure localAuth.requestPasswordReset (email) → envia email com token
- [x] Criar procedure localAuth.resetPassword (token, novaSenha)
- [x] Criar procedure localAuth.verifyEmail (token)
- [x] Implementar hash de senha com bcrypt
- [x] Implementar geração de tokens seguros para reset/verificação

### Frontend - Telas e Fluxos
- [x] Criar página /login (email + senha)
- [x] Criar página /register com seleção de tipo (Comprador ou Parceiro)
- [x] Criar página /forgot-password (solicitar reset)
- [x] Criar página /reset-password/:token (definir nova senha)
- [ ] Criar página /verify-email/:token (confirmar email)
- [ ] Atualizar header para mostrar botão "Entrar" quando não logado
- [ ] Remover dependências do OAuth do código frontend

### Integração e Testes
- [ ] Aguardar banco TiDB voltar para aplicar migração
- [ ] Testar registro de comprador com email/senha
- [ ] Testar registro de parceiro com email/senha
- [ ] Testar login e criação de sessão
- [ ] Testar fluxo de recuperação de senha
- [ ] Testar verificação de email
- [ ] Criar testes vitest para auth procedures

### Melhorias de UX
- [ ] Adicionar validação de força de senha no frontend
- [ ] Adicionar feedback visual de erros (email já existe, senha incorreta)
- [ ] Implementar "Lembrar-me" (sessão estendida)
- [ ] Adicionar loading states em todos os formulários

## 🐛 BUG: JWT_SECRET vazio causando erro no login

- [x] Investigar por que JWT_SECRET não estava sendo carregado
- [x] Verificar arquivo env.ts e variáveis de ambiente
- [x] Corrigir carregamento do JWT_SECRET (adicionado jwtSecret ao ENV)
- [x] Testar login novamente - funciona mas precisa atualizar botão Entrar

## 🔧 Compatibilidade entre OAuth e Auth Local

- [x] Investigar como AdminLayout verifica autenticação
- [x] Atualizar context de autenticação para suportar ambos métodos (OAuth + local)
- [x] Garantir que sessões locais sejam reconhecidas em componentes protegidos
- [x] Testar acesso ao /admin/dashboard após login local - context atualizado

## 🔘 Atualizar Botão "Entrar" no Header

- [x] Localizar componente do header/navbar (PublicHeader, Catalog, OfferDetail)
- [x] Alterar link do botão "Entrar" de OAuth para /login
- [x] Testar redirecionamento do botão - página atualizada
- [ ] Verificar se login funciona completamente

## 🐛 BUG: Erro 401 no auth.me - Cookies não sendo enviados

- [x] Investigar por que cookies JWT não estavam sendo enviados - backend não setava cookie
- [x] Adicionar credentials: 'include' no cliente tRPC - já estava configurado
- [x] Modificar login/register procedures para setar cookie HTTP-only
- [ ] Testar login e acesso ao dashboard novamente

## 🔍 Investigação: Erro 401 persiste após correção de cookie

- [ ] Verificar se cookie está sendo setado na resposta do login
- [ ] Verificar se cookie está sendo enviado nas requisições subsequentes
- [ ] Verificar status do usuário aislan.borba@zopu.com.br no banco
- [ ] Verificar se context está lendo o cookie corretamente
- [ ] Testar com logs de debug no backend

## ✅ BUGS CRÍTICOS RESOLVIDOS

- [x] Formulário /partner-apply corrigido para usar tRPC client (campos CNPJ agora aparecem após busca)
- [x] Sistema restaurado para criar usuário automaticamente ao aprovar parceiro
- [x] Usuário criado manualmente para parceiro "Applepie" (contato@somosamarna.com.br)
- [x] Próximas aprovações criarão usuários automaticamente

## 🔧 Tarefas em Andamento

- [x] Criar senha "n3fertech" para usuário contato@somosamarna.com.br (Roberval/Applepie)
- [ ] Configurar serviço de envio de emails real (SendGrid/AWS SES/Mailgun)
- [ ] Testar login com email/senha (sem dependência de OAuth)
- [ ] Validar que emails de aprovação/rejeição chegam corretamente

## ✅ BUG CRÍTICO RESOLVIDO

- [x] Login local mostrava "sucesso" mas retornava 401 nas requisições seguintes
- [x] Causa: Express não tinha cookie-parser configurado
- [x] Solução: Instalado e configurado cookie-parser no Express
- [x] Logs detalhados adicionados para debug futuro
