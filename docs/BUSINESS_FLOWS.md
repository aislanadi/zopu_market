# Fluxos de Negócio - ZOPUMarket

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Autor:** Manus AI

---

## Introdução

Este documento detalha os principais fluxos de negócio do ZOPUMarket, explicando como as diferentes entidades do sistema interagem para criar valor. Os fluxos cobrem desde a curadoria de parceiros até o fechamento de negócios e pagamento de comissões.

---

## 1. Fluxo de Curadoria de Parceiros

O processo de curadoria garante que apenas parceiros qualificados sejam aprovados no marketplace, mantendo a qualidade das ofertas e a confiança dos compradores.

### 1.1 Etapas do Fluxo

**Etapa 1: Candidatura**

O parceiro interessado acessa `/partner/apply` e preenche um formulário completo com informações da empresa, incluindo nome fantasia, CNPJ, contato principal, website, descrição dos serviços e documentação comprobatória. O sistema cria um registro na tabela `partners` com `curationStatus = PENDING` e envia notificação automática para a equipe administrativa.

**Etapa 2: Análise Administrativa**

A equipe admin acessa `/admin/partners` e visualiza todos os parceiros pendentes. Para cada candidatura, o admin pode visualizar documentos anexados, verificar informações cadastrais, consultar reputação no mercado e validar capacidade de entrega. O sistema registra todas as visualizações e ações na tabela `auditLogs` para rastreabilidade completa.

**Etapa 3: Decisão de Curadoria**

O admin utiliza o procedure `partner.updateCurationStatus` para aprovar ou rejeitar a candidatura. Em caso de aprovação, o sistema atualiza `curationStatus = APPROVED`, define `approvedAt = NOW()`, envia email de boas-vindas ao parceiro, libera acesso ao dashboard `/partner/dashboard` e gera log de auditoria. Em caso de rejeição, o sistema atualiza `curationStatus = REJECTED`, define `rejectedAt = NOW()`, registra `rejectionReason` fornecido pelo admin, envia email com feedback ao parceiro e gera log de auditoria.

**Etapa 4: Onboarding**

Após aprovação, o parceiro recebe credenciais de acesso e um guia de onboarding. O sistema automaticamente atribui `tier = BRONZE` inicial e habilita criação de ofertas (que também passam por aprovação). O parceiro pode configurar integração Bitrix24 via `/partner/dashboard` para sincronização automática de leads.

### 1.2 Procedures Envolvidos

| Procedure | Responsável | Descrição |
|-----------|-------------|-----------|
| `partner.create` | Admin | Cria registro inicial do parceiro |
| `partner.listByStatus` | Admin | Lista parceiros por status de curadoria |
| `partner.getById` | Admin | Visualiza detalhes completos da candidatura |
| `partner.updateCurationStatus` | Admin | Aprova ou rejeita parceiro |
| `audit.list` | Admin | Consulta histórico de ações |

### 1.3 Regras de Negócio

O sistema implementa diversas regras para garantir a qualidade do processo de curadoria. Apenas administradores podem aprovar ou rejeitar parceiros, e a rejeição exige motivo obrigatório que será compartilhado com o candidato. Uma vez aprovado, o parceiro não pode ser rejeitado novamente sem justificativa documentada. Parceiros rejeitados podem se candidatar novamente após 30 dias, desde que corrijam os problemas apontados. Todas as decisões de curadoria geram notificações automáticas por email e são registradas permanentemente nos logs de auditoria.

---

## 2. Fluxo de Criação e Aprovação de Ofertas

As ofertas são os produtos/serviços disponibilizados pelos parceiros no marketplace. Este fluxo garante que apenas ofertas de qualidade sejam publicadas.

### 2.1 Etapas do Fluxo

**Etapa 1: Criação da Oferta**

O parceiro acessa `/partner/dashboard` e clica em "Nova Oferta". O formulário solicita categoria (obrigatória), título atrativo (máx. 100 caracteres), descrição detalhada (markdown suportado), preço sugerido (opcional), imagem de destaque (recomendado), taxa de success fee (percentual de comissão por indicação), taxa de split ZOPU (percentual da ZOPU em checkouts) e taxa de split do parceiro (percentual do parceiro em checkouts). O sistema valida que `successFeePercent + zopuTakeRatePercent + partnerSharePercent = 100%` e cria a oferta com `status = PENDING`.

**Etapa 2: Revisão Administrativa**

A equipe admin recebe notificação de nova oferta pendente e acessa `/admin/pending-offers`. Para cada oferta, o admin verifica conformidade com políticas do marketplace, qualidade da descrição e imagens, adequação da categoria, razoabilidade das taxas de comissionamento e ausência de conteúdo proibido ou enganoso.

**Etapa 3: Decisão de Aprovação**

O admin utiliza `offer.approve` para publicar a oferta ou `offer.reject` com motivo detalhado. Em caso de aprovação, o sistema atualiza `status = APPROVED`, define `approvedAt = NOW()`, torna a oferta visível no catálogo público, envia notificação ao parceiro e gera log de auditoria. Em caso de rejeição, o sistema atualiza `status = REJECTED`, registra `rejectionReason`, envia feedback ao parceiro com sugestões de melhoria, permite que o parceiro edite e reenvie e gera log de auditoria.

**Etapa 4: Publicação**

Ofertas aprovadas aparecem automaticamente em `/catalog` com filtros por categoria, no perfil público do parceiro em `/partner/:id`, nos resultados de busca via `search.unified` e nas recomendações personalizadas para compradores. O sistema também indexa a oferta para SEO e atualiza métricas de analytics.

### 2.2 Procedures Envolvidos

| Procedure | Responsável | Descrição |
|-----------|-------------|-----------|
| `offer.create` | Parceiro | Cria nova oferta (status PENDING) |
| `offer.getPending` | Admin | Lista ofertas aguardando aprovação |
| `offer.getById` | Admin | Visualiza detalhes da oferta |
| `offer.approve` | Admin | Aprova oferta para publicação |
| `offer.reject` | Admin | Rejeita oferta com motivo |
| `offer.update` | Parceiro/Admin | Atualiza oferta existente |
| `offer.delete` | Admin | Remove oferta do sistema |

### 2.3 Regras de Negócio

O sistema aplica regras rigorosas para manter a qualidade do marketplace. Parceiros só podem criar ofertas após aprovação na curadoria, e cada oferta criada por parceiro inicia com status PENDING. Ofertas rejeitadas podem ser editadas e reenviadas quantas vezes necessário. Ofertas aprovadas podem ser editadas pelo parceiro, mas grandes mudanças (categoria, preços) podem requerer nova aprovação. Apenas administradores podem excluir ofertas permanentemente. Ofertas com indicações ativas não podem ser excluídas, apenas desativadas. As taxas de comissionamento são definidas na criação e só podem ser alteradas por administradores.

---

## 3. Fluxo de Indicação de Leads

Este é o fluxo central do marketplace, onde compradores manifestam interesse em ofertas e são conectados aos parceiros.

### 3.1 Etapas do Fluxo

**Etapa 1: Descoberta da Oferta**

O comprador navega pelo catálogo em `/catalog`, utiliza filtros por categoria ou busca, visualiza detalhes da oferta em `/offer/:id`, lê descrição completa, imagens e casos de sucesso e decide manifestar interesse. O sistema rastreia todas as interações via `analytics.track` para métricas de funil.

**Etapa 2: Submissão da Proposta**

O comprador clica em "Solicitar Proposta" e preenche formulário com nome completo, email corporativo, telefone (opcional), nome da empresa, CNPJ (validado), mensagem descrevendo a necessidade e checkbox de aceite de termos (LGPD). O sistema valida os dados, cria registro na tabela `referrals` com `status = PENDING`, define `slaDeadline = NOW() + 48 horas`, atribui `gerenteId` automaticamente (round-robin ou por categoria) e envia notificações.

**Etapa 3: Notificações Automáticas**

O sistema dispara notificações simultâneas para múltiplos destinatários. O parceiro recebe email com dados do lead e prazo de resposta (48h), além de notificação in-app em `/partner/dashboard`. O gerente de contas responsável recebe notificação de nova indicação em sua carteira. O comprador recebe confirmação de recebimento da solicitação. Se configurado, o sistema envia lead para Bitrix24 do parceiro via webhook.

**Etapa 4: Aceite do Parceiro**

O parceiro acessa `/partner/dashboard`, visualiza novos leads na seção "Indicações Pendentes", analisa fit com seu portfólio e utiliza `referral.updateStatus` para aceitar (`ACCEPTED`) ou recusar. Em caso de aceite, o sistema atualiza `status = ACCEPTED`, envia email ao comprador com contato do parceiro, notifica gerente de contas e inicia contagem de SLA de negociação. Em caso de recusa, o sistema pode redirecionar o lead para outro parceiro da mesma categoria.

**Etapa 5: Negociação**

Parceiro e comprador negociam diretamente (fora da plataforma). O parceiro atualiza status conforme progresso: `IN_PROGRESS` quando inicia proposta comercial, `WON` quando fecha negócio ou `LOST` quando perde oportunidade (com motivo). O sistema envia lembretes automáticos se não houver atualização em 7 dias e alerta gerente se SLA estiver próximo do vencimento.

**Etapa 6: Fechamento**

Quando o parceiro marca como `WON`, o sistema calcula comissão baseada em `offer.successFeePercent`, cria registro na tabela `commissions` com `status = PENDING`, notifica admin sobre comissão a pagar, atualiza métricas de conversão do parceiro e gera log de auditoria. Se marcado como `LOST`, o sistema registra `lostReason`, atualiza métricas de conversão e encerra a indicação sem comissão.

### 3.2 Procedures Envolvidos

| Procedure | Responsável | Descrição |
|-----------|-------------|-----------|
| `leadRequest.submit` | Comprador | Submete proposta inicial |
| `referral.list` | Parceiro/Admin | Lista indicações |
| `referral.getById` | Parceiro/Admin | Visualiza detalhes do lead |
| `referral.updateStatus` | Parceiro/Admin | Atualiza status da indicação |
| `referral.checkOverdueSLAs` | Sistema (cron) | Identifica SLAs vencidos |
| `gerente.getMyReferrals` | Gerente | Lista indicações da carteira |
| `gerente.updateInternalNotes` | Gerente | Adiciona observações internas |

### 3.3 Máquina de Estados

O fluxo de indicação segue uma máquina de estados rigorosa que impede transições inválidas:

```
PENDING → ACCEPTED → IN_PROGRESS → WON
                                  ↘ LOST
```

**Transições Permitidas:**
- `PENDING` → `ACCEPTED`: Parceiro aceita o lead
- `ACCEPTED` → `IN_PROGRESS`: Parceiro inicia negociação
- `IN_PROGRESS` → `WON`: Negócio fechado com sucesso
- `IN_PROGRESS` → `LOST`: Oportunidade perdida
- Qualquer estado → `LOST`: Admin pode forçar encerramento

**Transições Proibidas:**
- `PENDING` → `WON`: Não pode pular etapas
- `WON` → `LOST`: Não pode reverter fechamento
- `LOST` → qualquer: Estado terminal

### 3.4 Regras de SLA

O sistema implementa SLA (Service Level Agreement) rigoroso para garantir qualidade no atendimento:

**SLA de Resposta Inicial:** 48 horas para o parceiro aceitar ou recusar o lead após recebimento. Alertas automáticos são enviados em 24h (50% do prazo), 40h (83% do prazo) e no vencimento. Vencimento sem resposta notifica admin e gerente de contas.

**SLA de Atualização:** Indicações em `ACCEPTED` ou `IN_PROGRESS` devem ser atualizadas a cada 7 dias. O procedure `referral.checkOverdueSLAs` identifica indicações sem atualização e dispara alertas. Gerentes recebem relatório diário de indicações sem follow-up via `gerente.getFollowUpAlerts`.

**Penalidades por Descumprimento:** Parceiros com múltiplos descumprimentos de SLA podem ter tier rebaixado, indicações redirecionadas para outros parceiros ou suspensão temporária de novas indicações.

---

## 4. Fluxo de Comissionamento

O sistema de comissionamento garante que parceiros sejam remunerados corretamente por indicações bem-sucedidas.

### 4.1 Etapas do Fluxo

**Etapa 1: Geração da Comissão**

Quando uma indicação é marcada como `WON`, o sistema automaticamente calcula o valor da comissão usando a fórmula `commission = dealValue * (offer.successFeePercent / 100)`. O sistema então cria registro na tabela `commissions` com `status = PENDING`, `referralId` vinculado, `partnerId` do parceiro, `amount` calculado e `createdAt = NOW()`. Uma notificação é enviada ao parceiro informando sobre a comissão gerada.

**Etapa 2: Validação Administrativa**

A equipe financeira acessa `/admin/financial` e visualiza todas as comissões pendentes através de `commission.getSummary`. Para cada comissão, o admin verifica se o negócio foi realmente fechado, valida o valor informado pelo parceiro, confirma documentação fiscal (nota fiscal, contrato) e aprova o pagamento.

**Etapa 3: Processamento de Pagamento**

Após validação, o admin marca a comissão como paga no sistema, atualizando `status = PAID` e `paidAt = NOW()`. O sistema envia comprovante de pagamento ao parceiro, atualiza dashboard financeiro do parceiro em `/partner/dashboard` e gera log de auditoria da transação.

**Etapa 4: Relatórios e Analytics**

O sistema mantém relatórios em tempo real acessíveis via diversos procedures. O `commission.getByPartner` permite que parceiros visualizem seu histórico de comissões. O `commission.getByCategory` mostra performance por categoria para análise estratégica. O `commission.getMonthlyEvolution` gera gráficos de evolução temporal. O `commission.exportCSV` permite exportação para contabilidade.

### 4.2 Procedures Envolvidos

| Procedure | Responsável | Descrição |
|-----------|-------------|-----------|
| `commission.getSummary` | Admin | Resumo financeiro geral |
| `commission.getByPartner` | Admin/Parceiro | Comissões de um parceiro |
| `commission.getByCategory` | Admin | Comissões por categoria |
| `commission.getMonthlyEvolution` | Admin | Evolução temporal |
| `commission.exportCSV` | Admin | Exportação para contabilidade |

### 4.3 Regras de Negócio

O sistema aplica regras específicas para garantir transparência e correção no comissionamento. Comissões são geradas automaticamente apenas quando `referral.status = WON`, e o valor da comissão é calculado com base no `successFeePercent` definido na oferta. Parceiros não podem editar valores de comissão após geração. Apenas administradores podem marcar comissões como pagas. Comissões pendentes há mais de 30 dias geram alertas automáticos. O sistema mantém histórico completo de todas as transações financeiras. Relatórios financeiros são acessíveis apenas por admin e pelo parceiro dono da comissão.

---

## 5. Fluxo de Gestão de Carteira (Gerente de Contas)

Gerentes de contas são responsáveis por acompanhar indicações e garantir conversão.

### 5.1 Etapas do Fluxo

**Etapa 1: Atribuição Automática**

Quando um novo lead é criado via `leadRequest.submit`, o sistema automaticamente atribui um gerente de contas através de algoritmo de distribuição. O algoritmo considera carga atual de cada gerente (balanceamento), especialização por categoria (se configurado) e disponibilidade (status ativo). O gerente recebe notificação imediata da nova atribuição.

**Etapa 2: Monitoramento Ativo**

O gerente acessa `/gerente/dashboard` diariamente e utiliza `gerente.getDashboardStats` para visualizar métricas da carteira. O dashboard exibe total de indicações ativas, taxa de conversão atual, comissões geradas no mês, tempo médio de resposta dos parceiros e alertas de SLA. O gerente também acessa `gerente.getFollowUpAlerts` para identificar indicações que precisam de atenção.

**Etapa 3: Intervenção Proativa**

Quando identifica problemas, o gerente pode utilizar `gerente.updateInternalNotes` para registrar observações não visíveis ao parceiro ou comprador, entrar em contato direto com parceiro ou comprador para acelerar negociação, criar indicações manuais via `gerente.createManualReferral` quando identifica oportunidades e escalar casos problemáticos para a equipe admin.

**Etapa 4: Análise de Performance**

O gerente utiliza relatórios para identificar parceiros com baixa conversão, categorias com maior demanda, gargalos no funil de vendas e oportunidades de melhoria no processo.

### 5.2 Procedures Envolvidos

| Procedure | Responsável | Descrição |
|-----------|-------------|-----------|
| `gerente.getMyReferrals` | Gerente | Lista indicações da carteira |
| `gerente.getFollowUpAlerts` | Gerente | Alertas de follow-up |
| `gerente.createManualReferral` | Gerente | Cria indicação assistida |
| `gerente.updateInternalNotes` | Gerente | Adiciona observações |
| `gerente.getDashboardStats` | Gerente | Métricas do dashboard |

### 5.3 Regras de Negócio

O papel do gerente de contas segue regras específicas no sistema. Gerentes podem visualizar todas as indicações de sua carteira, independentemente do status. Gerentes podem adicionar observações internas, mas não podem alterar status de indicações (apenas parceiros e admins). Indicações manuais criadas por gerentes são marcadas com `type = ASSISTED_REFERRAL` para diferenciação. Gerentes recebem notificações automáticas de SLAs vencidos em sua carteira. Métricas de performance de gerentes são acessíveis apenas por administradores.

---

## 6. Fluxo de Analytics e Métricas

O sistema coleta e processa métricas em tempo real para tomada de decisão.

### 6.1 Métricas Coletadas

**Métricas de Funil:**
- Visualizações de ofertas (`analytics.track` com `event = VIEW_OFFER`)
- Cliques em "Solicitar Proposta" (`event = CLICK_REQUEST`)
- Propostas submetidas (`event = SUBMIT_PROPOSAL`)
- Taxa de conversão por etapa

**Métricas de Parceiros:**
- Total de indicações recebidas
- Taxa de aceite de leads
- Taxa de conversão (WON / TOTAL)
- Tempo médio de resposta
- Comissões geradas
- Ranking de performance (`adminDashboard.getConversionRanking`)

**Métricas de Ofertas:**
- Visualizações totais
- Taxa de conversão (propostas / visualizações)
- Leads gerados por categoria (`adminDashboard.getLeadsByCategory`)
- Ofertas mais populares

**Métricas Financeiras:**
- Comissões totais geradas
- Comissões pagas vs pendentes
- Receita ZOPU vs receita parceiros
- Evolução mensal (`commission.getMonthlyEvolution`)

### 6.2 Procedures Envolvidos

| Procedure | Responsável | Descrição |
|-----------|-------------|-----------|
| `analytics.track` | Sistema | Registra evento de analytics |
| `analytics.getPartnerMetrics` | Admin/Parceiro | Métricas de parceiro |
| `analytics.exportReport` | Admin | Exporta relatório completo |
| `adminDashboard.getLeadsByCategory` | Admin | Leads por categoria |
| `adminDashboard.getAgingReport` | Admin | Aging de indicações |
| `adminDashboard.getConversionRanking` | Admin | Ranking de parceiros |

### 6.3 Dashboards Disponíveis

**Dashboard Admin (`/admin/analytics`):**
- Leads por categoria com taxa de conversão
- Aging report de indicações (0-7, 8-15, 16-30, 30+ dias)
- Gráficos de evolução temporal
- Métricas de SLA (cumprimento vs vencimento)

**Dashboard Financeiro (`/admin/financial`):**
- Resumo de comissões (total, pago, pendente)
- Gráfico de evolução mensal
- Top 10 parceiros por comissão
- Relatório por categoria

**Dashboard Parceiro (`/partner/dashboard`):**
- Indicações recebidas (total, ativas, convertidas)
- Taxa de conversão pessoal
- Comissões geradas no mês
- Histórico de comissões

**Dashboard Gerente (`/gerente/dashboard`):**
- Indicações na carteira (total, ativas, convertidas)
- Taxa de conversão da carteira
- Alertas de follow-up
- Tempo médio de resposta

---

## 7. Fluxo de Auditoria e Compliance

O sistema mantém rastreabilidade completa de todas as ações críticas para conformidade com LGPD e auditorias internas.

### 7.1 Eventos Auditados

Todas as operações críticas geram registros na tabela `auditLogs` através da função `createAuditLog`. Os eventos incluem:

**Gestão de Parceiros:**
- `CREATE_PARTNER`: Criação de novo parceiro
- `UPDATE_PARTNER`: Atualização de dados do parceiro
- `APPROVE_PARTNER`: Aprovação na curadoria
- `REJECT_PARTNER`: Rejeição na curadoria
- `UPDATE_TIER`: Mudança de tier do parceiro

**Gestão de Ofertas:**
- `CREATE_OFFER`: Criação de nova oferta
- `UPDATE_OFFER`: Atualização de oferta
- `DELETE_OFFER`: Exclusão de oferta
- `APPROVE_OFFER`: Aprovação de oferta
- `REJECT_OFFER`: Rejeição de oferta

**Gestão de Indicações:**
- `UPDATE_REFERRAL_STATUS`: Mudança de status de indicação
- `CREATE_MANUAL_REFERRAL`: Indicação manual por gerente
- `UPDATE_INTERNAL_NOTES`: Atualização de observações

**Gestão Financeira:**
- `MARK_COMMISSION_PAID`: Pagamento de comissão
- `UPDATE_PAYMENT_INFO`: Atualização de dados bancários

**Gestão de Categorias:**
- `CREATE_CATEGORY`: Criação de categoria
- `UPDATE_CATEGORY`: Atualização de categoria
- `DELETE_CATEGORY`: Exclusão de categoria

### 7.2 Estrutura do Log

Cada registro de auditoria contém as seguintes informações:

```typescript
{
  id: number;              // ID único do log
  userId: number;          // Quem executou a ação
  action: string;          // Tipo de ação (enum acima)
  entityType: string;      // Tipo de entidade afetada
  entityId: number | null; // ID da entidade (se aplicável)
  oldValue: string | null; // Valor anterior (JSON)
  newValue: string | null; // Novo valor (JSON)
  createdAt: Date;         // Timestamp da ação
}
```

### 7.3 Consulta de Logs

Administradores podem consultar logs através de `adminDashboard.getAuditLogs` com diversos filtros:

- Por usuário: Todas as ações de um usuário específico
- Por ação: Todas as ocorrências de um tipo de ação
- Por entidade: Histórico completo de uma entidade
- Por período: Logs em um intervalo de datas
- Combinações: Múltiplos filtros simultâneos

A interface em `/admin/audit-logs` permite visualização amigável com filtros, busca e exportação para CSV.

### 7.4 Retenção e Privacidade

Os logs de auditoria seguem políticas específicas de retenção e privacidade:

- Logs são mantidos por 5 anos para conformidade legal
- Dados pessoais em logs são anonimizados após 2 anos
- Usuários podem solicitar exportação de seus logs (LGPD)
- Logs não podem ser editados ou excluídos (imutabilidade)
- Acesso aos logs é restrito a administradores
- Todas as consultas aos logs são registradas (meta-auditoria)

---

## Conclusão

Os fluxos de negócio do ZOPUMarket foram projetados para criar um marketplace B2B eficiente, transparente e escalável. A combinação de automação inteligente, rastreabilidade completa e intervenção humana estratégica garante alta qualidade nas conexões entre compradores e parceiros.

**Princípios Fundamentais:**

**Transparência:** Todas as ações críticas são auditadas e rastreáveis, garantindo accountability completa em todo o sistema.

**Qualidade:** Processos de curadoria rigorosos garantem que apenas parceiros e ofertas qualificados sejam publicados no marketplace.

**Eficiência:** Automação inteligente reduz atrito no processo de indicação e acelera o fechamento de negócios.

**Escalabilidade:** Arquitetura preparada para crescimento exponencial sem perda de qualidade ou performance.

**Compliance:** Conformidade total com LGPD e boas práticas de proteção de dados pessoais.

Para implementar novos fluxos ou modificar os existentes, consulte o código-fonte em `server/routers.ts` e `server/db.ts`, mantendo sempre a consistência com os princípios documentados neste guia.
